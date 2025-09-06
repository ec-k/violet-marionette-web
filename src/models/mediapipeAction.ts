import {
  DrawingUtils,
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
  PoseLandmarker,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import { mediapipeLandmarks, type HolisticResult } from '@/stores/mpLandmarksObserver'
import { uiStores } from '@/stores/uiStores'
import { MathUtils, Vector3 } from 'three'
import { Avatar } from './avatar'
import { trackingSettings } from '@/stores/userSettings'
import type { ArmLandmarkPositions, Arms } from '@/types'
import poseTaskUrl from '@/assets/mediapipe-models/pose_landmarker_full.task?url'
import handTaskUrl from '@/assets/mediapipe-models/hand_landmarker.task?url'
import faceTaskUrl from '@/assets/mediapipe-models/face_landmarker.task?url'

const minDetectionConfidence = 0.7
const minTrackingConfidence = 0.7
const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm',
)

const createPoseLandmarker = async () => {
  return await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: poseTaskUrl,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: minDetectionConfidence,
    minTrackingConfidence: minTrackingConfidence,
  })
}

const createFaceLandmarker = async () => {
  return await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: faceTaskUrl,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
    minFaceDetectionConfidence: minDetectionConfidence,
    minTrackingConfidence: minTrackingConfidence,
  })
}

const createHandLandmarker = async () => {
  return await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: handTaskUrl,
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 2,
    minHandDetectionConfidence: minDetectionConfidence,
    minTrackingConfidence: minTrackingConfidence,
  })
}

let poseLandmarker: PoseLandmarker | null = null
let handLandmarker: HandLandmarker | null = null
let faceLandmarker: FaceLandmarker | null = null

// Load and warm up models
export async function loadAndWarmupModels(): Promise<void> {
  try {
    console.log('MediaPipe models loading...')
    poseLandmarker = await createPoseLandmarker()
    handLandmarker = await createHandLandmarker()
    faceLandmarker = await createFaceLandmarker()
    console.log('MediaPipe models loaded. Performing warm-up...')

    // Dummy detection for warm-up
    const dummyCanvasElement = document.createElement('canvas')
    dummyCanvasElement.width = 1
    dummyCanvasElement.height = 1
    const ctx = dummyCanvasElement.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, 1, 1) // Ensure it has content, even if just transparent
    }

    // Perform dummy detection
    // Ensure landmarker objects are not null before calling detectForVideo
    // Use slightly incrementing timestamps for dummy detections to avoid timestamp mismatch
    if (poseLandmarker) poseLandmarker.detectForVideo(dummyCanvasElement, 1) // Start with 1
    if (handLandmarker) handLandmarker.detectForVideo(dummyCanvasElement, 2) // Increment
    if (faceLandmarker) faceLandmarker.detectForVideo(dummyCanvasElement, 3) // Increment

    console.log('MediaPipe models warm-up complete.')
  } catch (error) {
    console.error('Failed to load or warm-up MediaPipe models:', error)
    // Handle error appropriately, e.g., disable tracking features
  }
}

const fps = 60
const timeInterval = 1000 / fps
let lastTimestampMs = 0
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
  return new Vector3(-pos.x, -pos.y, pos.z)
}

const transformResultsByCameraAngle = (pos: Vector3 | undefined) => {
  if (!pos) return
  const angle = trackingSettings.angleWithRadian
  pos.y = pos.y * Math.cos(angle) - pos.z * Math.sin(angle)
  pos.z = pos.y * Math.sin(angle) + pos.z * Math.cos(angle)
  return pos
}

const offset: { current: Vector3 | undefined } = {
  current: new Vector3(0, 0, 0),
}

