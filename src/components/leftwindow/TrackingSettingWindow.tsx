import React from 'react'
import { CameraScreen } from 'components/leftwindow/CameraScreen'
import {
  Stack,
  Box,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import VM_TextField from 'components/leftwindow/VM_TextField'
import purple from '@mui/material/colors/purple'
// import { trackingSettings } from 'stores/settings'

const TrackingSettingWindow: React.FC = () => {
  const [showResult, setShowResult] = React.useState<boolean>(true)
  const [aligntment, setAlignment] = React.useState<string>('height')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowResult(event.target.checked)
  }
  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignt: string | null,
  ) => {
    console.log(event) // Fixme: this is for escaping worning for not using variable
    if (newAlignt !== null) setAlignment(newAlignt)
  }

  return (
    <>
      <Stack spacing={2} sx={{ height: '90%' }}>
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
        {aligntment === 'height' ? (
          <VM_TextField
            label="Height"
            adornment={{ position: 'end', value: 'cm' }}
          />
        ) : (
          <VM_TextField
            label="Arm Length"
            adornment={{ position: 'end', value: 'cm' }}
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
        </ToggleButtonGroup>
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
      </Stack>
    </>
  )
}

export default TrackingSettingWindow
