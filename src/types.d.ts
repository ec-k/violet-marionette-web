import * as Kalidokit from 'kalidokit'
import { VRMSchema, GLTFNode } from '@pixiv/three-vrm'
import { Quaternion } from 'three'

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
export declare class avatarPose {
  private _bones: rotations

  constructor() {
    this._bones = {
      Hips: new Quaternion().Identity,
      Spine: new Quaternion().Identity,
      Chest: new Quaternion().Identity,
      UpperChest: new Quaternion().Identity,
      Neck: new Quaternion().Identity,
      Head: new Quaternion().Identity,
      Jaw: new Quaternion().Identity,
      LeftShoulder: new Quaternion().Identity,
      LeftUpperArm: new Quaternion().Identity,
      LeftLowerArm: new Quaternion().Identity,
      LeftUpperLeg: new Quaternion().Identity,
      LeftLowerLeg: new Quaternion().Identity,
      LeftFoot: new Quaternion().Identity,
      LeftToes: new Quaternion().Identity,
      RightShoulder: new Quaternion().Identity,
      RightUpperArm: new Quaternion().Identity,
      RightLowerArm: new Quaternion().Identity,
      RightUpperLeg: new Quaternion().Identity,
      RightLowerLeg: new Quaternion().Identity,
      RightFoot: new Quaternion().Identity,
      RightToes: new Quaternion().Identity,
      LeftHand: new Quaternion().Identity,
      LeftThumbProximal: new Quaternion().Identity,
      LeftThumbDistal: new Quaternion().Identity,
      LeftThumbIntermediate: new Quaternion().Identity,
      LeftIndexProximal: new Quaternion().Identity,
      LeftIndexIntermediate: new Quaternion().Identity,
      LeftIndexDistal: new Quaternion().Identity,
      LeftMiddleProximal: new Quaternion().Identity,
      LeftMiddleIntermediate: new Quaternion().Identity,
      LeftMiddleDistal: new Quaternion().Identity,
      LeftRingProximal: new Quaternion().Identity,
      LeftRingIntermediate: new Quaternion().Identity,
      LeftRingDistal: new Quaternion().Identity,
      LeftLittleProximal: new Quaternion().Identity,
      LeftLittleIntermediate: new Quaternion().Identity,
      LeftLittleDistal: new Quaternion().Identity,
      RightHand: new Quaternion().Identity,
      RightThumbProximal: new Quaternion().Identity,
      RightThumbIntermediate: new Quaternion().Identity,
      RightThumbDistal: new Quaternion().Identity,
      RightIndexProximal: new Quaternion().Identity,
      RightIndexIntermediate: new Quaternion().Identity,
      RightIndexDistal: new Quaternion().Identity,
      RightMiddleProximal: new Quaternion().Identity,
      RightMiddleIntermediate: new Quaternion().Identity,
      RightMiddleDistal: new Quaternion().Identity,
      RightRingProximal: new Quaternion().Identity,
      RightRingIntermediate: new Quaternion().Identity,
      RightRingDistal: new Quaternion().Identity,
      RightLittleProximal: new Quaternion().Identity,
      RightLittleIntermediate: new Quaternion().Identity,
      RightLittleDistal: new Quaternion().Identity,
      LeftEye: new Quaternion().Identity,
      RightEye: new Quaternion().Identity,
    }
  }

  get bones() {
    return this.bones
  }

  set(key: HumanoidBoneNameKey, q: Quaternion) {
    this._bones[key] = q
  }
}

type rotations = {
  [key in HumanoidBoneNameKey]: Quaternion
}