export async function startMpActions(avatar: Avatar): Promise<void> {
  stopMpActions()
  const promise = new Promise<void>((resolve) => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoElement = window.document.createElement('video') as HTMLVideoElement
        videoElement.srcObject = stream
        videoElement.autoplay = true
        videoElement.onloadeddata = () => {
          if (uiStores.startTrack === 'loading') uiStores.toggleStartTrack()
        }

        function timer() {
          if (isMediapipeActive && poseLandmarker && handLandmarker && faceLandmarker) {
            if (videoElement?.videoWidth && videoElement?.videoHeight) {
              // Use a monotonically increasing timestamp
              lastTimestampMs += timeInterval // Increment by the expected frame interval

              const poseResult = poseLandmarker.detectForVideo(videoElement, lastTimestampMs)
              const handResult = handLandmarker.detectForVideo(videoElement, lastTimestampMs + 1) // Slightly increment for each call within the same tick
              const faceResult = faceLandmarker.detectForVideo(videoElement, lastTimestampMs + 2) // Slightly increment for each call within the same tick

              try {
                // Since results.poselandmark[0] is the position of the face surface, manually adjust so that it is at the centre of the head.
                if (
                  !poseResult ||
                  !poseResult.worldLandmarks ||
                  poseResult.worldLandmarks.length == 0
                )
                  return
                const detectedPerson = poseResult.worldLandmarks[0]
                const face = toVector3(detectedPerson[0])
                const mouthRight = toVector3(detectedPerson[10])
                const mouthLeft = toVector3(detectedPerson[9])
                if (!face || !mouthRight || !mouthLeft) {
                  window.setTimeout(timer, timeInterval)
                  return
                }
                const adjAmount = 0.1
                const adj = new Vector3()
                  .crossVectors(mouthRight?.sub(face), mouthLeft?.sub(face))
                  .normalize()
                  .multiplyScalar(adjAmount)

                // apply
                offset.current = transformResultsByCameraAngle(face.sub(adj))
              } catch (e) {
                console.log('Failed to handle new results in timer: ', e)
                window.setTimeout(timer, timeInterval)
                return
              }

              const results: HolisticResult = {
                poseLandmarks: poseResult,
                handLandmarks: handResult,
                faceResults: faceResult,
              }

              mediapipeLandmarks.setLandmarks(results)

              avatar.pushPose(
                trackingSettings.enabledIK,
                offset.current,
                setArmResults(results),
                results.faceResults,
              )
              // TODO: Integrate this into avatar.pushPose().
              if (videoElement && avatar.motionController && avatar.motionController.FK) {
                avatar.motionController.FK.setRig(mediapipeLandmarks.resultLandmarks, videoElement)
              }
            }
            window.setTimeout(timer, timeInterval)
          }
        }
        isMediapipeActive = true
        window.setTimeout(timer, timeInterval)
        resolve()
      })
      .catch((err) => {
        console.error('Failed to get camera stream:', err)
      })
  })
  return promise
}

