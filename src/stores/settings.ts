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
