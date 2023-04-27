import React from 'react'
import { Stack, Button } from '@mui/material'
// import { otherSettings } from 'stores/settings'
import { vrmAvatar } from 'stores/VRMAvatar'

const OtherSettings: React.FC = () => {
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = URL.createObjectURL(event.target.files![0])
    vrmAvatar.setAvatarSrc(url)
    URL.revokeObjectURL(url)
  }

  return (
    <Stack spacing={2}>
      <Button variant="outlined" component="label">
        Load VRM
        <input hidden accept=".vrm" type="file" onChange={handleChange}></input>
      </Button>
    </Stack>
  )
}

export default OtherSettings
