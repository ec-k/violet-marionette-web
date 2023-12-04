import React from 'react'
import { CameraScreen } from 'components/leftwindow/CameraScreen'
import { Stack, Box, Switch, FormControlLabel, Button } from '@mui/material'
import VMTextField from 'components/leftwindow/VMTextField'
import purple from '@mui/material/colors/purple'
import { trackingSettings } from 'stores/settings'

const TrackingSettingWindow: React.FC = () => {
  const [showResult, setShowResult] = React.useState<boolean>(true)
  const [enabledLeg, setActivatedLeg] = React.useState<boolean>(
    trackingSettings.enableLeg,
  )
  const [enabledIK, setEnabledIK] = React.useState<boolean>(
    trackingSettings.enabledIK,
  )
  const cameraAngleInputRef = React.useRef<HTMLInputElement | null>(null)
  const [sit, setSit] = React.useState<boolean>(trackingSettings.sit)

  const toggleShowResults = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowResult(event.target.checked)
  }
  const updateSettings = () => {
    const value = Number(cameraAngleInputRef.current?.value)
    if (!Number.isNaN(value)) trackingSettings.cameraDepressionAngle = value
  }
  const toggleLegActivation = () => {
    trackingSettings.enableLeg = !enabledLeg
    setActivatedLeg(!enabledLeg)
  }
  const toggleIKActivation = () => {
    trackingSettings.enabledIK = !enabledIK
    setEnabledIK(!enabledIK)
  }
  const toggleSit = () => {
    trackingSettings.sit = !sit
    setSit(!sit)
  }

  return (
    <>
      <Stack spacing={2}>
        <Button variant="outlined" color="primary" onClick={updateSettings}>
          Update
        </Button>
        <Box
          sx={{
            overflow: 'hidden',
            background: '#222',
            height: '230px',
          }}
        >
          <CameraScreen showResult={showResult} />
        </Box>
        <FormControlLabel
          control={
            <Switch
              color="primary"
              onChange={toggleShowResults}
              checked={showResult}
            ></Switch>
          }
          checked={showResult}
          label="Mediapipe Result"
          sx={{ color: purple[50] }}
        />
        <VMTextField
          label="Camera Depression Angle"
          defaultValue={trackingSettings.cameraDepressionAngle}
          adornment={{ position: 'end', value: '°' }}
          inputRef={cameraAngleInputRef}
          inputProps={{ pattern: '^[0-9]+$' }}
        />
        <FormControlLabel
          control={
            <Switch
              color="primary"
              defaultChecked={enabledLeg}
              onChange={toggleLegActivation}
            />
          }
          label="Track Legs"
          sx={{ color: purple[50] }}
        />
        <FormControlLabel
          control={
            <Switch
              color="primary"
              defaultChecked={enabledIK}
              onChange={toggleIKActivation}
            />
          }
          label="Use IK (arm)"
          sx={{ color: purple[50] }}
        />
        <FormControlLabel
          control={
            <Switch color="primary" defaultChecked={sit} onChange={toggleSit} />
          }
          label="sit"
          sx={{ color: purple[50] }}
        />
        {/* {activatedLeg ? (
          <Button variant="contained" color="primary" onClick={_disactivateLeg}>
            Move Leg
          </Button>
        ) : (
          <Button variant="outlined" color="primary" onClick={_activateLeg}>
            Move Leg
          </Button>
        )} */}
      </Stack>
    </>
  )
}

export default TrackingSettingWindow
