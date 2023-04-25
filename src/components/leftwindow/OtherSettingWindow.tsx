import React from 'react'
import styled from 'styled-components'
// import { CameraScreen } from 'components/CameraScreen'
import { Stack, Button } from '@mui/material'
// import { otherSettings } from 'stores/settings'

const Div = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  height: 80%;
  left: 40px;
  top: 20px;
  color: #fff;
  position: relative;
`

const TrackingSettingWindow: React.FC = () => {
  return (
    <Div>
      {/* <Preview>
        <CameraScreen />
      </Preview> */}
      <Stack></Stack>
      <p style={{ color: '#DAC0EE' }}>Under Construction...</p>
      <Button variant="outlined" color="secondary">
        Update
      </Button>
    </Div>
  )
}

export default TrackingSettingWindow
