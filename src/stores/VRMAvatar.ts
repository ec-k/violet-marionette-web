import { action, makeObservable, observable } from 'mobx'
import { VRM, VRMUtils } from '@pixiv/three-vrm'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class VRMAvatar {
  vrm: VRM | null = null
  avatarSrc: string | null = null

  constructor(url: string) {
    makeObservable(this, {
      vrm: observable.ref,
      avatarSrc: observable,
      setVRM: action,
      setAvatarSrc: action,
    })
    this.setAvatarSrc(url)
  }
  get getVRM() {
    return this.vrm
  }
  setAvatarSrc(url: string) {
    this.avatarSrc = url
  }
  setVRM(gotVRM: VRM) {
    this.vrm = gotVRM
  }

  loadVRM(url: string, scene?: THREE.Scene): Promise<void> {
    const loader = new GLTFLoader()
    return new Promise((resolve: (_: GLTF) => void) =>
      loader.load(url, resolve),
    ).then((gltf) => {
      this.vrm?.scene.removeFromParent()
      VRMUtils.removeUnnecessaryJoints(gltf.scene)
      VRM.from(gltf)
        .then((gotVrm) => {
          if (scene) scene.add(gotVrm.scene)
          this.setVRM(gotVrm)
        })
        .catch((e) => {
          console.log('Failed to load VRM', e)
        })
    })
  }

  setVrm2Scene(scene: THREE.Scene) {
    if (this.vrm) scene.remove(this.vrm.scene)
  }
}

export const vrmAvatar = new VRMAvatar('./first_loaded_avatar.vrm')
