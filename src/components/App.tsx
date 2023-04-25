import React from 'react'
import { ThemeProvider } from 'styled-components'
import theme from 'pages/theme'
import LeftWindow from './leftwindow/LeftWindow'
import { uiStores } from 'stores/uiStores'
import { VRMSceneScreen } from 'components/VRMSceneScreen'
import { startMpActions, stopMpActions } from 'models/Tracking/MediapipeAction'
import Footer from 'components/Footer'
import { autorun } from 'mobx'

const App: React.FC = () => {
  // Start&Stop Mediapipe on pushed Start Button
  React.useEffect(() => {
    autorun(() => {
      if (!(uiStores.startTrack === 'stop')) startMpActions()
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
