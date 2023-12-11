import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM } from '@pixiv/three-vrm'
import { makeObservable, observable, action } from 'mobx'
import { otherSenttings } from 'stores/userSettings'
import * as UI from './UI'
import { mainSceneViewer } from 'stores/scene'
import { MotionController } from 'models/avatar/motion-controller'

export class Avatar {
  private _scene: THREE.Scene | null = null
  private _motionController: MotionController | null = null
  vrm: VRM | null
  avatarSrc: string | null = null

  constructor(scene?: THREE.Scene) {
    makeObservable(this, {
      vrm: observable.ref,
      avatarSrc: observable,
      setVRM: action,
      setAvatarSrc: action,
    })
    this.setAvatarSrc('./first_loaded_avatar.vrm')
    if (scene) this._scene = scene
    this.vrm = null
  }

  get motionController() {
    return this._motionController
  }

  setAvatarSrc(url: string) {
    this.avatarSrc = url
  }
  setVRM(gotVRM: VRM) {
    this.vrm = gotVRM
  }

  setScene(scene: THREE.Scene) {
    this._scene = scene
  }

  async loadVRM(url: string) {
    if (!this._scene) return
    if (this.vrm) {
      this._scene.remove(this.vrm.scene)
      this.vrm.dispose()
    }

    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(url)
    const vrm = await VRM.from(gltf)
    this._scene.add(vrm.scene)
    this.setVRM(vrm)

    this._motionController = new MotionController(vrm)
    // this._motionController = new MotionController(vrm, 60)
    this._removeSpringBone(vrm)

    // Setup IK target for debugging.
    if (mainSceneViewer.current)
      UI.setupIKController(
        mainSceneViewer.current,
        avatar,
        otherSenttings.showIKTarget,
      )
  }

  private _removeSpringBone(vrm: VRM) {
    const list = vrm.springBoneManager?.springBoneGroupList
    if (!list) return
    while (list.length > 0) {
      list.pop()
    }
  }

  pushPose(
    enabledIK: boolean,
    [
      shoulders,
      elbows,
      hands,
      middleProximals,
      pinkyProximals,
      wrists,
    ]: rimPosition[],
  ) {
    if (!this._motionController || !this.vrm) return
    this._motionController.pushPose2Filter(this.vrm, enabledIK, [
      shoulders,
      elbows,
      hands,
      middleProximals,
      pinkyProximals,
      wrists,
    ])
  }

  updatePose() {
    if (!this._motionController || !this.vrm) return
    this._motionController.updatePose(this.vrm)
  }
}

export const avatar = new Avatar()
type rimPosition = {
  l: THREE.Vector3 | undefined
  r: THREE.Vector3 | undefined
}
