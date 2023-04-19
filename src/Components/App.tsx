import React from 'react'
import { MainScreen } from 'components/MainScreen'
import styled, { ThemeProvider } from 'styled-components'
import { CameraScreen } from 'components/CameraScreen'
import theme from 'styles/theme'

const Preview = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  bottom: 16px;
  right: 16px;
  overflow: hidden;
  border-radius: 8px;
  background: #222;
`

const App: React.FC = () => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Preview>
          x
          <CameraScreen />
        </Preview>
        <MainScreen />
      </ThemeProvider>
    </>
  )
}

export default App
