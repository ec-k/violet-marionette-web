import React from 'react'
import { autorun, IReactionDisposer } from 'mobx'
import { mediapipeLandmarks } from 'stores/MpLandmarksObserver'
import { DrawResults } from 'models/MediapipeAction'
import styled from 'styled-components'

const Video = styled.video`
  max-width: 100%;
  position: absolute;
  transform: scale(-1, 1);
  @media only screen and (max-width: 600px) {
    video {
      max-width: 160px;
    }
  }
`

const GuideCanvas = styled.canvas`
  display: block;
  position: absolute;
  transform: scale(-1, 1);
  // top: 50px;
  left: 0;
  width: 100%;
  z-index: 1;
`

interface CameraScreenProps {
  showResult: boolean
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ showResult }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    if (!videoRef.current?.srcObject)
      navigator.mediaDevices.getUserMedia({ video: true }).then((sm) => {
        if (videoRef.current) {
          videoRef.current.srcObject = sm
          videoRef.current.autoplay = true
        }
      })

    const dispo: IReactionDisposer[] = []
    dispo.push(
      autorun(() => {
        if (canvasRef.current && videoRef.current && showResult)
          DrawResults(
            mediapipeLandmarks.resultLandmarks,
            canvasRef.current,
            videoRef.current,
          )
      }),
    )

    return () => {
      for (const d of dispo) return d()
    }
  }, [showResult])

  return (
    <>
      <Video ref={videoRef}></Video>
      {showResult && (
        <GuideCanvas className="guides" ref={canvasRef}></GuideCanvas>
      )}
    </>
  )
}
