import React from 'react'
import { CameraScreen } from '@/components/setting-window/CameraScreen'
import { Stack, Box, Switch, FormControlLabel, Button } from '@mui/material'
import VMTextField from '@/components/setting-window/VMTextField'
import { purple } from '@mui/material/colors'
import { trackingSettings } from '@/stores/userSettings'

const TrackingSettingWindow: React.FC = () => {
  const [showVideo, setShowVideo] = React.useState<boolean>(false)
  const [enabledLeg, setActivatedLeg] = React.useState<boolean>(trackingSettings.enableLeg)
  const [enabledIK, setEnabledIK] = React.useState<boolean>(trackingSettings.enabledIK)
  const [isPerfectSyncEnabled, setIsPerfectSyncEnabled] = React.useState<boolean>(
    trackingSettings.isPerfectSyncEnabled,
  )
  const cameraAngleInputRef = React.useRef<HTMLInputElement | null>(null)
  const [sit, setSit] = React.useState<boolean>(trackingSettings.sit)
  // const distanceToMonitorRef = React.useRef<HTMLInputElement | null>(null)
  // const monitorSizeRef = React.useRef<HTMLInputElement | null>(null)
  // const eyeRotOffsetRef = React.useRef<HTMLInputElement | null>(null)

  const updateSettings = () => {
    const cameraDepAngle = Number(cameraAngleInputRef.current?.value)
    // const monitorSize = Number(monitorSizeRef.current?.value)
    // const disToMonitor = Number(distanceToMonitorRef.current?.value)
    // const eyeRotOffset = Number(eyeRotOffsetRef.current?.value)

    if (!Number.isNaN(cameraDepAngle)) trackingSettings.cameraDepressionAngle = cameraDepAngle
    // if (!Number.isNaN(monitorSize)) trackingSettings.monitorInch = monitorSize
    // if (!Number.isNaN(disToMonitor))
    //   trackingSettings.distanceToMonitor = disToMonitor
    // if (!Number.isNaN(eyeRotOffsetRef))
    //   trackingSettings.eyeRotationOffset = eyeRotOffset
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
          <CameraScreen showVideo={showVideo} />
        </Box>
        <FormControlLabel
          control={
            <Switch
              color="primary"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setShowVideo(event.target.checked)
              }
              checked={showVideo}
            ></Switch>
          }
          checked={showVideo}
          label="Show camera"
          sx={{ color: purple[50] }}
        />
        <VMTextField
          label="Camera Depression Angle"
          defaultValue={trackingSettings.cameraDepressionAngle}
          adornment={{ position: 'end', value: '°' }}
          inputRef={cameraAngleInputRef}
          inputProps={{ pattern: '^[0-9]+$' }}
        />
        {/* <VMTextField
          label="Monitor Size"
          defaultValue={trackingSettings.monitorInch}
          adornment={{ position: 'end', value: 'inch' }}
          inputRef={monitorSizeRef}
          inputProps={{ pattern: '^[0-9]+$' }}
        />
        <VMTextField
          label="Distance to Monitor"
          defaultValue={trackingSettings.distanceToMonitor}
          adornment={{ position: 'end', value: 'cm' }}
          inputRef={distanceToMonitorRef}
          inputProps={{ pattern: '^[0-9]+$' }}
        /> */}
        {/* <VMTextField
          label="Eye Rotation Offset (yaw)"
          defaultValue={trackingSettings.eyeRotationOffset}
          adornment={{ position: 'end', value: '°' }}
          inputRef={eyeRotOffsetRef}
          inputProps={{ pattern: '^[-+]?[0-9]+$' }}
        /> */}
        <FormControlLabel
          control={
            <Switch
              color="primary"
              defaultChecked={enabledLeg}
              onChange={() => {
                trackingSettings.enableLeg = !enabledLeg
                setActivatedLeg(!enabledLeg)
              }}
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
              onChange={() => {
                trackingSettings.enabledIK = !enabledIK
                setEnabledIK(!enabledIK)
              }}
            />
          }
          label="Use IK (arm)"
          sx={{ color: purple[50] }}
        />
        <FormControlLabel
          control={
            <Switch
              color="primary"
              defaultChecked={isPerfectSyncEnabled}
              onChange={() => {
                trackingSettings.isPerfectSyncEnabled = !isPerfectSyncEnabled
                setIsPerfectSyncEnabled(!isPerfectSyncEnabled)
              }}
            />
          }
          label="Is PerfectSync"
          sx={{ color: purple[50] }}
        />
        <FormControlLabel
          control={<Switch color="primary" defaultChecked={sit} onChange={toggleSit} />}
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
