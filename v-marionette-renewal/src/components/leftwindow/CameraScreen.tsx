import React from 'react'
import { autorun } from 'mobx'
import type { IReactionDisposer } from 'mobx'
import { mediapipeLandmarks } from 'stores/mpLandmarksObserver'
import { DrawResults } from 'models/mediapipeAction'
import styled from '@emotion/styled'

const Video = styled.video`
  max-width: 100%;
  position: absolute;
  @media only screen and (max-width: 600px) {
    video {
      max-width: 160px;
    }
  }
`

const GuideCanvas = styled.canvas`
  display: block;
  position: absolute;
  // top: 50px;
  left: 0;
  width: 100%;
  z-index: 1;
`

interface CameraScreenProps {
  showVideo: boolean
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ showVideo }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  if (videoRef.current) {
    if (showVideo) videoRef.current.play()
    else videoRef.current.srcObject = null
  }

  React.useEffect(() => {
    if (!videoRef.current?.srcObject)
      navigator.mediaDevices.getUserMedia({ video: true }).then((sm) => {
        if (videoRef.current) {
          videoRef.current.srcObject = sm
        }
      })

    const dispo: IReactionDisposer[] = []
    dispo.push(
      autorun(() => {
        if (canvasRef.current && videoRef.current)
          DrawResults(mediapipeLandmarks.resultLandmarks, canvasRef.current, videoRef.current)
      }),
    )

    return () => {
      for (const d of dispo) return d()
    }
  })

  return (
    <>
      <Video ref={videoRef}></Video>
      <GuideCanvas className="guides" ref={canvasRef}></GuideCanvas>
    </>
  )
}
