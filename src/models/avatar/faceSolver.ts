import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import type { VRM } from '@pixiv/three-vrm'

class FaceSolver {
  applyPerfectSyncResult(vrm: VRM, result: FaceLandmarkerResult) {
    if (!vrm || result.faceBlendshapes.length === 0) return
    const manager = vrm.expressionManager
    const blendshapes = result.faceBlendshapes
    blendshapes[0].categories.forEach((blendshape) => {
      const key = blendshape.categoryName
      const weight = blendshape.score
      manager?.setValue(key, weight)
    })
  }
}

const faceSolver = new FaceSolver()
export default faceSolver
