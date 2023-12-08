import { makeObservable, observable, action } from 'mobx'

class NetworkSettings {
  userName: string = ''
  // isBloadcastActive_: boolean = false
  private _host: string = 'localhost'
  private _port: number = 23000
  sendRate: number = 30

  constructor() {
    makeObservable(this, {
      userName: observable,
      sendRate: observable,
      setUserName: action,
      setSendRate: action,
    })
  }

  setUserName(userName: string) {
    this.userName = userName
  }
  setSendRate(sendRate: number) {
    this.sendRate = sendRate
  }

  get origin() {
    return `ws://${this._host}:${this._port}`
  }
}

class TrackingSettings {
  enableLeg: boolean = false
  enabledIK: boolean = true
  private _cameraDepressionAngle: number = 15 // degree

  get cameraDepressionAngle() {
    return this._cameraDepressionAngle
  }
  get angleWithRadian() {
    return (this._cameraDepressionAngle * Math.PI) / 180
  }
  set cameraDepressionAngle(angle: number) {
    this._cameraDepressionAngle = angle
  }
}

export const networkSettings = new NetworkSettings()
export const trackingSettings = new TrackingSettings()