const setArmResults = (results: HolisticResult) => {
  if (!results || !results.poseLandmarks || !results.handLandmarks) return

  const transformLandmark = (landmark: NormalizedLandmark | undefined) => {
    const nullableLandamrk = landmark
    if (landmark) return transformResultsByCameraAngle(toVector3(nullableLandamrk))
    else return undefined
  }

  let lElbow: Vector3 | undefined = undefined
  let rElbow: Vector3 | undefined = undefined
  let lHand: Vector3 | undefined = undefined
  let rHand: Vector3 | undefined = undefined
  if (results.poseLandmarks.worldLandmarks.length > 0) {
    lElbow = transformLandmark(results.poseLandmarks.worldLandmarks[0][13])
    rElbow = transformLandmark(results.poseLandmarks.worldLandmarks[0][14])
    lHand = transformLandmark(results.poseLandmarks.worldLandmarks[0][15])
    rHand = transformLandmark(results.poseLandmarks.worldLandmarks[0][16])
    // Compensate for mis-estimating in depth positions of hands when the distance of hands getting close.
    if (!!lHand && !!rHand) {
      const len = Math.abs(lHand.x - rHand.x)
      const adjAmount = 0.3
      const adj = MathUtils.clamp(-len + adjAmount, 0, adjAmount)
      lHand.z -= adj
      rHand.z -= adj
    }
    transformResultsByCameraAngle(lHand)
    transformResultsByCameraAngle(rHand)
  }

  const handedness = results.handLandmarks.handedness
  let leftHandLandmarks: NormalizedLandmark[] | undefined = undefined
  let rightHandLandmarks: NormalizedLandmark[] | undefined = undefined
  if (handedness && results.handLandmarks.worldLandmarks) {
    for (let i = 0; i < handedness.length; i++) {
      if (handedness[i][0].categoryName === 'Left') {
        leftHandLandmarks = results.handLandmarks.worldLandmarks[i]
      } else if (handedness[i][0].categoryName === 'Right') {
        rightHandLandmarks = results.handLandmarks.worldLandmarks[i]
      }
    }
  }
  let lMiddleProximal = undefined
  let lPinkyProximal = undefined
  let lWrist = undefined
  if (leftHandLandmarks) {
    lMiddleProximal = transformLandmark(leftHandLandmarks[9])
    lPinkyProximal = transformLandmark(leftHandLandmarks[17])
    lWrist = transformLandmark(leftHandLandmarks[0])
  }
  let rMiddleProximal = undefined
  let rPinkyProximal = undefined
  let rWrist = undefined
  if (rightHandLandmarks) {
    rMiddleProximal = transformLandmark(rightHandLandmarks[9])
    rPinkyProximal = transformLandmark(rightHandLandmarks[17])
    rWrist = transformLandmark(rightHandLandmarks[0])
  }

  const leftArm: ArmLandmarkPositions = {
    elbow: lElbow,
    hand: lHand,
    wrist: lWrist,
    middleProximal: lMiddleProximal,
    pinkyProximal: lPinkyProximal,
  }
  const rightArm: ArmLandmarkPositions = {
    elbow: rElbow,
    hand: rHand,
    wrist: rWrist,
    middleProximal: rMiddleProximal,
    pinkyProximal: rPinkyProximal,
  }

  const arms: Arms = {
    l: leftArm,
    r: rightArm,
  }

  return arms
}

let drawingUtils: DrawingUtils | undefined = undefined

export function DrawResults(
  // results: PoseResults,
  results: HolisticResult,
  guideCanvas: HTMLCanvasElement,
  videoEl: HTMLVideoElement,
) {
  if (!guideCanvas || !videoEl) return
  guideCanvas.width = videoEl.videoWidth
  guideCanvas.height = videoEl.videoHeight
  const canvasCtx = guideCanvas.getContext('2d')
  if (!canvasCtx) return
  if (!drawingUtils) drawingUtils = new DrawingUtils(canvasCtx)
  canvasCtx.save()
  canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height)

  const pose = results.poseLandmarks?.landmarks
  const face = results.faceResults?.faceLandmarks
  const hand1 = results.handLandmarks?.landmarks
  const hand2 = results.handLandmarks?.landmarks

  if (pose) {
    for (const lm of pose) {
      drawingUtils.drawLandmarks(lm, {
        color: '#ff0364',
        lineWidth: 2,
      })
      drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS)
    }
  }
  if (face) {
    for (const lm of face) {
      drawingUtils.drawLandmarks(lm, {
        color: '#C0C0C070',
        lineWidth: 1,
      })
      drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION)
    }
  }
  if (face && face.length > 0 && face[0].length > 473) {
    // draw pupils
    drawingUtils.drawLandmarks([face[0][468], face[0][473]], {
      color: '#FFF',
      lineWidth: 2,
    })
  }
  if (hand1) {
    for (const lm of hand1) {
      drawingUtils.drawLandmarks(lm, {
        color: '#eb1064',
        lineWidth: 5,
      })
      drawingUtils.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS)
    }
  }
  if (hand2) {
    for (const lm of hand2) {
      drawingUtils.drawLandmarks(lm, {
        color: '#00cff7',
        lineWidth: 5,
      })
      drawingUtils.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS)
    }
  }
}
