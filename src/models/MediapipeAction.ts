import { Holistic, NormalizedLandmark } from '@mediapipe/holistic/'
import { FaceMesh } from '@mediapipe/face_mesh'
import { mediapipeLandmarks } from 'stores/MpLandmarksObserver'
import { POSE_CONNECTIONS, HAND_CONNECTIONS } from '@mediapipe/holistic'
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { uiStores } from 'stores/uiStores'
import { Vector3 } from 'three'
import { Avatar } from './vrm-toy-box-ik-solver/Avatar'
import { trackingSettings } from 'stores/userSettings'

export const holistic = new Holistic({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`
  },
})
holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  refineFaceLandmarks: true,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
})
export const faceMesh = new FaceMesh({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  },
})
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
})

let fps = 60
let timeInterval = 1000 / fps
let videoElement: HTMLVideoElement | undefined
let isMediapipeActive: boolean = false

export function SetMediapipeState(isActive: boolean): void {
  isMediapipeActive = isActive
}

export function stopMpActions() {
  if (videoElement) {
    videoElement.srcObject = null
    videoElement.remove()
    videoElement = undefined
  }
  isMediapipeActive = false
}

const toVector3 = (pos: NormalizedLandmark | undefined) => {
  if (!pos) return
  // (-direction.x, -direction.y, direction.z)
  return new Vector3(-pos.x, -pos.y, pos.z)
}
const transformResultsByCameraAngle = (pos: THREE.Vector3 | undefined) => {
  if (!pos) return
  const angle = trackingSettings.angleWithRadian
  pos.y = pos.y * Math.cos(angle) - pos.z * Math.sin(angle)
  pos.z = pos.y * Math.sin(angle) + pos.z * Math.cos(angle)
  return pos
}

export function startMpActions(avatar: Avatar): Promise<void> {
  stopMpActions()
  const promise = new Promise<void>((resolve) => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoElement = window.document.createElement(
          'video',
        ) as HTMLVideoElement
        videoElement.srcObject = stream
        videoElement.autoplay = true

        holistic.onResults((results) => {
          if (uiStores.startTrack === 'loading') uiStores.toggleStartTrack()
          mediapipeLandmarks.setLandmarks(results)

          const [
            shoulders,
            elbows,
            hands,
            middleProximals,
            pinkyProximals,
            wrist,
          ] = setArmResults(results)

          avatar.vrmIK?.ikTargetTracker.trackTargets(hands, elbows, shoulders)
          avatar.vrmIK?.rotateHand.setHandTargets(
            wrist,
            middleProximals,
            pinkyProximals,
          )
          if (videoElement && avatar.vrmFK)
            avatar.vrmFK.setRig(
              mediapipeLandmarks.resultLandmarks,
              videoElement,
            )
        })
        function timer(detector: Holistic | FaceMesh) {
          if (isMediapipeActive) {
            if (videoElement?.videoWidth) {
              detector.send({ image: videoElement }).then(() => {
                window.setTimeout(() => {
                  timer(detector)
                }, timeInterval)
              })
            } else {
              window.setTimeout(() => {
                timer(detector)
              }, timeInterval)
            }
          }
        }
        isMediapipeActive = true
        timer(holistic)
        resolve()
      })
      .catch()
  })
  return promise
}

const setArmResults = (results: any) => {
  const lShoulder = (() => {
    try {
      return transformResultsByCameraAngle(toVector3(results.poseLandmarks[11]))
    } catch {
      return undefined
    }
  })()
  const rShoulder = (() => {
    try {
      return transformResultsByCameraAngle(toVector3(results.poseLandmarks[12]))
    } catch {
      return undefined
    }
  })()
  const lElbow = (() => {
    try {
      return transformResultsByCameraAngle(toVector3(results.poseLandmarks[13]))
    } catch {
      return undefined
    }
  })()
  const rElbow = (() => {
    try {
      return transformResultsByCameraAngle(toVector3(results.poseLandmarks[14]))
    } catch {
      return undefined
    }
  })()
  const lHand = (() => {
    try {
      return transformResultsByCameraAngle(toVector3(results.poseLandmarks[15]))
    } catch {
      return undefined
    }
  })()
  const rHand = (() => {
    try {
      return transformResultsByCameraAngle(toVector3(results.poseLandmarks[16]))
    } catch {
      return undefined
    }
  })()

  const lMiddleProximal = (() => {
    try {
      return transformResultsByCameraAngle(
        toVector3(results.leftHandLandmarks[9]),
      )
    } catch {
      return undefined
    }
  })()
  const rMiddleProximal = (() => {
    try {
      return transformResultsByCameraAngle(
        toVector3(results.rightHandLandmarks[9]),
      )
    } catch {
      return undefined
    }
  })()
  const lPinkyProximal = (() => {
    try {
      return transformResultsByCameraAngle(
        toVector3(results.leftHandLandmarks[17]),
      )
    } catch {
      return undefined
    }
  })()
  const rPinkyProximal = (() => {
    try {
      return transformResultsByCameraAngle(
        toVector3(results.rightHandLandmarks[17]),
      )
    } catch {
      return undefined
    }
  })()
  const lWrist = (() => {
    try {
      return transformResultsByCameraAngle(
        toVector3(results.leftHandLandmarks[0]),
      )
    } catch {
      return undefined
    }
  })()
  const rWrist = (() => {
    try {
      return transformResultsByCameraAngle(
        toVector3(results.rightHandLandmarks[0]),
      )
    } catch {
      return undefined
    }
  })()

  const shoulders = { l: lShoulder, r: rShoulder }
  const elbows = { l: lElbow, r: rElbow }
  const hands = { l: lHand, r: rHand }
  const middleProximals = { l: lMiddleProximal, r: rMiddleProximal }
  const pinkyProximals = { l: lPinkyProximal, r: rPinkyProximal }
  const wrist = { l: lWrist, r: rWrist }

  return [shoulders, elbows, hands, middleProximals, pinkyProximals, wrist]
}

export function DrawResults(
  // results: PoseResults,
  results: any,
  guideCanvas: HTMLCanvasElement,
  videoEl: HTMLVideoElement,
) {
  if (!guideCanvas) return
  if (!videoEl) return
  guideCanvas.width = videoEl.videoWidth
  guideCanvas.height = videoEl.videoHeight
  let canvasCtx = guideCanvas.getContext('2d')
  if (!canvasCtx) return
  canvasCtx.save()
  canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height)
  // Use `Mediapipe` drawing function
  drawConnectors(canvasCtx, results.poselm, POSE_CONNECTIONS, {
    color: '#00cff7',
    lineWidth: 4,
  })
  drawLandmarks(canvasCtx, results.poselm, {
    color: '#ff0364',
    lineWidth: 2,
  })
  drawConnectors(canvasCtx, results.facelm, FACEMESH_TESSELATION, {
    color: '#C0C0C070',
    lineWidth: 1,
  })
  if (results.facelm && results.facelm.length === 478) {
    // draw pupils
    drawLandmarks(canvasCtx, [results.facelm[468], results.facelm[468 + 5]], {
      color: '#',
      lineWidth: 2,
    })
  }
  drawConnectors(canvasCtx, results.leftHandlm, HAND_CONNECTIONS, {
    color: '#eb1064',
    lineWidth: 5,
  })
  drawLandmarks(canvasCtx, results.leftHandlm, {
    color: '#00cff7',
    lineWidth: 5,
  })
  drawConnectors(canvasCtx, results.rightHandlm, HAND_CONNECTIONS, {
    color: '#22c3e3',
    lineWidth: 5,
  })
  drawLandmarks(canvasCtx, results.rightHandlm, {
    color: '#ff0364',
    lineWidth: 2,
  })
}
