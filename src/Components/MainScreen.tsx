import React from 'react'
import './MainScreen.css'
import { VRMSceneScreen } from 'components/VRMSceneScreen'
import { startMpActions } from 'models/Tracking/MediapipeAction'

type MainScreenProps = {
  tmp?: boolean
}

export const MainScreen: React.FC<MainScreenProps> = () => {
  // const videoRef = React.useRef<HTMLVideoElement>(null)

  startMpActions()

  return (
    <div className="MainScreen">
      {/* <video ref={videoRef}></video> */}
      <VRMSceneScreen />
    </div>
  )
}

MainScreen.displayName = 'MainScreen'
