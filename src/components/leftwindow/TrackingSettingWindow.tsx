import React from 'react'
// import { CameraScreen } from 'components/CameraScreen'
import { Stack, FormControlLabel, TextField, Switch } from '@mui/material'
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
        <TextField
          variant="standard"
          color="secondary"
          label="Height"
          InputLabelProps={{ style: { color: '#DAC0EE' } }}
          InputProps={{ style: { color: '#fff' } }}
        />
        <TextField
          variant="standard"
          color="secondary"
          label="Arm Length"
          InputLabelProps={{ style: { color: '#DAC0EE' } }}
        />
        <FormControlLabel
          control={<Switch color="secondary" defaultChecked />}
          label="Face Tracking"
        />
        <FormControlLabel
          control={<Switch color="secondary" defaultChecked />}
          label="Hand Tracking"
        />
        <FormControlLabel
          control={<Switch color="secondary" defaultChecked />}
          label="Foot Tracking"
        />
      </Stack>
    </>
  )
}

export default TrackingSettingWindow
