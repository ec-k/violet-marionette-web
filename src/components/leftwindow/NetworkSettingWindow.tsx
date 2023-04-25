import React from 'react'
import { Stack } from '@mui/material'
// import { networkSettings } from 'stores/settings'
import VM_TextField from 'components/leftwindow/VM_TextField'

const NetworkSettingWindow: React.FC = () => {
  return (
    <>
      <Stack>
        <VM_TextField
          label="User Name (NeosVR)"
          adornment={{ position: 'start', value: 'U―' }}
        />
        <VM_TextField
          label="host"
          defaultValue="localhost"
          adornment={{ position: 'start', value: 'ws://' }}
        />
        <VM_TextField label="port" defaultValue="3000" />
        <VM_TextField
          label="update rate"
          defaultValue="30"
          adornment={{ position: 'end', value: 'fps' }}
        />
      </Stack>
    </>
  )
}

export default NetworkSettingWindow
