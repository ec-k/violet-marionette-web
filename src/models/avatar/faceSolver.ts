import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision'
import type { VRM } from '@pixiv/three-vrm'
import { camelToPascal } from '../utils'

class FaceSolver {
  applyPerfectSyncResult(vrm: VRM, result: FaceLandmarkerResult) {
    if (!vrm || result.faceBlendshapes.length === 0) return
    const manager = vrm.expressionManager
    const blendshapes = result.faceBlendshapes
    blendshapes[0].categories.forEach((blendshape) => {
      const key = camelToPascal(blendshape.categoryName)
      const weight = blendshape.score * 0.7 // Suppress facial motion to make it natural
      manager?.setValue(key, weight)
    })
  }
}

const faceSolver = new FaceSolver()
export default faceSolver
