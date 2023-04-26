import { makeObservable, observable, computed } from 'mobx'

class NetworkSettings {
  neosUserName: string = ''
  isBloadcastActive: boolean = false
  host: string = 'localhost'
  port: number = 50505
  updateRate: number = 30
  delay: number = 0

  constructor() {
    makeObservable(this, {
      isBloadcastActive: observable,
      updateRate: observable,
      delay: observable,
    })
  }
}

class TrackingSettings {
  userHeight: number = 170 // unit: cm
  userArmLength: number = 58 // unit: cm
  avatarHeight: number = 120 // unit: cm
  avatarArmLength: number = 45 // unit: cm
  coefCalculationBase: string = 'height'
  isFacetrackingActive: boolean = true
  isHandtrackingActive: boolean = true
  isFoottrackingActive: boolean = true

  constructor() {
    makeObservable(this, {
      userHeight: observable,
      userArmLength: observable,
      getTrackingCoef: computed,
    })
  }

  get getTrackingCoef() {
    return this.coefCalculationBase === 'height'
      ? this.userHeight / this.avatarHeight
      : this.userArmLength / this.avatarArmLength
  }

  toggleFaceTrackingState() {
    this.isFacetrackingActive = !this.isFacetrackingActive
  }
}

class OtherSettings {
  doDisplayAvatar: boolean = true

  constructor() {
    makeObservable(this, {
      doDisplayAvatar: observable,
    })
  }
}

export const networkSettings = new NetworkSettings()
export const trackingSettings = new TrackingSettings()
export const otherSettings = new OtherSettings()
