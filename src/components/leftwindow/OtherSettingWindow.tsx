import React from 'react'
import { Stack, Button, FormControlLabel, Switch } from '@mui/material'
import { avatar } from 'models/vrm-toy-box-ik-solver/Avatar'
import {
  enableIKController,
  disableIKController,
} from 'models/vrm-toy-box-ik-solver/UI'
import purple from '@mui/material/colors/purple'

const OtherSettings: React.FC = () => {
  const [showIkTarget, setShowIkTarget] = React.useState<boolean>(false)

  const loadVRM = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = URL.createObjectURL(event.target.files![0])
    avatar.setAvatarSrc(url)
    URL.revokeObjectURL(url)
  }
  const toggleIkTargetVisualization = () => {
    if (!showIkTarget) enableIKController()
    else disableIKController()
    setShowIkTarget(!showIkTarget)
  }

  return (
    <Stack spacing={2}>
      <Button variant="outlined" component="label">
        Load VRM
        <input hidden accept=".vrm" type="file" onChange={loadVRM}></input>
      </Button>
      <FormControlLabel
        control={
          <Switch
            color="primary"
            defaultChecked={showIkTarget}
            onChange={toggleIkTargetVisualization}
          />
        }
        label="Show IK Target"
        sx={{ color: purple[50] }}
      />
    </Stack>
  )
}

export default OtherSettings
