import * as Kalidokit from 'kalidokit'
import { VRMSchema } from '@pixiv/three-vrm'
import { GLTFNode } from '@pixiv/three-vrm'

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
