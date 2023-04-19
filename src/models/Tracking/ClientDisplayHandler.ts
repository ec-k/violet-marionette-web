import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// THREEJS WORLD SETUP

// renderer
const renderer = new THREE.WebGL1Renderer({ alpha: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

// camera
const orbitCamera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)

// controls
const orbitControls = new OrbitControls(orbitCamera, renderer.domElement) // カメラアングルを複数用意するのに使える．Configの値で制御できるような設計にしてもいいかも
orbitControls.screenSpacePanning = true
orbitControls.target.set(0.0, 1.4, 0.0)
orbitControls.update()

const scene = new THREE.Scene()

// light
const light = new THREE.DirectionalLight(0xffffff)
light.position.set(1.0, 1.0, 1.0).normalize()
scene.add(light)

// Main Render Loop
// const clock = new THREE.Clock()
