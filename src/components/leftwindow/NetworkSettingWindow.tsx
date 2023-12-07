import React from 'react'
import { Stack, Button } from '@mui/material'
import { networkSettings } from 'stores/userSettings'
import VMTextField from 'components/leftwindow/VMTextField'
import networkHandler from 'models/NetworkHandler'
import { IReactionDisposer, reaction } from 'mobx'

const NetworkSettingWindow: React.FC = () => {
  const userNameInputRef = React.useRef<HTMLInputElement | null>(null)
  const sendRateInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    const sendRate = Number(sendRateInputRef.current?.value)

    networkSettings.userName = String(userNameInputRef.current?.value)
    if (!Number.isNaN(sendRate)) networkSettings.sendRate = sendRate

    // networkHandler.ConnectWS()
  }

  React.useEffect(() => {
    const dispo: IReactionDisposer[] = []
    dispo.push(
      reaction(
        () => networkSettings.userName,
        () => {
          networkHandler.sendAttributes()
        },
      ),
    )
  }, [])

  return (
    <>
      <Stack spacing={2}>
        <Button variant="outlined" color="primary" onClick={handleClick}>
          Update
        </Button>
        <VMTextField
          label="User Name (Resonite)"
          defaultValue={networkSettings.userName}
          // adornment={{ position: 'start', value: 'U -' }}
          inputRef={userNameInputRef}
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
