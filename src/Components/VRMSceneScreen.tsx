// R3Fで簡単に書き直せると思う

import * as THREE from 'three'
import React from 'react'
import { throttle } from 'lodash'
import { autorun, IReactionDisposer } from 'mobx'
import { vrmAvatar } from 'stores/VRMAvatar'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { rigController } from 'stores/RigController'

type VRMScene = {
  clock: THREE.Clock
  renderer: THREE.WebGL1Renderer
  scene: THREE.Scene
  camera: THREE.Camera
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
  scene.camera.position.set(0.0, 1.4, 0.7)
  const controls = new OrbitControls(scene.camera, scene.renderer.domElement)
  controls.screenSpacePanning = true
  controls.target.set(0.0, 1.4, 0.0)
  controls.update()
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
  const connectionTimeInterval = 300

  React.useEffect(() => {
    if (!canvasRef.current) return
    if (!sceneRef.current) createScene(sceneRef, canvasRef.current)

    const dispo: IReactionDisposer[] = []

    const render3d = throttle((vrm, rig) => {
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
    }, connectionTimeInterval)
    dispo.push(
      autorun(() => {
        render3d(vrmAvatar.vrm, rigController.rig)
      }),
    )

    return () => {
      for (const d of dispo) d()
    }
  }, [])

  return (
    <canvas
      // style={{
      //   PointerEvent: 'none',
      //   position: 'relative',
      //   width: window.innerWidth,
      //   height: window.innerHeight,
      //   left: -window.innerWidth / 2,
      //   top: -window.innerHeight / 2,
      // }}
      ref={canvasRef}
    />
  )
}

export default VRMScene
