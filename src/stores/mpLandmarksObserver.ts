import type {
  PoseLandmarkerResult,
  HandLandmarkerResult,
  FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'
import { makeObservable, observable, action } from 'mobx'

export type HolisticResult = {
  poseLandmarks: PoseLandmarkerResult | undefined
  handLandmarks: HandLandmarkerResult | undefined
  faceResults: FaceLandmarkerResult | undefined
}

class HolisticResultsObserver {
  resultLandmarks: HolisticResult = {
    poseLandmarks: undefined,
    handLandmarks: undefined,
    faceResults: undefined,
  }

  constructor() {
    makeObservable(this, {
      resultLandmarks: observable.ref,
      setLandmarks: action,
    })
  }

  setLandmarks(results: HolisticResult) {
    this.resultLandmarks = {
      faceResults: results.faceResults,
      poseLandmarks: results.poseLandmarks,
      handLandmarks: results.handLandmarks,
    }
  }
}

export const mediapipeLandmarks = new HolisticResultsObserver()
