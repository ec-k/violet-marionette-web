import { makeObservable, observable, computed } from 'mobx'

class NetworkSettings {
  neosUserId: string = ''
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
  armLength: number = 58 // unit: cm
  trackingCoef: number = 1.0
  isFacetrackingActive: boolean = true
  isHandtrackingActive: boolean = true
  isFoottrackingActive: boolean = true

  constructor() {
    makeObservable(this, {
      userHeight: observable,
      armLength: observable,
      setTrackingCoef: computed,
    })
    this.setTrackingCoef()
  }

  setTrackingCoef() {
    this.trackingCoef = this.userHeight * 0.2
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
