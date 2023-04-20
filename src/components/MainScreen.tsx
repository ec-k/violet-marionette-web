import React from 'react'
import { VRMSceneScreen } from 'components/VRMSceneScreen'
import { startMpActions, stopMpActions } from 'models/Tracking/MediapipeAction'
import Footer from 'components/footer/Footer'
import { autorun } from 'mobx'
import { uiStores } from 'stores/uiStores'

type MainScreenProps = {}

export const MainScreen: React.FC<MainScreenProps> = () => {
  React.useEffect(() => {
    autorun(() => {
      if (!(uiStores.startTrack === 'stop')) startMpActions()
      else {
        stopMpActions()
      }
    })
  }, [])

  return (
    <div className="MainScreen">
      <VRMSceneScreen />
      <Footer />
    </div>
  )
}

MainScreen.displayName = 'MainScreen'
