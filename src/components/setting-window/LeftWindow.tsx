import React from 'react'
import styled from '@emotion/styled'
import { uiStores } from '@/stores/uiStores'
import { autorun } from 'mobx'
import { Box, Tabs, Tab } from '@mui/material'
import TrackingSettingWindow from '@/components/setting-window/TrackingSettingWindow'
import NetworkSettingWindow from '@/components/setting-window/NetworkSettingWindow'
import OtherSettings from '@/components/setting-window/OtherSettingWindow'

const tabPanelHeight = 10 // %
const Div = styled.div`
  position: absolute;
  width: 400px;
  height: 100%;
  left: 0px;
  top: px;
  background: rgba(4, 1, 13, 0.3);
`
const SettingPanel = styled.div`
  display: flex;
  flex-direction: column;
  width: 80%;
  left: 40px;
  top: 60px;
  position: relative;
  // height:${100 - tabPanelHeight}%;
`
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props

  return <SettingPanel hidden={value !== index}>{value === index && <>{children}</>}</SettingPanel>
}

interface Props {
  open: boolean
}
const LeftWindow: React.FC<Props> = () => {
  const [open, setOpen] = React.useState<boolean>(false)
  const [settingItem, setSettingItem] = React.useState<number>(0)
  React.useEffect(() => {
    autorun(() => {
      if (uiStores.openLeftWindow) setOpen(true)
      else setOpen(false)
    })
  })

  function handleChange(event: React.SyntheticEvent, newValue: number) {
    // Fixme: 引数を入れるために使わない引数eventを定義している．これを使わないとデバッグ時に怒られるのでしかたなく
    //        Console.log(event) としている．別の手があれば，そうしたい．
    console.log(event)
    setSettingItem(newValue)
  }

  return (
    <>
      {open && (
        <Div>
          <Box
            sx={{
              left: '40px',
              width: '80%',
              height: `${tabPanelHeight}%`,
              position: 'relative',
            }}
          >
            <Tabs
              value={settingItem}
              onChange={handleChange}
              indicatorColor="primary"
              sx={{ top: '50px', height: '10%', position: 'relative' }}
              centered={true}
            >
              <Tab label="Tracking" style={{ color: '#fff' }} />
              <Tab label="Network" style={{ color: '#fff' }} />
              <Tab label="Others" style={{ color: '#fff' }} />
            </Tabs>
          </Box>
          <TabPanel value={settingItem} index={0}>
            <TrackingSettingWindow />
          </TabPanel>
          <TabPanel value={settingItem} index={1}>
            <NetworkSettingWindow />
          </TabPanel>
          <TabPanel value={settingItem} index={2}>
            <OtherSettings />
          </TabPanel>
        </Div>
      )}
    </>
  )
}

export default LeftWindow
