import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM } from '@pixiv/three-vrm'

import { VrmIK } from './IK'
import { makeObservable, observable, action } from 'mobx'

export class Avatar {
  private _scene: THREE.Scene | null = null
  public vrm: VRM | null
  public avatarSrc: string | null = null
  private _vrmIK: VrmIK | null = null

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

  get vrmIK() {
    return this._vrmIK
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

  // VRMの読み込み
  public async loadVRM(url: string) {
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

    this._vrmIK = new VrmIK(vrm)
  }

  public update() {
    //this._vrm.update(deltaTime);

    if (!!this._vrmIK) this._vrmIK.solve()
  }
}

export const avatar = new Avatar()
