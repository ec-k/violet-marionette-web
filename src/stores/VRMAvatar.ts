import { action, makeObservable, observable } from 'mobx'
import { VRM, VRMUtils } from '@pixiv/three-vrm'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

class VRMAvatar {
  vrm: VRM | null = null
  constructor(url: string) {
    makeObservable(this, {
      vrm: observable.deep,
      setVRM: action,
    })
    this.loadVRM(url)
  }
  get gotVRM() {
    return this.vrm
  }
  setVRM(gotVRM: VRM) {
    this.vrm = gotVRM
  }

  loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader()
    return new Promise((resolve: (_: GLTF) => void) =>
      loader.load(url, resolve),
    ).then((gltf) => {
      // if (vrm) scene.remove(vrm.scene)
      VRMUtils.removeUnnecessaryJoints(gltf.scene)
      VRM.from(gltf)
        .then((gotVrm) => {
          gotVrm.scene.rotation.y = Math.PI
          this.setVRM(gotVrm)
        })
        .catch((e) => {
          console.log('Failed to load VRM', e)
        })
    })
  }
}

export const vrmAvatar = new VRMAvatar(
  'https://cdn.glitch.com/29e07830-2317-4b15-a044-135e73c7f840%2FAshtra.vrm?v=1630342336981',
)
