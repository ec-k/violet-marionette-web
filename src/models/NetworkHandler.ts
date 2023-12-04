import { networkSettings } from 'stores/settings'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { ConvertBoneName } from './utils'
import { Euler, Quaternion } from 'three'
import { getGlobalRotation } from './utils'

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
  private _numberOfDigits = 4
  private _connectionCheckInterval = 5 * 1000 // [ms]
  private _checkTimer: NodeJS.Timeout | undefined

  get existWebsocket() {
    return !!this._ws
  }

  constructor() {
    this.connect()
    if (Notification.permission !== 'granted') Notification.requestPermission()
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
    trackingTargetName: VRMSchema.HumanoidBoneName,
  ): string {
    if (!vrm.humanoid) return ``
    if (!trackingTargetName) return ``
    if (!this._ws) return ``

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
      `${quaternion.x.toFixed(this._numberOfDigits)},` +
      `${-quaternion.y.toFixed(this._numberOfDigits)},` +
      `${-quaternion.z.toFixed(this._numberOfDigits)},` +
      `${quaternion.w.toFixed(this._numberOfDigits)}`
    )
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

    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Hips)
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Spine)
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Chest)
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.UpperChest)
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Neck)
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.Head)
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftShoulder,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftUpperArm,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLowerArm,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftUpperLeg,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLowerLeg,
    )
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftFoot)
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftToes)
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightShoulder,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightUpperArm,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLowerArm,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightUpperLeg,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLowerLeg,
    )
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightFoot)
    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightToes)

    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.LeftHand)
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftThumbProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftThumbIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftThumbDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftIndexProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftIndexIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftIndexDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftMiddleProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftMiddleIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftMiddleDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftRingProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftRingIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftRingDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLittleProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLittleIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.LeftLittleDistal,
    )

    data += this.AddTrackingMessage(vrm, VRMSchema.HumanoidBoneName.RightHand)
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightThumbProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightThumbIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightThumbDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightIndexProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightIndexIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightIndexDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightMiddleProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightMiddleIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightMiddleDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightRingProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightRingIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightRingDistal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLittleProximal,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLittleIntermediate,
    )
    data += this.AddTrackingMessage(
      vrm,
      VRMSchema.HumanoidBoneName.RightLittleDistal,
    )

    const message: VmData = {
      messageType: 'trackingData',
      data: data,
    }
    this.send(message)
  }
}
const networkHandler = new NetworkHandler()
export default networkHandler
