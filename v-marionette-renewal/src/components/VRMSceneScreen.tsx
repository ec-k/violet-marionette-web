import * as THREE from 'three'
import React from 'react'
import { reaction } from 'mobx'
import type { IReactionDisposer } from 'mobx'
import styled from '@emotion/styled'
import networkHandler from 'models/networkHandler'
import { uiStores } from 'stores/uiStores'
import { Viewer, Avatar, avatar } from 'models/avatar/'
import { throttle } from 'lodash'
import { VRM } from '@pixiv/three-vrm'
import { mainSceneViewer } from '../stores/scene'
import { networkSettings, trackingSettings } from 'stores/userSettings'

type VRMScene = {
  clock: THREE.Clock
  viewer: Viewer
  avatar: Avatar
}

const createScene = (
  sceneRef: React.MutableRefObject<VRMScene | null>,
  canvas: HTMLCanvasElement,
) => {
  if (!canvas.parentElement) return
  const viewer = new Viewer(canvas)
  if (!viewer) return
  const mainScene = {
    clock: new THREE.Clock(),
    viewer: viewer,
    avatar: avatar,
  }
  sceneRef.current = mainScene
  canvas.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault()
    createScene(sceneRef, canvas)
  })

  async function loadVRM(url: string) {
    const _avatar = sceneRef.current?.avatar
    if (!_avatar) return
    if (!sceneRef.current) return
    await avatar.loadVRM(url)
  }
  avatar.setScene(sceneRef.current.viewer.scene)
  loadVRM('./first_loaded_avatar.vrm')
  mainSceneViewer.current = mainScene.viewer
}

let isAddedVrm = false

const Div = styled.div`
  background-color: #2b2a2f;
`
const Canvas = styled.canvas`
  position: 'relative';
  display: block;
`
export const VRMSceneScreen: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const sceneRef = React.useRef<VRMScene | null>(null)

  const render3d = () => {
    const scene = sceneRef.current
    const viewer = sceneRef.current?.viewer
    const glCtx = viewer?.renderer?.getContext()
    const vrm = scene?.avatar.vrm
    if (vrm && glCtx && !glCtx.isContextLost() && viewer) {
      if (!isAddedVrm) {
        viewer.scene.add(vrm.scene)
        isAddedVrm = true
      }
      if (avatar) avatar.updatePose(trackingSettings.enabledIK)
      vrm.update(scene.clock.getDelta())
      viewer.renderer.render(viewer.scene, viewer.camera)
    }
  }
  let sendPose = throttle((vrm: VRM, sendActive: boolean) => {
    if (!vrm) return
    if (sendActive) networkHandler.SendPoseMessage(vrm)
  }, 1000 / networkSettings.sendRate)
  const mainRoop = () => {
    render3d()
    sendPose(sceneRef.current?.avatar.vrm!, uiStores.startSendMotion)
    requestAnimationFrame(mainRoop)
  }
  React.useEffect(() => {
    if (!canvasRef.current) return
    if (!sceneRef.current) createScene(sceneRef, canvasRef.current)

    const dispo: IReactionDisposer[] = []

    mainRoop()
    dispo.push(
      reaction(
        () => sceneRef.current?.avatar.avatarSrc,
        () => {
          if (sceneRef.current?.avatar.avatarSrc && sceneRef.current) {
            sceneRef.current?.avatar.loadVRM(sceneRef.current?.avatar.avatarSrc)
          }
        },
      ),
    )
    dispo.push(
      reaction(
        () => networkSettings.sendRate,
        () => {
          sendPose = throttle((vrm: VRM, sendActive: boolean) => {
            if (!vrm) return
            if (sendActive) networkHandler.SendPoseMessage(vrm)
          }, 1000 / networkSettings.sendRate)
        },
      ),
    )

    window.addEventListener('resize', () => {
      if (sceneRef.current) sceneRef.current.viewer.onResize()
    })

    return () => {
      for (const d of dispo) d()
    }
  }, [sendPose])

  return (
    <Div>
      <Canvas ref={canvasRef} />
    </Div>
  )
}
