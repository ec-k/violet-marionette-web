import { action, makeObservable, observable } from 'mobx'

type MediapipeState = 'stop' | 'loading' | 'active'
class UIStores {
  openLeftWindow: boolean = false
  startTrack: MediapipeState = 'stop'
  startSendMotion: boolean = false

  constructor() {
    makeObservable(this, {
      openLeftWindow: observable,
      startTrack: observable,
      startSendMotion: observable,
      toggleLeftWindow: action,
      toggleStartTrack: action,
      toggleStartSendPose: action,
    })
  }

  toggleLeftWindow() {
    this.openLeftWindow = !this.openLeftWindow
  }
  toggleStartTrack() {
    // this.startTrack = !this.startTrack
    if (this.startTrack === 'stop') this.startTrack = 'loading'
    else if (this.startTrack === 'loading') this.startTrack = 'active'
    else this.startTrack = 'stop'
  }
  toggleStartSendPose() {
    this.startSendMotion = !this.startSendMotion
  }
  get getOpenLeftWindow() {
    return this.openLeftWindow
  }
  get getStartTrack() {
    return this.startTrack
  }
  get getStartSendMotion() {
    return this.startSendMotion
  }
}
export const uiStores = new UIStores()
