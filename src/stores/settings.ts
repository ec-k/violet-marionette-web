class NetworkSettings {
  neosUserName_: string = ''
  // isBloadcastActive_: boolean = false
  host_: string = 'localhost'
  port_: number = 23000
  updateRate_: number = 30

  get getOrigin() {
    return `ws://${this.host_}:${this.port_}`
  }
}

class TrackingSettings {
  private _enableLeg: boolean = false
  private _cameraDepressionAngle: number = 15 // degree

  get enableLeg() {
    return this._enableLeg
  }
  get cameraDepressionAngle() {
    return this._cameraDepressionAngle
  }
  get angleWithRadian() {
    return (this._cameraDepressionAngle * Math.PI) / 180
  }
  set enableLeg(isEnabled: boolean) {
    this._enableLeg = isEnabled
  }
  set cameraDepressionAngle(angle: number) {
    this._cameraDepressionAngle = angle
  }
}

export const networkSettings = new NetworkSettings()
export const trackingSettings = new TrackingSettings()
