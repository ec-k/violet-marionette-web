import { makeObservable, observable, action } from 'mobx'
import { MathUtils } from 'three'

class NetworkSettings {
  userName: string = ''
  // isBloadcastActive_: boolean = false
  private _host: string = 'localhost'
  private _port: number = 23000
  sendRate: number = 20

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
  private _cameraDepressionAngle: number = 20 // degree
  private _distanceToMonitor: number = 100 // [cm]
  private _monitorInch = 23 // [inch]
  private _headRotCoef: number = 1
  private _headRotConversionThreshold: number = 30
  private _theta_v = 60 // Resonite's viewing angle. 60 is default setting in Resonite.
  eyeRotationOffset = -5 // degree

  constructor() {
    this.setHeadRotCoef()
    this.setHeadRotConversionThreshold()
  }

  get cameraDepressionAngle() {
    return this._cameraDepressionAngle
  }
  get angleWithRadian() {
    return (this._cameraDepressionAngle * Math.PI) / 180
  }
  get monitorInch() {
    return this._monitorInch
  }
  get distanceToMonitor() {
    return this._distanceToMonitor
  }
  get headRotCoef() {
    return this._headRotCoef
  }
  get headRotConversionThreshold() {
    return this._headRotConversionThreshold
  }

  set cameraDepressionAngle(angle: number) {
    this._cameraDepressionAngle = angle
  }
  set distanceToMonitor(dist: number) {
    this._distanceToMonitor = dist
    this.setHeadRotCoef()
    this.setHeadRotConversionThreshold()
  }
  set monitorInch(inch: number) {
    this._monitorInch = inch
    this.setHeadRotCoef()
    this.setHeadRotConversionThreshold()
  }

  setHeadRotCoef() {
    const inchToCmCoef = 2.54
    const theta_p = Math.atan(
      (Math.sqrt(256 / 337) * this._monitorInch * inchToCmCoef) /
        this._distanceToMonitor,
    )
    this._headRotCoef = this._theta_v / MathUtils.radToDeg(theta_p)
  }

  setHeadRotConversionThreshold() {
    const inchToCmCoef = 2.54
    this._headRotConversionThreshold = Math.atan(
      (Math.sqrt(256 / 337) * this._monitorInch * inchToCmCoef) /
        (2 * this._distanceToMonitor),
    )
  }
}

class OthreSettings {
  showIKTarget: boolean = false
}

export const networkSettings = new NetworkSettings()
export const trackingSettings = new TrackingSettings()
export const otherSenttings = new OthreSettings()
