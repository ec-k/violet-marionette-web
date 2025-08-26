import { networkSettings } from 'stores/userSettings'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { ConvertBoneName /*, local2world */ } from './utils'
import { Euler, Quaternion } from 'three'

type ConnectionType = 'resoniteClient' | 'webClient' | 'server'
type MessageType = 'trackingData' | 'websocketSetting' | 'connectionCheck' | 'notification'
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

  get existWebsocket() {
    return !!this._ws
  }

  constructor() {
    this.connect()
    if (Notification.permission !== 'granted') Notification.requestPermission()
  }

  connect() {
    if (this._ws && this._ws.readyState === this._ws.OPEN) this._ws.close()
    this._ws = new WebSocket(networkSettings.origin)
    this._checkConnection()

    if (this._ws) {
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
              if (this._checkTimer) clearTimeout(this._checkTimer)
              this._checkConnection()
            }
            break
          case 'notification':
            if (Notification.permission === 'granted') new Notification(data as string)
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
    trackingTargetName: VRMHumanBoneName | 'LeftBlink' | 'RightBlink',
  ): string {
    if (!vrm.humanoid) return ``
    if (!trackingTargetName) return ``
    if (!this._ws) return ``

    if (trackingTargetName === 'LeftBlink') {
      const Blendshape = vrm.expressionManager
      return `#LeftBlink,${Blendshape?.getValue('blinkLeft')?.toFixed(this._numberOfDigits)}`
    } else if (trackingTargetName === 'RightBlink') {
      const Blendshape = vrm.expressionManager
      return `#RightBlink,${Blendshape?.getValue('blinkRight')?.toFixed(this._numberOfDigits)}`
    } else {
      // const boneWorldRot = this.motionLPF
      //   .getFilteredRotation(trackingTargetName)
      //   .clone()
      // local2world(boneWorldRot, vrm.humanoid.getBoneNode(bodyNodeName)!)
      const worldRot = new Quaternion()
      vrm.humanoid.getRawBoneNode(trackingTargetName)?.getWorldQuaternion(worldRot)
      // const worldRot = this.motionLPF.getFilteredRotation(trackingTargetName)
      const offset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
      const quaternion = new Quaternion().multiplyQuaternions(offset, worldRot)

      return (
        `#` +
        `${ConvertBoneName(trackingTargetName)},` +
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

    Object.values(VRMHumanBoneName).forEach((boneName) => {
      data += this.AddTrackingMessage(vrm, boneName)
    })

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
