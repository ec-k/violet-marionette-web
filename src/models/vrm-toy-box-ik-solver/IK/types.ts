import { GLTFNode } from '@pixiv/three-vrm'
import * as THREE from 'three'

export type aiRim = {
  l: THREE.Vector3 | undefined
  r: THREE.Vector3 | undefined
}

export type avatarRim = {
  l: GLTFNode
  r: GLTFNode
}
