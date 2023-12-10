import { networkSettings } from 'stores/userSettings'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { ConvertBoneName /*, local2world */ } from './utils'
import { Euler, Quaternion } from 'three'
import { MotionLPF } from './motionLPF'
import { HumanoidBoneNameKey } from 'types'

type ConnectionType = 'resoniteClient' | 'webClient' | 'server'
type MessageType =
  | 'trackingData'
  | 'websocketSetting'
  | 'connectionCheck'
  | 'notification'
interface VmMessage {
  userName: string
  connectionType: ConnectionType
  messageType: MessageType
  data: string | VmAttribute
}
type VmData = Pick<VmMessage, 'messageType' | 'data'>
type VmAttribute = Pick<VmMessage, 'userName' | 'connectionType'>
const _connectionType = 'webClient'

class NetworkHandler {
  private _ws: WebSocket | undefined = undefined
  private _numberOfDigits = 7
  private _connectionCheckInterval = 5 * 1000 // [ms]
  private _checkTimer: NodeJS.Timeout | undefined
  private _motionLPF: MotionLPF

  get existWebsocket() {
    return !!this._ws
  }
  get motionLPF() {
    return this._motionLPF
  }

  constructor() {
    this.connect()
    if (Notification.permission !== 'granted') Notification.requestPermission()
    this._motionLPF = new MotionLPF(60)
  }

  connect() {
    if (!!this._ws && this._ws.readyState === this._ws.OPEN) this._ws.close()
    this._ws = new WebSocket(networkSettings.origin)
    this._checkConnection()

    if (!!this._ws) {
      this._ws.onmessage = (event: MessageEvent) => {
        const message: VmData = JSON.parse(event.data)
        const msType = message.messageType
        const data = message.data
        switch (msType) {
          case 'websocketSetting':
            if (data === 'Request attributes.') this.sendAttributes()
            break
          case 'connectionCheck':
            if (data === 'pong') {
              if (!!this._checkTimer) clearTimeout(this._checkTimer)
              this._checkConnection()
            }
            break
          case 'notification':
            if (Notification.permission === 'granted')
              new Notification(data as string)
            break
          default:
            break
        }
      }
      this._ws.onopen = () => {
        this._connectionCheckInterval = 30 * 1000
      }
      this._ws.onclose = () => {
        this._connectionCheckInterval = 5 * 1000
      }
    }
  }

  private _checkConnection = () => {
    setTimeout(() => {
      this.send({ messageType: 'connectionCheck', data: 'ping' })
      const checkTimeDeadline = 1 * 1000 //[ms]
      this._checkTimer = setTimeout(() => {
        this.connect()
        this._checkTimer = undefined
      }, checkTimeDeadline)
    }, this._connectionCheckInterval)
  }

  send(ms: VmData) {
    if (!this._ws || this._ws.readyState !== this._ws.OPEN) return
    const message: VmMessage = {
      userName: networkSettings.userName,
      connectionType: _connectionType,
      messageType: ms.messageType,
      data: JSON.stringify(ms.data),
    }
    this._ws.send(JSON.stringify(message))
  }

  private AddTrackingMessage(
    vrm: VRM,
    trackingTargetName: HumanoidBoneNameKey | 'LeftBlink' | 'RightBlink',
  ): string {
    if (!vrm.humanoid) return ``
    if (!trackingTargetName) return ``
    if (!this._ws) return ``

    if (trackingTargetName === 'LeftBlink') {
      const Blendshape = vrm.blendShapeProxy
      const PresetName = VRMSchema.BlendShapePresetName
      return `#LeftBlink,${Blendshape?.getValue(PresetName.BlinkL)?.toFixed(
        this._numberOfDigits,
      )}`
    } else if (trackingTargetName === 'RightBlink') {
      const Blendshape = vrm.blendShapeProxy
      const PresetName = VRMSchema.BlendShapePresetName
      return `#RightBlink,${Blendshape?.getValue(PresetName.BlinkR)?.toFixed(
        this._numberOfDigits,
      )}`
    } else {
      const bodyNodeName = VRMSchema.HumanoidBoneName[trackingTargetName]
      // const boneWorldRot = this.motionLPF
      //   .getFilteredRotation(trackingTargetName)
      //   .clone()
      // local2world(boneWorldRot, vrm.humanoid.getBoneNode(bodyNodeName)!)
      const worldRot = new Quaternion()
      vrm.humanoid.getBoneNode(bodyNodeName)?.getWorldQuaternion(worldRot)
      // const worldRot = this.motionLPF.getFilteredRotation(trackingTargetName)
      const offset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
      const quaternion = new Quaternion().multiplyQuaternions(offset, worldRot)

      return (
        `#` +
        `${ConvertBoneName(bodyNodeName)},` +
        `${quaternion.x.toFixed(this._numberOfDigits)},` +
        `${-quaternion.y.toFixed(this._numberOfDigits)},` +
        `${-quaternion.z.toFixed(this._numberOfDigits)},` +
        `${quaternion.w.toFixed(this._numberOfDigits)}`
      )
    }
  }

