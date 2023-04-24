// R3Fで簡単に書き直せると思う

import * as THREE from 'three'
import React from 'react'
import { autorun, IReactionDisposer } from 'mobx'
import { vrmAvatar } from 'stores/VRMAvatar'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { rigController } from 'stores/RigController'
import { VRM } from '@pixiv/three-vrm'
import { VRMRigs } from 'stores/RigController'
import styled from 'styled-components'

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
  const scene = {
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
  sceneRef.current = scene
  canvas.addEventListener('webglcontextlost', (ev) => {
    ev.preventDefault()
    createScene(sceneRef, canvas)
  })
  scene.renderer.setSize(window.innerWidth, window.innerHeight)
  scene.renderer.setPixelRatio(window.devicePixelRatio)
  const light = new THREE.DirectionalLight(0xffffff)
  light.position.set(1, 1, 1).normalize()
  scene.scene.add(light)
  scene.camera.position.set(0.0, 1.15, 1.5)
  const controls = new OrbitControls(scene.camera, scene.renderer.domElement)
  controls.screenSpacePanning = true
  controls.target.set(0.0, 1.15, 0.0)
  controls.update()
  scene.scene.background = new THREE.Color(0x2b2a2f)
  if (vrmAvatar.vrm) {
    scene.scene.add(vrmAvatar.vrm.scene)
    isAddedVrm = true
  }
  return scene
}

let isAddedVrm = false

export const VRMSceneScreen: React.FC<{}> = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const sceneRef = React.useRef<VRMScene | null>(null)
  const Div = styled.div`
    background-color: #2b2a2f;
  `
  const Canvas = styled.canvas`
    position: 'relative';
    display: block;
  `

  React.useEffect(() => {
    if (!canvasRef.current) return
    if (!sceneRef.current) createScene(sceneRef, canvasRef.current)

    const dispo: IReactionDisposer[] = []

    const render3d = (vrm: VRM, rig?: VRMRigs) => {
      const scene = sceneRef.current
      const glCtx = scene?.renderer?.getContext()
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
        if (vrmAvatar.vrm) render3d(vrmAvatar.vrm, rigController.rig!)
      }),
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
