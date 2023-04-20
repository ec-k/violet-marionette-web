import React from 'react'
import { MainScreen } from 'components/MainScreen'
import { ThemeProvider } from 'styled-components'
import theme from 'pages/theme'
import LeftWindow from './leftwindow/LeftWindow'
import { uiStores } from 'stores/uiStores'

const App: React.FC = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <LeftWindow open={uiStores.openLeftWindow} />
        <MainScreen />
      </ThemeProvider>
    </>
  )
}

export default App
