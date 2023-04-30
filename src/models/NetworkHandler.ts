import { /*trackingSettings,*/ networkSettings } from 'stores/settings'
import { VRMRigs } from 'stores/RigController'
import { VRM, VRMHumanBone, VRMSchema } from '@pixiv/three-vrm'
import { Quaternion, Vector3 } from 'three'
import { vrmAvatar } from 'stores/VRMAvatar'

interface Transform {
  position: Vector3
  quaternion: Quaternion
}

class NetworkHandler {
  private ws_: WebSocket | undefined = undefined
  private oscAddressHead = '/violet-marionette/'

  constructor() {
    this.ConnectWS()
  }

  ConnectWS(): void {
    if (this.ws_) this.ws_.close()
    this.ws_ = new WebSocket(networkSettings.getOrigin)
  }

  private SendTrackingMessage(
    trackingTargetAddress: string,
    bodyNode: Transform | undefined,
  ): void {
    if (!bodyNode) return
    if (!this.ws_) return
    const trackingAddressHead = this.oscAddressHead + 'Joint/'
    // this.ws_.send(
    //   `${trackingAddressHead + trackingTargetAddress},
    //   ${bodyNode?.position.multiplyScalar(trackingSettings.getTrackingCoef)},
    //   ${bodyNode?.quaternion}`
    // )
    this.ws_.send(
      `${trackingAddressHead + trackingTargetAddress},` +
        `${this.DecimalNumber(bodyNode?.position.x!)},` +
        `${this.DecimalNumber(bodyNode?.position.y!)},` +
        `${this.DecimalNumber(bodyNode?.position.z!)},` +
        `${this.DecimalNumber(bodyNode?.quaternion.x!)},` +
        `${this.DecimalNumber(bodyNode?.quaternion.y!)},` +
        `${this.DecimalNumber(bodyNode?.quaternion.z!)},` +
        `${this.DecimalNumber(bodyNode?.quaternion.w!)}`,
    )
  }

  private getGlobalTransform(bodyNode: VRMHumanBone | undefined) {
    if (!bodyNode) return
    const transform = {
      position: new Vector3(0, 0, 0),
      quaternion: new Quaternion(0, 0, 0, 1),
    }
    let i_node = bodyNode.node
    let i_count = 0
    const root = vrmAvatar.vrm?.humanoid?.getBone(
      VRMSchema.HumanoidBoneName.Hips,
    )?.node.name
    const UPPER_LIMIT = 16
    while (i_node.name !== root && i_count <= UPPER_LIMIT) {
      let pos: Vector3 = i_node.position.clone()
      transform.position.add(pos.applyQuaternion(i_node.quaternion))
      transform.quaternion.multiply(i_node.quaternion)
      if (i_node.parent) i_node = i_node.parent
      i_count++
    }

    const coef = bodyNode.node.name === 'head' ? 3 : 0.3
    transform.position.multiplyScalar(coef)
    transform.quaternion.w *= -1
    return transform
  }

  SendConfigMessage(
    configTargetAddress: string,
    values: string | number,
  ): void {
    if (!this.ws_) return
    const configAddressHead = this.oscAddressHead + 'config/'
    this.ws_.send(`${configAddressHead + configTargetAddress}, ${values} `)
  }

  private DecimalNumber(num: number): number {
    return Math.abs(num) < 10 ** -6 ? 0 : num
  }
  // Almost all parts of VRMRigs don't have position,
  // but VRM's Bone Nodes has both position and quaternion.
  // Because of that, I make to use VRM as a tracking reference instead of VRMRigs.

  // Fixme: trackingSettings.Coef is not based on USER HEIGHT because tracking data is
  //        based on vrm avatar.
  SendPoseMessage(vrm: VRM, rig: VRMRigs) {
    if (!vrm.humanoid) return
    if (!rig) return

    if (rig.face)
      this.SendTrackingMessage(
        'Head',
        this.getGlobalTransform(
          vrm.humanoid.getBone(VRMSchema.HumanoidBoneName.Head)!,
        ),
      )

    if (rig.pose) {
      if (rig.leftHand)
        this.SendTrackingMessage(
          'Hand_L',
          this.getGlobalTransform(
            vrm.humanoid.getBone(VRMSchema.HumanoidBoneName.LeftHand)!,
          ),
        )
      if (rig.rightHand) {
        this.SendTrackingMessage(
          'Hand_R',
          this.getGlobalTransform(
            vrm.humanoid.getBone(VRMSchema.HumanoidBoneName.RightHand)!,
          ),
        )
      }
    }
  }
}

const networkHandler = new NetworkHandler()
export default networkHandler
