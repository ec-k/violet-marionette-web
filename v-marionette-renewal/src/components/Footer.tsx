import React from 'react'
import { uiStores } from 'stores/uiStores'
import styled from 'styled-components'
import { Fab } from '@mui/material'
import SettingIcon from '@mui/icons-material/Settings'
import SettingIconOutlined from '@mui/icons-material/SettingsOutlined'
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import CircularProgress from '@mui/material/CircularProgress'
import { autorun, IReactionDisposer } from 'mobx'

type MediapipeState = 'stop' | 'loading' | 'active'

const Div = styled.div`
  position: absolute;
  width: 100%;
  height: 123px;
  left: 0px;
  bottom: 0px;
`

// HACK: I just want to render this component when observables of uiStores change.
//       It is better if useState can be removed.
const Footer: React.FC = () => {
  const [openSettings, setOpenSettings] = React.useState<boolean>(false)
  const [startTracking, setStartTracking] =
    React.useState<MediapipeState>('stop')
  const [startSendingMotion, setStartSendingMotion] =
    React.useState<boolean>(false)

  function toggleOpenSettings() {
    setOpenSettings(!openSettings)
    uiStores.toggleLeftWindow()
  }
  function activateTracking() {
    setStartTracking('loading')
    uiStores.toggleStartTrack()
  }
  function stopTracking() {
    setStartTracking('stop')
    uiStores.toggleStartTrack()
  }
  function toggleStartSendPose() {
    setStartSendingMotion(!startSendingMotion)
    uiStores.toggleStartSendPose()
  }

  React.useEffect(() => {
    const dispo: IReactionDisposer[] = []
    dispo.push(
      autorun(() => {
        if (uiStores.startTrack === 'active') setStartTracking('active')
      }),
    )
    return () => {
      for (const d of dispo) d()
    }
  }, [])

  return (
    <Div className="footer">
      {/* Setting button */}
      {openSettings ? (
        <Fab
          color="primary"
          onClick={toggleOpenSettings}
          size="small"
          style={{ left: '1%' }}
        >
          <SettingIcon />
        </Fab>
      ) : (
        <Fab onClick={toggleOpenSettings} size="small" style={{ left: '1%' }}>
          <SettingIconOutlined />
        </Fab>
      )}

      {/* Start Tracking button */}
      {(() => {
        if (startTracking === 'active')
          return (
            <Fab color="primary" onClick={stopTracking} style={{ left: '45%' }}>
              <VideocamIcon />
            </Fab>
          )
        else if (startTracking === 'loading')
          return (
            <Fab style={{ left: '45%' }}>
              <CircularProgress color="primary" size={21} />
            </Fab>
          )
        else
          return (
            <Fab onClick={activateTracking} style={{ left: '45%' }}>
              <VideocamOffIcon />
            </Fab>
          )
      })()}

      {/* Start Send Pose button */}
      {startSendingMotion ? (
        <Fab
          color="primary"
          onClick={toggleStartSendPose}
          style={{ left: '46%' }}
        >
          <WifiIcon />
        </Fab>
      ) : (
        <Fab onClick={toggleStartSendPose} style={{ left: '46%' }}>
          <WifiOffIcon />
        </Fab>
      )}
    </Div>
  )
}

export default Footer
