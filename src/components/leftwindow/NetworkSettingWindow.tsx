import React from 'react'
import { Stack } from '@mui/material'
// import { networkSettings } from 'stores/settings'
import VM_TextField from 'components/leftwindow/VM_TextField'

const NetworkSettingWindow: React.FC = () => {
  return (
    <>
      {/* <Preview>
        <CameraScreen />
      </Preview> */}
      <Stack>
        <VM_TextField label="User Name (NeosVR)" />
        <VM_TextField label="host" defaultValue="ws://localhost" />
        <VM_TextField label="port" defaultValue="3000" />
        <VM_TextField label="update rate" defaultValue="30" />
      </Stack>
    </>
  )
}

export default NetworkSettingWindow
