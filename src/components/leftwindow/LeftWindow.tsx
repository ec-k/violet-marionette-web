import React from 'react'
import styled from 'styled-components'
import { uiStores } from 'stores/uiStores'
import { autorun } from 'mobx'
import TrackingSettingWindow from './TrackingSettingWindow'

interface Props {
  open: boolean
}

const LeftWindow: React.FC<Props> = () => {
  const [open, setOpen] = React.useState<boolean>(false)
  const Div = styled.div`
    position: absolute;
    width: 400px;
    height: 100%;
    left: 0px;
    top: 0px;
    background: rgba(4, 1, 13, 0.3);
  `
  React.useEffect(() => {
    autorun(() => {
      if (uiStores.getOpenLeftWindow) setOpen(true)
      else setOpen(false)
    })
  })

  return (
    <>
      {open && (
        <Div>
          <TrackingSettingWindow />
        </Div>
      )}
    </>
  )
}

export default LeftWindow