  sendAttributes() {
    if (!this._ws) return
    const message: VmData = {
      messageType: 'websocketSetting',
      data: {
        userName: networkSettings.userName,
        connectionType: _connectionType,
      },
    }
    this.send(message)
  }

  // SendConfigMessage(
  //   configTargetAddress: string,
  //   values: string | number,
  // ): void {
  //   if (!this._ws) return
  // const configAddressHead = this.oscAddressHead + 'config/'
  //   this._ws.send(`${configAddressHead + configTargetAddress}, ${values} `)
  // }

  SendPoseMessage(vrm: VRM) {
    if (!vrm.humanoid) return
    let data = ''

    data += this.AddTrackingMessage(vrm, 'Hips')
    data += this.AddTrackingMessage(vrm, 'Spine')
    data += this.AddTrackingMessage(vrm, 'Chest')
    data += this.AddTrackingMessage(vrm, 'UpperChest')
    data += this.AddTrackingMessage(vrm, 'Neck')
    data += this.AddTrackingMessage(vrm, 'Head')
    data += this.AddTrackingMessage(vrm, 'LeftShoulder')
    data += this.AddTrackingMessage(vrm, 'LeftUpperArm')
    data += this.AddTrackingMessage(vrm, 'LeftLowerArm')
    data += this.AddTrackingMessage(vrm, 'LeftUpperLeg')
    data += this.AddTrackingMessage(vrm, 'LeftLowerLeg')
    data += this.AddTrackingMessage(vrm, 'LeftFoot')
    data += this.AddTrackingMessage(vrm, 'LeftToes')
    data += this.AddTrackingMessage(vrm, 'RightShoulder')
    data += this.AddTrackingMessage(vrm, 'RightUpperArm')
    data += this.AddTrackingMessage(vrm, 'RightLowerArm')
    data += this.AddTrackingMessage(vrm, 'RightUpperLeg')
    data += this.AddTrackingMessage(vrm, 'RightLowerLeg')
    data += this.AddTrackingMessage(vrm, 'RightFoot')
    data += this.AddTrackingMessage(vrm, 'RightToes')

    data += this.AddTrackingMessage(vrm, 'LeftHand')
    data += this.AddTrackingMessage(vrm, 'LeftThumbProximal')
    data += this.AddTrackingMessage(vrm, 'LeftThumbIntermediate')
    data += this.AddTrackingMessage(vrm, 'LeftThumbDistal')
    data += this.AddTrackingMessage(vrm, 'LeftIndexProximal')
    data += this.AddTrackingMessage(vrm, 'LeftIndexIntermediate')
    data += this.AddTrackingMessage(vrm, 'LeftIndexDistal')
    data += this.AddTrackingMessage(vrm, 'LeftMiddleProximal')
    data += this.AddTrackingMessage(vrm, 'LeftMiddleIntermediate')
    data += this.AddTrackingMessage(vrm, 'LeftMiddleDistal')
    data += this.AddTrackingMessage(vrm, 'LeftRingProximal')
    data += this.AddTrackingMessage(vrm, 'LeftRingIntermediate')
    data += this.AddTrackingMessage(vrm, 'LeftRingDistal')
    data += this.AddTrackingMessage(vrm, 'LeftLittleProximal')
    data += this.AddTrackingMessage(vrm, 'LeftLittleIntermediate')
    data += this.AddTrackingMessage(vrm, 'LeftLittleDistal')

    data += this.AddTrackingMessage(vrm, 'RightHand')
    data += this.AddTrackingMessage(vrm, 'RightThumbProximal')
    data += this.AddTrackingMessage(vrm, 'RightThumbIntermediate')
    data += this.AddTrackingMessage(vrm, 'RightThumbDistal')
    data += this.AddTrackingMessage(vrm, 'RightIndexProximal')
    data += this.AddTrackingMessage(vrm, 'RightIndexIntermediate')
    data += this.AddTrackingMessage(vrm, 'RightIndexDistal')
    data += this.AddTrackingMessage(vrm, 'RightMiddleProximal')
    data += this.AddTrackingMessage(vrm, 'RightMiddleIntermediate')
    data += this.AddTrackingMessage(vrm, 'RightMiddleDistal')
    data += this.AddTrackingMessage(vrm, 'RightRingProximal')
    data += this.AddTrackingMessage(vrm, 'RightRingIntermediate')
    data += this.AddTrackingMessage(vrm, 'RightRingDistal')
    data += this.AddTrackingMessage(vrm, 'RightLittleProximal')
    data += this.AddTrackingMessage(vrm, 'RightLittleIntermediate')
    data += this.AddTrackingMessage(vrm, 'RightLittleDistal')

    data += this.AddTrackingMessage(vrm, 'LeftEye')
    data += this.AddTrackingMessage(vrm, 'RightEye')

    data += this.AddTrackingMessage(vrm, 'LeftBlink')
    data += this.AddTrackingMessage(vrm, 'RightBlink')

    const message: VmData = {
      messageType: 'trackingData',
      data: data,
    }
    this.send(message)
  }
}
const networkHandler = new NetworkHandler()
export default networkHandler
