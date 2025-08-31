import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRM, VRMHumanoidHelper, VRMLoaderPlugin } from '@pixiv/three-vrm'
import { makeObservable, observable, action } from 'mobx'
import { otherSenttings } from '@/stores/userSettings'
import * as UI from './ui'
import { mainSceneViewer } from '@/stores/scene'
import { MotionController } from '@/models/avatar/motionController'
import type { Arms } from '@/types'

export class Avatar {
  private scene: THREE.Scene | null = null
  private motionControllerInternal: MotionController | null = null
  vrm: VRM | null
  avatarSrc: string | null = null

  constructor(scene?: THREE.Scene) {
    makeObservable(this, {
      vrm: observable.ref,
      avatarSrc: observable,
      setVRM: action,
      setAvatarSrc: action,
    })
    this.setAvatarSrc('./default_avatar.vrm')
    if (scene) this.scene = scene
    this.vrm = null
  }

  get motionController() {
    return this.motionControllerInternal
  }

  setAvatarSrc(url: string) {
    this.avatarSrc = url
  }
  setVRM(gotVRM: VRM) {
    this.vrm = gotVRM
  }

  setScene(scene: THREE.Scene) {
    this.scene = scene
  }

  loadVRM(url: string) {
    if (!this.scene) return
    if (this.vrm) {
      this.scene.remove(this.vrm.scene)
      new VRMHumanoidHelper(this.vrm.humanoid).dispose()
      this.vrm = null
    }

    const loader = new GLTFLoader()
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser)
    })
    loader.load(
      url,
      (gltf) => {
        const vrm = gltf.userData.vrm
        vrm.humanoid.autoUpdateHumanBones = false
        this.scene?.add(vrm.scene)
        this.setVRM(vrm)
        this.motionControllerInternal = new MotionController(vrm)
        this.removeSpringBone(vrm)
      },
      (progress) =>
        console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
      (error) => console.error(error),
    )

    // TODO: replace ubove with this WebGPURenderer compatible one
    // // Register a VRMLoaderPlugin
    // loader.register((parser) => {
    //   // create a WebGPU compatible MToonMaterialLoaderPlugin
    //   const mtoonMaterialPlugin = new MToonMaterialLoaderPlugin(parser, {
    //     // set the material type to MToonNodeMaterial
    //     materialType: MToonNodeMaterial,
    //   });

    //   return new VRMLoaderPlugin(parser, {
    //     // Specify the MToonMaterialLoaderPlugin to use in the VRMLoaderPlugin instance
    //     mtoonMaterialPlugin,
    //   });
    // });

    // Setup IK target for debugging.
    if (mainSceneViewer.current)
      UI.setupIKController(mainSceneViewer.current, avatar, otherSenttings.showIKTarget)
  }

  private removeSpringBone(vrm: VRM) {
    const list = vrm.springBoneManager?.colliderGroups
    if (!list) return
    while (list.length > 0) {
      list.pop()
    }
  }

  pushPose(enabledIK: boolean, offset: THREE.Vector3 | undefined, arms: Arms | undefined) {
    if (!this.motionControllerInternal || !this.vrm || !arms) return
    this.motionControllerInternal.pushPose2Filter(this.vrm, enabledIK, offset, arms)
  }

  updatePose(enabledIK: boolean) {
    if (!this.motionControllerInternal || !this.vrm) return
    this.motionControllerInternal.updatePose(this.vrm, enabledIK)
  }
}

export const avatar = new Avatar()
