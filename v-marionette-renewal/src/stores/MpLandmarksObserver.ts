import { NormalizedLandmarkList, Results } from '@mediapipe/holistic'
import { makeObservable, observable, action } from 'mobx'

export type PoseResults = {
  facelm: NormalizedLandmarkList | undefined
  poselm: NormalizedLandmarkList | undefined
  poselm3d: any
  rightHandlm: NormalizedLandmarkList | undefined
  leftHandlm: NormalizedLandmarkList | undefined
}

class MediapipeLandmarksObserver {
  resultLandmarks: PoseResults = {
    facelm: undefined,
    poselm: undefined,
    poselm3d: undefined,
    rightHandlm: undefined,
    leftHandlm: undefined,
  }

  constructor() {
    makeObservable(this, {
      resultLandmarks: observable.ref,
      setLandmarks: action,
    })
  }

  setLandmarks(results: Results) {
    this.resultLandmarks = {
      facelm: results.faceLandmarks,
      poselm: results.poseLandmarks,
      poselm3d: (results as any).za,
      rightHandlm: results.rightHandLandmarks,
      leftHandlm: results.leftHandLandmarks,
    }
  }
}

export const mediapipeLandmarks = new MediapipeLandmarksObserver()
