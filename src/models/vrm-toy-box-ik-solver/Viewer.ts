import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class Viewer {
  private _canvas: HTMLCanvasElement
  private _renderer: THREE.WebGL1Renderer
  private _scene: THREE.Scene
  private _camera: THREE.PerspectiveCamera
  private _controls: OrbitControls

  constructor(canvas: HTMLCanvasElement) {
    //レンダラーの設定
    this._renderer = new THREE.WebGL1Renderer({
      antialias: true,
      alpha: true,
      canvas: canvas,
    })
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    this._renderer.setClearColor(0x7fbfff, 1.0)
    // parentElement.appendChild(this._renderer.domElement);
    this._canvas = this._renderer.domElement

    this._scene = new THREE.Scene()

    // カメラ
    this._camera = new THREE.PerspectiveCamera(
      35,
      this._canvas.clientWidth / this._canvas.clientHeight,
      0.1,
      1000,
    )
    this._camera.position.set(0, 1.2, -3)
    this._camera.rotation.set(0, Math.PI, 0)

    // カメラコントローラー
    this._controls = new OrbitControls(this._camera, this._canvas)
    this._controls.screenSpacePanning = true
    this._controls.target.y = 0.8
    this._controls.mouseButtons = {
      LEFT: THREE.MOUSE.LEFT,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    }
    this._controls.update()

    // ライト
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1.5, 3, 1).normalize()
    this._scene.add(light)

    // 軸・グリット表示
    const axesHelper = new THREE.AxesHelper(50)
    this._scene.add(axesHelper)
    const gridHelper = new THREE.GridHelper(100, 100)
    this._scene.add(gridHelper)

    this._scene.background = new THREE.Color(0x2b2a2f)
  }

  public get scene(): THREE.Scene {
    return this._scene
  }

  public get camera(): THREE.PerspectiveCamera {
    return this._camera
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas
  }

  public get orbitControl(): OrbitControls {
    return this._controls
  }
  public get renderer(): THREE.WebGL1Renderer {
    return this._renderer
  }

  public update() {
    this._renderer.render(this._scene, this._camera)
  }

  public onResize() {
    this._renderer.setPixelRatio(window.devicePixelRatio)
    this._renderer.setSize(window.innerWidth, window.innerHeight)

    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()
  }
}
