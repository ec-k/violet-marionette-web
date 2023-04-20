import React from 'react'
import { autorun, IReactionDisposer } from 'mobx'
import { mediapipeLandmarks } from 'stores/MpLandmarksObserver'
import { DrawResults } from 'models/Tracking/MediapipeAction'
import styled from 'styled-components'

export const CameraScreen: React.FC<{}> = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const Video = styled.video`
    max-width: 300px;
    height: auto;
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
    bottom: 0;
    left: 0;
    height: auto;
    width: 100%;
    z-index: 1;
  `

  // React.useMemo(() => {
  //   navigator.mediaDevices.getUserMedia({ video: true }).then((sm) => {
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = sm
  //       videoRef.current.autoplay = true
  //     }
  //   })
  // }, [videoRef.current?.srcObject])

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
        if (canvasRef.current && videoRef.current)
          DrawResults(
            mediapipeLandmarks.resultLandmarks,
            canvasRef.current,
            videoRef.current,
          )
      }),
    )
    for (const d of dispo) return d()
  }, [])

  return (
    <>
      <Video ref={videoRef}></Video>
      <GuideCanvas className="guides" ref={canvasRef}></GuideCanvas>
    </>
  )
}
