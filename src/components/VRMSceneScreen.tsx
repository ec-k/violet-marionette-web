import * as THREE from 'three'
import React from 'react'
import { /*autorun,*/ IReactionDisposer, reaction } from 'mobx'
import { rigController } from 'stores/RigController'
import { VRMRigs } from 'stores/RigController'
import styled from 'styled-components'
import networkHandler from 'models/NetworkHandler'
import { uiStores } from 'stores/uiStores'
import { Viewer } from 'models/vrm-toy-box-ik-solver/Viewer'
import { Avatar } from 'models/vrm-toy-box-ik-solver/Avatar'
import { avatar } from 'models/vrm-toy-box-ik-solver/Avatar'
import * as UI from 'models/vrm-toy-box-ik-solver/UI'
import { throttle } from 'lodash'
import { VRM } from '@pixiv/three-vrm'

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
    UI.setupIKController(sceneRef.current.viewer, avatar)
  }
  avatar.setScene(sceneRef.current.viewer.scene)
  loadVRM('./first_loaded_avatar.vrm')
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

  const render3d = (rig?: VRMRigs | null) => {
    const scene = sceneRef.current
    const viewer = sceneRef.current?.viewer
    const glCtx = viewer?.renderer?.getContext()
    const vrm = scene?.avatar.vrm
    if (vrm && glCtx && !glCtx.isContextLost() && viewer) {
      if (!isAddedVrm) {
        viewer.scene.add(vrm.scene)
        isAddedVrm = true
      }
      if (rig) rigController.setVrmPose(vrm, rig)
      vrm.update(scene.clock.getDelta())
      viewer.renderer.render(viewer.scene, viewer.camera)
    }
  }
  const fps = 30
  const sendPose = throttle((vrm: VRM, sendActive: boolean) => {
    if (!vrm) return
    if (sendActive) networkHandler.SendPoseMessage(vrm)
  }, 1000 / fps)
  const mainRoop = () => {
    render3d(rigController.rig)
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

    window.addEventListener('resize', () => {
      if (sceneRef.current) sceneRef.current.viewer.onResize()
    })

    return () => {
      for (const d of dispo) d()
    }
  }, [])

  return (
    <Div>
      <Canvas ref={canvasRef} />
    </Div>
  )
}

export default VRMScene
