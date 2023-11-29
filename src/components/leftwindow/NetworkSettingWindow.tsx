import React from 'react'
import { Stack, Button } from '@mui/material'
import { networkSettings } from 'stores/settings'
import VMTextField from 'components/leftwindow/VMTextField'
import networkHandler from 'models/NetworkHandler'

const NetworkSettingWindow: React.FC = () => {
  const userNameInputRef = React.useRef<HTMLInputElement | null>(null)
  const hostInputRef = React.useRef<HTMLInputElement | null>(null)
  const portInputRef = React.useRef<HTMLInputElement | null>(null)
  const sendRateInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    const port = Number(portInputRef.current?.value)
    const sendRate = Number(sendRateInputRef.current?.value)

    networkSettings.neosUserName_ = String(userNameInputRef.current?.value)
    networkSettings.host_ = String(hostInputRef.current?.value)
    if (!Number.isNaN(port)) networkSettings.port_ = port
    if (!Number.isNaN(sendRate)) networkSettings.sendRate = sendRate

    networkHandler.ConnectWS()
  }

  return (
    <>
      <Stack spacing={2}>
        <Button variant="outlined" color="primary" onClick={handleClick}>
          Update
        </Button>
        <VMTextField
          label="User Name (NeosVR)"
          defaultValue={networkSettings.neosUserName_}
          // adornment={{ position: 'start', value: 'U -' }}
          inputRef={userNameInputRef}
        />
        <VMTextField
          label="host"
          defaultValue={networkSettings.host_}
          adornment={{ position: 'start', value: 'ws://' }}
          inputRef={hostInputRef}
        />
        <VMTextField
          label="port"
          defaultValue={networkSettings.port_}
          inputRef={portInputRef}
          inputProps={{ pattern: '^[0-9]+$' }}
        />
        <VMTextField
          label="update rate"
          defaultValue={networkSettings.sendRate}
          adornment={{ position: 'end', value: 'fps' }}
          inputRef={sendRateInputRef}
          inputProps={{ pattern: '^[0-9]+$' }}
        />
      </Stack>
    </>
  )
}

export default NetworkSettingWindow
