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
  get enableLeg() {
    return this._enableLeg
  }
  set enableLeg(isEnabled: boolean) {
    this._enableLeg = isEnabled
  }
}

export const networkSettings = new NetworkSettings()
export const trackingSettings = new TrackingSettings()
