import { Holistic } from '@mediapipe/holistic/'
import { FaceMesh } from '@mediapipe/face_mesh'
import { rigController } from 'stores/RigController'
import { mediapipeLandmarks } from 'stores/MpLandmarksObserver'
// import { PoseResults } from 'stores/MpLandmarksObserver'
import { POSE_CONNECTIONS, HAND_CONNECTIONS } from '@mediapipe/holistic'
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { uiStores } from 'stores/uiStores'

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

let fps: number = 30
let timeInterval = (1 / fps) * 1000
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

export function startMpActions(): Promise<void> {
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
          if (videoElement)
            rigController.setRig(
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
      color: '#ffe603',
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
