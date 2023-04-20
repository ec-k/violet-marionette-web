import React from 'react'
import styled from 'styled-components'
import { CameraScreen } from 'components/CameraScreen'

const TrackingSettingWindow: React.FC<{}> = () => {
  const Preview = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 16px;
    left: 16px;
    overflow: hidden;
    border-radius: 8px;
    background: #222;
  `
  return (
    <>
      <Preview>
        <CameraScreen />
      </Preview>
    </>
  )
}

export default TrackingSettingWindow
