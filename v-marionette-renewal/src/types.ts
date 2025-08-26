import * as Kalidokit from 'kalidokit'
import { VRMSchema, GLTFNode } from '@pixiv/three-vrm'
import { Vector3, Quaternion } from 'three'

export declare type KalidokitRig = {
  face?: Kalidokit.TFace
  pose?: Kalidokit.TPose
  leftHand?: Kalidokit.THand<'Left'>
  rightHand?: Kalidokit.THand<'Right'>
}

export declare type HumanoidBoneNameKey =
  keyof typeof VRMSchema.HumanoidBoneName

export declare type aiRim = {
  l: THREE.Vector3 | undefined
  r: THREE.Vector3 | undefined
}

export declare type avatarRim = {
  l: GLTFNode
  r: GLTFNode
}

export declare type hand = {
  wrist: Vector3
  middle: Vector3
  pinky: Vector3
  isLeft: boolean
}

export declare type side = 'left' | 'right'

// I intended to define it as an interface, but it was tedious to write the initialization process each time, so I implemented it as a class.
export class avatarPose {
  private _bones: rotations

  constructor() {
    this._bones = {
      Hips: new Quaternion().identity(),
      Spine: new Quaternion().identity(),
      Chest: new Quaternion().identity(),
      UpperChest: new Quaternion().identity(),
      Neck: new Quaternion().identity(),
      Head: new Quaternion().identity(),
      Jaw: new Quaternion().identity(),
      LeftShoulder: new Quaternion().identity(),
      LeftUpperArm: new Quaternion().identity(),
      LeftLowerArm: new Quaternion().identity(),
      LeftUpperLeg: new Quaternion().identity(),
      LeftLowerLeg: new Quaternion().identity(),
      LeftFoot: new Quaternion().identity(),
      LeftToes: new Quaternion().identity(),
      RightShoulder: new Quaternion().identity(),
      RightUpperArm: new Quaternion().identity(),
      RightLowerArm: new Quaternion().identity(),
      RightUpperLeg: new Quaternion().identity(),
      RightLowerLeg: new Quaternion().identity(),
      RightFoot: new Quaternion().identity(),
      RightToes: new Quaternion().identity(),
      LeftHand: new Quaternion().identity(),
      LeftThumbProximal: new Quaternion().identity(),
      LeftThumbDistal: new Quaternion().identity(),
      LeftThumbIntermediate: new Quaternion().identity(),
      LeftIndexProximal: new Quaternion().identity(),
      LeftIndexIntermediate: new Quaternion().identity(),
      LeftIndexDistal: new Quaternion().identity(),
      LeftMiddleProximal: new Quaternion().identity(),
      LeftMiddleIntermediate: new Quaternion().identity(),
      LeftMiddleDistal: new Quaternion().identity(),
      LeftRingProximal: new Quaternion().identity(),
      LeftRingIntermediate: new Quaternion().identity(),
      LeftRingDistal: new Quaternion().identity(),
      LeftLittleProximal: new Quaternion().identity(),
      LeftLittleIntermediate: new Quaternion().identity(),
      LeftLittleDistal: new Quaternion().identity(),
      RightHand: new Quaternion().identity(),
      RightThumbProximal: new Quaternion().identity(),
      RightThumbIntermediate: new Quaternion().identity(),
      RightThumbDistal: new Quaternion().identity(),
      RightIndexProximal: new Quaternion().identity(),
      RightIndexIntermediate: new Quaternion().identity(),
      RightIndexDistal: new Quaternion().identity(),
      RightMiddleProximal: new Quaternion().identity(),
      RightMiddleIntermediate: new Quaternion().identity(),
      RightMiddleDistal: new Quaternion().identity(),
      RightRingProximal: new Quaternion().identity(),
      RightRingIntermediate: new Quaternion().identity(),
      RightRingDistal: new Quaternion().identity(),
      RightLittleProximal: new Quaternion().identity(),
      RightLittleIntermediate: new Quaternion().identity(),
      RightLittleDistal: new Quaternion().identity(),
      LeftEye: new Quaternion().identity(),
      RightEye: new Quaternion().identity(),
    }
  }

  get bones(): rotations {
    return this._bones
  }

  set(key: HumanoidBoneNameKey, q: Quaternion) {
    this._bones[key] = q
  }
}

type rotations = {
  [key in HumanoidBoneNameKey]: Quaternion
}
