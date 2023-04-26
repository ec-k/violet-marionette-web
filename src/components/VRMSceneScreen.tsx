import * as THREE from 'three'
import React from 'react'
import { autorun, IReactionDisposer, reaction } from 'mobx'
import { vrmAvatar } from 'stores/VRMAvatar'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { rigController } from 'stores/RigController'
import { VRMRigs } from 'stores/RigController'
import styled from 'styled-components'
import networkHandler from 'models/NetworkHandler'
import { uiStores } from 'stores/uiStores'

type VRMScene = {
  clock: THREE.Clock
  renderer: THREE.WebGL1Renderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
}

const createScene = (
  sceneRef: React.MutableRefObject<VRMScene | null>,
  canvas: HTMLCanvasElement,
) => {
  const vrmScene = {
    clock: new THREE.Clock(),
    renderer: new THREE.WebGL1Renderer({
      antialias: true,
      alpha: true,
      canvas: canvas,
    }),
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    ),
  }
  sceneRef.current = vrmScene
  canvas.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault()
    createScene(sceneRef, canvas)
  })
  vrmScene.renderer.setSize(window.innerWidth, window.innerHeight)
  vrmScene.renderer.setPixelRatio(window.devicePixelRatio)
  const light = new THREE.DirectionalLight(0xffffff)
  light.position.set(1, 1, 1).normalize()
  vrmScene.scene.add(light)
  vrmScene.camera.position.set(0.0, 1.15, 1.5)
  const controls = new OrbitControls(
    vrmScene.camera,
    vrmScene.renderer.domElement,
  )
  controls.screenSpacePanning = true
  controls.target.set(0.0, 1.15, 0.0)
  controls.update()
  vrmScene.scene.background = new THREE.Color(0x2b2a2f)
  if (vrmAvatar.avatarSrc)
    vrmAvatar.loadVRM(vrmAvatar.avatarSrc, vrmScene.scene)
  return vrmScene
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

  React.useEffect(() => {
    if (!canvasRef.current) return
    if (!sceneRef.current) createScene(sceneRef, canvasRef.current)

    const dispo: IReactionDisposer[] = []

    const render3d = (rig?: VRMRigs) => {
      const scene = sceneRef.current
      const glCtx = scene?.renderer?.getContext()
      const vrm = vrmAvatar.vrm
      if (vrm && glCtx && !glCtx.isContextLost() && scene) {
        if (!isAddedVrm) {
          scene.scene.add(vrm.scene)
          isAddedVrm = true
        }
        if (rig) rigController.setVrmPose(vrm, rig)
        vrm.update(scene.clock.getDelta())
        scene.renderer.render(scene.scene, scene.camera)
      }
    }
    dispo.push(
      autorun(() => {
        render3d(rigController.rig!)
      }),
    )
    dispo.push(
      autorun(() => {
        if (uiStores.startSendMotion)
          networkHandler.SendPoseMessage(vrmAvatar.vrm!, rigController.rig!)
      }),
    )
    dispo.push(
      reaction(
        () => vrmAvatar.avatarSrc,
        () => {
          if (vrmAvatar.avatarSrc && sceneRef.current)
            vrmAvatar.loadVRM(vrmAvatar.avatarSrc, sceneRef.current.scene)
        },
      ),
    )

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
