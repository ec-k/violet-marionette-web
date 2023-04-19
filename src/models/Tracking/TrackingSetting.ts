import { Transform } from 'models/Tracking/Types'

class TrackingSettings {
  private m_offset: Transform
  private m_coef: number

  constructor() {
    // Reset members to default values
    this.m_offset = {
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      quaternion: {
        x: 0,
        y: 0,
        z: 0,
        w: 0,
      },
    }
    this.m_coef = 1
  }

  public set setOffset(offset: Transform) {
    this.m_offset = offset
  }
  public get getOffset() {
    return this.m_offset
  }
  public set setCoef(coef: number) {
    this.m_coef = coef
  }
  public get getCoef() {
    return this.m_coef
  }
  public calculateCoef(userHeight: number) {
    // calculate coef from some calculation
    // I have no good idea about that
    const coef = 1.2 // this number is temporal
    this.m_coef = userHeight * coef
  }
}

const trackingSettings = Object.freeze(new TrackingSettings())
export default trackingSettings
