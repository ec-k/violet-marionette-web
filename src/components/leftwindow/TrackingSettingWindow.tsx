import React from 'react'
import { CameraScreen } from 'components/leftwindow/CameraScreen'
import {
  Stack,
  Box,
  Switch,
  FormControlLabel,
  // ToggleButtonGroup,
  // ToggleButton,
  Button,
} from '@mui/material'
// import VM_TextField from 'components/leftwindow/VM_TextField'
import purple from '@mui/material/colors/purple'
import { trackingSettings } from 'stores/settings'

const TrackingSettingWindow: React.FC = () => {
  const [showResult, setShowResult] = React.useState<boolean>(true)
  const [activatedLeg, setActivatedLeg] = React.useState<boolean>(false)
  // const [aligntment, setAlignment] = React.useState<string>(
  //   trackingSettings.coefCalculationBase_,
  // )
  // const userHeightInputRef = React.useRef<HTMLInputElement | null>(null)
  // const userArmLengthInputRef = React.useRef<HTMLInputElement | null>(null)

  // const handleClick = () => {
  //   trackingSettings.coefCalculationBase_ = aligntment
  //   if (aligntment === 'height') {
  //     const value = Number(userHeightInputRef.current?.value)
  //     if (!Number.isNaN(value)) trackingSettings.userHeight_ = value
  //   } else {
  //     const value = Number(userArmLengthInputRef.current?.value)
  //     if (!Number.isNaN(value)) trackingSettings.userArmLength_ = value
  //   }
  // }
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowResult(event.target.checked)
  }
  // const handleAlignment = (
  //   event: React.MouseEvent<HTMLElement>,
  //   newAlignt: string | null,
  // ) => {
  //   console.log(event) // Fixme: this is for escaping worning for not using variable
  //   if (newAlignt !== null) setAlignment(newAlignt)
  // }
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
        {/* <Button variant="outlined" color="primary" onClick={handleClick}>
          Update
        </Button> */}
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
        {/* {aligntment === 'height' ? (
          <VM_TextField
            label="Height"
            defaultValue={trackingSettings.userHeight_}
            adornment={{ position: 'end', value: 'cm' }}
            inputRef={userHeightInputRef}
            inputProps={{ pattern: '^[0-9]+$' }}
          />
        ) : (
          <VM_TextField
            label="Arm Length"
            defaultValue={trackingSettings.userArmLength_}
            adornment={{ position: 'end', value: 'cm' }}
            inputRef={userArmLengthInputRef}
            inputProps={{ pattern: '^[0-9]+$' }}
          />
        )}
        <ToggleButtonGroup
          size="small"
          color="primary"
          value={aligntment}
          onChange={handleAlignment}
          exclusive
        >
          <ToggleButton value="height" color="primary" sx={{ color: '#999' }}>
            Heigt
          </ToggleButton>
          <ToggleButton
            value="armLength"
            color="primary"
            sx={{ color: '#999' }}
          >
            Arm Length
          </ToggleButton>
        </ToggleButtonGroup> */}
        {/* <FormControlLabel
          control={<Switch color="primary" defaultChecked />}
          label="Face Tracking"
        /> */}
        {/* <FormControlLabel
          control={<Switch color="primary" defaultChecked />}
          label="Hand Tracking"
        />
        <FormControlLabel
          control={<Switch color="primary" defaultChecked />}
          label="Foot Tracking"
        /> */}
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
