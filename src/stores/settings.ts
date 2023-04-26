class NetworkSettings {
  neosUserName_: string = ''
  // isBloadcastActive_: boolean = false
  host_: string = 'localhost'
  port_: number = 23000
  updateRate_: number = 30

  constructor() {}
  get getOrigin() {
    return `ws://${this.host_}:${this.port_}`
  }
}

class TrackingSettings {
  userHeight_: number = 170 // unit: cm
  userArmLength_: number = 58 // unit: cm
  avatarHeight_: number = 120 // unit: cm
  avatarArmLength_: number = 45 // unit: cm
  coefCalculationBase_: string = 'height'
  // isFacetrackingActive_: boolean = true
  // isHandtrackingActive_: boolean = true
  // isFoottrackingActive_: boolean = true

  constructor() {}
  get getTrackingCoef() {
    return this.coefCalculationBase_ === 'height'
      ? this.userHeight_ / this.avatarHeight_
      : this.userArmLength_ / this.avatarArmLength_
  }
}

export const networkSettings = new NetworkSettings()
export const trackingSettings = new TrackingSettings()
