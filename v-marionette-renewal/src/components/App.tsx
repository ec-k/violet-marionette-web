import React from 'react'
import { ThemeProvider } from '@mui/material'
import theme from '@/styles/theme'
import LeftWindow from '@/components/leftwindow/LeftWindow'
import { uiStores } from '@/stores/uiStores'
import { VRMSceneScreen } from '@/components/VRMSceneScreen'
import { startMpActions, stopMpActions } from '@/models/mediapipeAction'
import Footer from '@/components/Footer'
import { autorun } from 'mobx'
import { avatar } from '@/models/avatar'

const App: React.FC = () => {
  // Start&Stop Mediapipe on pushed Start Button
  React.useEffect(() => {
    autorun(() => {
      if (!(uiStores.startTrack === 'stop')) startMpActions(avatar)
      else {
        stopMpActions()
      }
    })
  }, [])

  return (
    <>
      <ThemeProvider theme={theme}>
        <LeftWindow open={uiStores.openLeftWindow} />
        <div className="MainScreen">
          <VRMSceneScreen />
          <Footer />
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
