import { /*trackingSettings,*/ networkSettings } from 'stores/settings'
import { VRMRigs } from 'stores/RigController'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
// import { vrmAvatar } from 'stores/VRMAvatar'
import { ConvertBoneName } from './utills/ConvertBoneName'

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

  private AddTrackingMessage(
    vrm: VRM,
    trackingTargetName: VRMSchema.HumanoidBoneName,
  ): string {
    if (!vrm) return ``
    if (!trackingTargetName) return ``
    if (!this.ws_) return ``

    let position = vrm.humanoid?.getBoneNode(trackingTargetName)?.position
    let quaternion = vrm.humanoid?.getBoneNode(trackingTargetName)?.quaternion
    // const trackingAddressHead = this.oscAddressHead + 'Joint/'

    if (!position) return ``
    if (!quaternion) return ``
    return `#` + `${ConvertBoneName(trackingTargetName)},` +
      `${this.DecimalNumber(position.x)},` +
      `${this.DecimalNumber(position.y)},` +
      `${this.DecimalNumber(position.z)},` +
      `${this.DecimalNumber(quaternion.x)},` +
      `${this.DecimalNumber(quaternion.y)},` +
      `${this.DecimalNumber(quaternion.z)},` +
      `${this.DecimalNumber(quaternion.w)}`
  }

  // private getGlobalTransform(bodyNode: VRMHumanBone | undefined) {
  //   if (!bodyNode) return
  //   const transform = {
  //     position: new Vector3(0, 0, 0),
  //     quaternion: new Quaternion(0, 0, 0, 1),
  //   }
  //   let i_node = bodyNode.node
  //   let i_count = 0
  //   const root = vrmAvatar.vrm?.humanoid?.getBone(
  //     VRMSchema.HumanoidBoneName.Hips,
  //   )?.node.name
  //   const UPPER_LIMIT = 16
  //   while (i_node.name !== root && i_count <= UPPER_LIMIT) {
  //     let pos: Vector3 = i_node.position.clone()
  //     transform.position.add(pos.applyQuaternion(i_node.quaternion))
  //     transform.quaternion.multiply(i_node.quaternion)
  //     if (i_node.parent) i_node = i_node.parent
  //     i_count++
  //   }

  //   const coef = bodyNode.node.name === 'head' ? 3 : 0.3
  //   transform.position.multiplyScalar(coef)
  //   transform.quaternion.w *= -1
  //   return transform
  // }

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

    let msg = ''

    if (rig.face) {
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Head)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Neck)
    }

    if (rig.pose) {
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Hips)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Spine)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Chest)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.UpperChest)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftShoulder)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftUpperArm)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftLowerArm)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftUpperLeg)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftLowerLeg)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftFoot)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftToes)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightShoulder)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightUpperArm)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightLowerLeg)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightUpperLeg)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightLowerLeg)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightFoot)
      msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightToes)

      // if (rig.leftHand) {
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftHand)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftThumbProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftThumbIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftThumbDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftIndexProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftIndexIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftIndexDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftMiddleProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftMiddleIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftMiddleDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftRingProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftRingIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftRingDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftLittleProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftLittleIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftLittleDistal)
      // }
      // if (rig.rightHand) {
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightHand)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightThumbProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightThumbIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightThumbDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightIndexProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightIndexIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightIndexDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightMiddleProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightMiddleIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightMiddleDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightRingProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightRingIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightRingDistal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightLittleProximal)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightLittleIntermediate)
      //   msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightLittleDistal)
      // }
    }
    this.ws_?.send(msg)
  }
}

const networkHandler = new NetworkHandler()
export default networkHandler
