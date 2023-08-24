import { networkSettings } from 'stores/settings'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { ConvertBoneName } from './utils/ConvertBoneName'
import { Euler, Quaternion } from 'three'
import { VRMRigs } from 'stores/RigController'
import { getGlobalRotation } from './utils/GetGlobalRotation'

class NetworkHandler {
  private ws_: WebSocket | undefined = undefined
  private oscAddressHead = '/violet-marionette/'
  private numberOfDigits = 4

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
    if (!vrm.humanoid) return ``
    if (!trackingTargetName) return ``
    if (!this.ws_) return ``

    const boneNode = vrm.humanoid.getBoneNode(trackingTargetName)!
    const position = boneNode.position
    const offset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
    const quaternion = new Quaternion().multiplyQuaternions(
      offset,
      getGlobalRotation(boneNode),
    )

    if (!position) return ``
    if (!boneNode) return ``
    return (
      `#` +
      `${ConvertBoneName(trackingTargetName)},` +
      `${-position.x.toFixed(this.numberOfDigits)},` +
      `${position.y.toFixed(this.numberOfDigits)},` +
      `${position.z.toFixed(this.numberOfDigits)},` +
      `${quaternion.x.toFixed(this.numberOfDigits)},` +
      `${-quaternion.y.toFixed(this.numberOfDigits)},` +
      `${-quaternion.z.toFixed(this.numberOfDigits)},` +
      `${quaternion.w.toFixed(this.numberOfDigits)} `
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

  SendPoseMessage(vrm: VRM, rig: VRMRigs) {
    if (!vrm.humanoid) return
    if (!rig) return
    let msg = ''

    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Hips)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Spine)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Chest)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.UpperChest)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Neck)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Head)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftShoulder)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftUpperArm)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftLowerArm)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftUpperLeg)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftLowerLeg)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftFoot)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftToes)
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightShoulder,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightUpperArm,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLowerArm,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightUpperLeg,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLowerLeg,
    )
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightFoot)
    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightToes)

    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftHand)
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftThumbProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftThumbIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftThumbDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftIndexProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftIndexIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftIndexDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftMiddleProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftMiddleIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftMiddleDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftRingProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftRingIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftRingDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLittleProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLittleIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLittleDistal,
    )

    msg += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightHand)
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightThumbProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightThumbIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightThumbDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightIndexProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightIndexIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightIndexDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightMiddleProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightMiddleIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightMiddleDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightRingProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightRingIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightRingDistal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLittleProximal,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLittleIntermediate,
    )
    msg += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLittleDistal,
    )

    this.ws_?.send(msg)
  }
}
const networkHandler = new NetworkHandler()
export default networkHandler
