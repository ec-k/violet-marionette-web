import React from 'react'
import { CameraScreen } from 'components/leftwindow/CameraScreen'
import { Stack, Box, Switch, FormControlLabel, Button } from '@mui/material'
import VMTextField from 'components/leftwindow/VMTextField'
import purple from '@mui/material/colors/purple'
import { trackingSettings } from 'stores/settings'

const TrackingSettingWindow: React.FC = () => {
  const [showResult, setShowResult] = React.useState<boolean>(true)
  const [activatedLeg, setActivatedLeg] = React.useState<boolean>(false)
  const cameraAngleInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowResult(event.target.checked)
  }
  const handleClick = () => {
    const value = Number(cameraAngleInputRef.current?.value)
    if (!Number.isNaN(value)) trackingSettings.cameraDepressionAngle = value
  }
  const _activateLeg = () => {
    trackingSettings.enableLeg = true
    setActivatedLeg(trackingSettings.enableLeg)
  }
  const _disactivateLeg = () => {
    trackingSettings.enableLeg = false
    setActivatedLeg(trackingSettings.enableLeg)
  }

  return (
    <>
      <Stack spacing={2}>
        <Button variant="outlined" color="primary" onClick={handleClick}>
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
              onChange={handleChange}
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
        {/* <FormControlLabel
          control={<Switch color="primary" defaultChecked />}
          label="Foot Tracking"
        />  */}
        {activatedLeg ? (
          <Button variant="contained" color="primary" onClick={_disactivateLeg}>
            Move Leg
          </Button>
        ) : (
          <Button variant="outlined" color="primary" onClick={_activateLeg}>
            Move Leg
          </Button>
        )}
      </Stack>
    </>
  )
}

export default TrackingSettingWindow
