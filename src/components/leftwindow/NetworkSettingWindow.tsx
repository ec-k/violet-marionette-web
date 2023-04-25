import React from 'react'
import { Stack, TextField } from '@mui/material'
// import { networkSettings } from 'stores/settings'

const NetworkSettingWindow: React.FC = () => {
  return (
    <>
      {/* <Preview>
        <CameraScreen />
      </Preview> */}
      <Stack>
        <TextField
          variant="standard"
          color="secondary"
          label="User Name (NeosVR)"
          InputLabelProps={{ style: { color: '#DAC0EE' } }}
        />
        <TextField
          variant="standard"
          color="secondary"
          label="host"
          InputLabelProps={{ style: { color: '#DAC0EE' } }}
        />
        <TextField
          variant="standard"
          color="secondary"
          label="port"
          InputLabelProps={{ style: { color: '#DAC0EE' } }}
        />
        <TextField
          variant="standard"
          color="secondary"
          label="update rate"
          InputLabelProps={{ style: { color: '#DAC0EE' } }}
        />
        {/* <TextField variant="standard" color="secondary" label="delay" InputLabelProps={{ style: { color: "#DAC0EE" } }} /> */}
      </Stack>
    </>
  )
}

export default NetworkSettingWindow
