import React from 'react'
import styled from 'styled-components'
import { CameraScreen } from 'components/CameraScreen'

const Preview = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 16px;
  left: 16px;
  overflow: hidden;
  // border-radius: 8px;
  background: #222;
  margin: 0 auto;
`
const TrackingSettingWindow: React.FC = () => {
  return (
    <>
      <Preview>
        <CameraScreen />
      </Preview>
      <p style={{ color: 'white' }}>tmp</p>
    </>
  )
}

export default TrackingSettingWindow
