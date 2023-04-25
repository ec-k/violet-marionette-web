import React from 'react'
// import { CameraScreen } from 'components/CameraScreen'
import { Stack, FormControlLabel, Switch } from '@mui/material'
import VM_TextField from 'components/leftwindow/VM_TextField'
// import { trackingSettings } from 'stores/settings'

// const Preview = styled.div`
//   display: flex;
//   flex-direction: column;
//   position: absolute;
//   top: 30px;
//   left: 40px;
//   overflow: hidden;
//   // border-radius: 8px;
//   background: #222;
// `

const TrackingSettingWindow: React.FC = () => {
  return (
    <>
      {/* <Preview>
        <CameraScreen />
      </Preview> */}
      <Stack spacing={2} sx={{ height: '90%' }}>
        <VM_TextField label="Height" />
        <VM_TextField label="Arm Length" />
        <FormControlLabel
          control={<Switch color="primary" defaultChecked />}
          label="Face Tracking"
        />
        {/* <FormControlLabel
          control={<Switch color="primary" defaultChecked />}
          label="Hand Tracking"
        />
        <FormControlLabel
          control={<Switch color="primary" defaultChecked />}
          label="Foot Tracking"
        /> */}
      </Stack>
    </>
  )
}

export default TrackingSettingWindow
