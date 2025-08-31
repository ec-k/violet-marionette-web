import * as Kalidokit from 'kalidokit'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Object3D, Vector3, Quaternion } from 'three'

export declare type KalidokitRig = {
  face?: Kalidokit.TFace
  pose?: Kalidokit.TPose
  leftHand?: Kalidokit.THand<'Left'>
  rightHand?: Kalidokit.THand<'Right'>
}

export declare type aiRim = {
  l: Vector3 | undefined
  r: Vector3 | undefined
}

export type ArmLandmarkPositions = {
  elbow: Vector3 | undefined
  hand: Vector3 | undefined
  wrist: Vector3 | undefined
  middleProximal: Vector3 | undefined
  pinkyProximal: Vector3 | undefined
}

export type Arms = {
  l: ArmLandmarkPositions | undefined
  r: ArmLandmarkPositions | undefined
}

export declare type avatarRim = {
  l: Object3D | null
  r: Object3D | null
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
      hips: new Quaternion().identity(),
      spine: new Quaternion().identity(),
      chest: new Quaternion().identity(),
      upperChest: new Quaternion().identity(),
      neck: new Quaternion().identity(),
      head: new Quaternion().identity(),
      jaw: new Quaternion().identity(),
      leftShoulder: new Quaternion().identity(),
      leftUpperArm: new Quaternion().identity(),
      leftLowerArm: new Quaternion().identity(),
      leftUpperLeg: new Quaternion().identity(),
      leftLowerLeg: new Quaternion().identity(),
      leftFoot: new Quaternion().identity(),
      leftToes: new Quaternion().identity(),
      rightShoulder: new Quaternion().identity(),
      rightUpperArm: new Quaternion().identity(),
      rightLowerArm: new Quaternion().identity(),
      rightUpperLeg: new Quaternion().identity(),
      rightLowerLeg: new Quaternion().identity(),
      rightFoot: new Quaternion().identity(),
      rightToes: new Quaternion().identity(),
      leftHand: new Quaternion().identity(),
      leftThumbProximal: new Quaternion().identity(),
      leftThumbDistal: new Quaternion().identity(),
      leftThumbMetacarpal: new Quaternion().identity(),
      leftIndexProximal: new Quaternion().identity(),
      leftIndexIntermediate: new Quaternion().identity(),
      leftIndexDistal: new Quaternion().identity(),
      leftMiddleProximal: new Quaternion().identity(),
      leftMiddleIntermediate: new Quaternion().identity(),
      leftMiddleDistal: new Quaternion().identity(),
      leftRingProximal: new Quaternion().identity(),
      leftRingIntermediate: new Quaternion().identity(),
      leftRingDistal: new Quaternion().identity(),
      leftLittleProximal: new Quaternion().identity(),
      leftLittleIntermediate: new Quaternion().identity(),
      leftLittleDistal: new Quaternion().identity(),
      rightHand: new Quaternion().identity(),
      rightThumbProximal: new Quaternion().identity(),
      rightThumbMetacarpal: new Quaternion().identity(),
      rightThumbDistal: new Quaternion().identity(),
      rightIndexProximal: new Quaternion().identity(),
      rightIndexIntermediate: new Quaternion().identity(),
      rightIndexDistal: new Quaternion().identity(),
      rightMiddleProximal: new Quaternion().identity(),
      rightMiddleIntermediate: new Quaternion().identity(),
      rightMiddleDistal: new Quaternion().identity(),
      rightRingProximal: new Quaternion().identity(),
      rightRingIntermediate: new Quaternion().identity(),
      rightRingDistal: new Quaternion().identity(),
      rightLittleProximal: new Quaternion().identity(),
      rightLittleIntermediate: new Quaternion().identity(),
      rightLittleDistal: new Quaternion().identity(),
      leftEye: new Quaternion().identity(),
      rightEye: new Quaternion().identity(),
    }
  }

  get bones(): rotations {
    return this._bones
  }

  set(key: VRMHumanBoneName, q: Quaternion) {
    this._bones[key] = q
  }
}

type rotations = {
  [key in VRMHumanBoneName]: Quaternion
}
