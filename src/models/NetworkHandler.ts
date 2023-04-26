import { /*trackingSettings,*/ networkSettings } from 'stores/settings'
import { VRMRigs } from 'stores/RigController'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { GLTFNode } from '@pixiv/three-vrm'
// import { Vector3 } from 'three'

class NetworkHandler {
  private ws_: WebSocket | null = null
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
    bodyNode: GLTFNode | null,
  ): void {
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
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head),
      )

    if (rig.pose) {
      if (rig.leftHand)
        this.SendTrackingMessage(
          'Hand_L',
          vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.LeftHand),
        )
      if (rig.rightHand) {
        this.SendTrackingMessage(
          'Hand_R',
          vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.RightHand),
        )
      }
    }
  }
}

const networkHandler = new NetworkHandler()
export default networkHandler
