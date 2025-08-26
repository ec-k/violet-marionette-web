import { Euler, Quaternion } from 'three'
import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { avatarPose } from 'types'
import { RotationQueue } from './motion-filter'
import type { MotionFilter, RotationFilter } from './motion-filter'

interface RotRange {
  x: {
    max: number
    min: number
  }
  y: {
    max: number
    min: number
  }
  z: {
    max: number
    min: number
  }
}

export class RotationLPF implements RotationFilter {
  private maxLength: number
  private _range: RotRange
  protected _current: Quaternion = new Quaternion().identity()
  private _rotations: RotationQueue

  constructor(maxLength: number) {
    this._rotations = new RotationQueue()
    this.maxLength = maxLength
    this._range = {
      x: { max: 0, min: 0 },
      y: { max: 0, min: 0 },
      z: { max: 0, min: 0 },
    }
  }
  get length() {
    return this._rotations.length
  }
  get range() {
    return this._range
  }
  get current() {
    return this._current
  }

  push(q: Quaternion) {
    const q_input = q.clone()
    const updateCurrent = this._checkInput(q_input)
    this._rotations.push(q_input)
    if (this._rotations.length > this.maxLength) {
      this._rotations.pop()
    }
    if (updateCurrent) {
      this._current = q_input
      this.updateRotationRange()
    }
  }
  private _rangeReset() {
    this._range = {
      x: { max: 0, min: 0 },
      y: { max: 0, min: 0 },
      z: { max: 0, min: 0 },
    }
  }

  private _checkInput(q: Quaternion) {
    const dif = new Euler().setFromQuaternion(
      new Quaternion().multiplyQuaternions(q.clone().invert(), this.current),
    )
    if (dif.x > this._range.x.max) return true
    if (dif.y > this._range.y.max) return true
    if (dif.z > this._range.z.max) return true
    if (dif.x < this._range.x.min) return true
    if (dif.y < this._range.y.min) return true
    if (dif.z < this._range.z.min) return true
    return false
  }

  private updateRotationRange() {
    const curretInv = this.current.clone().invert()
    this._rangeReset()
    this._rotations.queue.forEach((q) => {
      const dif_q = new Quaternion().multiplyQuaternions(curretInv, q)
      const dif = new Euler().setFromQuaternion(dif_q)
      if (dif.x > this._range.x.max) this._range.x.max = dif.x
      if (dif.y > this._range.y.max) this._range.y.max = dif.y
      if (dif.z > this._range.z.max) this._range.z.max = dif.z
      if (dif.x < this._range.x.min) this._range.x.min = dif.x
      if (dif.y < this._range.y.min) this._range.y.min = dif.y
      if (dif.z < this._range.z.min) this._range.z.min = dif.z
    })
  }
}

export class MotionLPF implements MotionFilter {
  private _boneQueues: BoneQueues
  // private BlinkQueue

  constructor(maxLength: number) {
    this._boneQueues = {
      hips: new RotationLPF(maxLength),
      spine: new RotationLPF(maxLength),
      chest: new RotationLPF(maxLength),
      upperChest: new RotationLPF(maxLength),
      neck: new RotationLPF(maxLength),
      head: new RotationLPF(maxLength),
      jaw: new RotationLPF(maxLength),
      leftShoulder: new RotationLPF(maxLength),
      leftUpperArm: new RotationLPF(maxLength),
      leftLowerArm: new RotationLPF(maxLength),
      leftUpperLeg: new RotationLPF(maxLength),
      leftLowerLeg: new RotationLPF(maxLength),
      leftFoot: new RotationLPF(maxLength),
      leftToes: new RotationLPF(maxLength),
      rightShoulder: new RotationLPF(maxLength),
      rightUpperArm: new RotationLPF(maxLength),
      rightLowerArm: new RotationLPF(maxLength),
      rightUpperLeg: new RotationLPF(maxLength),
      rightLowerLeg: new RotationLPF(maxLength),
      rightFoot: new RotationLPF(maxLength),
      rightToes: new RotationLPF(maxLength),
      leftHand: new RotationLPF(maxLength),
      leftThumbProximal: new RotationLPF(maxLength),
      leftThumbDistal: new RotationLPF(maxLength),
      leftThumbMetacarpal: new RotationLPF(maxLength),
      leftIndexProximal: new RotationLPF(maxLength),
      leftIndexIntermediate: new RotationLPF(maxLength),
      leftIndexDistal: new RotationLPF(maxLength),
      leftMiddleProximal: new RotationLPF(maxLength),
      leftMiddleIntermediate: new RotationLPF(maxLength),
      leftMiddleDistal: new RotationLPF(maxLength),
      leftRingProximal: new RotationLPF(maxLength),
      leftRingIntermediate: new RotationLPF(maxLength),
      leftRingDistal: new RotationLPF(maxLength),
      leftLittleProximal: new RotationLPF(maxLength),
      leftLittleIntermediate: new RotationLPF(maxLength),
      leftLittleDistal: new RotationLPF(maxLength),
      rightHand: new RotationLPF(maxLength),
      rightThumbProximal: new RotationLPF(maxLength),
      rightThumbMetacarpal: new RotationLPF(maxLength),
      rightThumbDistal: new RotationLPF(maxLength),
      rightIndexProximal: new RotationLPF(maxLength),
      rightIndexIntermediate: new RotationLPF(maxLength),
      rightIndexDistal: new RotationLPF(maxLength),
      rightMiddleProximal: new RotationLPF(maxLength),
      rightMiddleIntermediate: new RotationLPF(maxLength),
      rightMiddleDistal: new RotationLPF(maxLength),
      rightRingProximal: new RotationLPF(maxLength),
      rightRingIntermediate: new RotationLPF(maxLength),
      rightRingDistal: new RotationLPF(maxLength),
      rightLittleProximal: new RotationLPF(maxLength),
      rightLittleIntermediate: new RotationLPF(maxLength),
      rightLittleDistal: new RotationLPF(maxLength),
      leftEye: new RotationLPF(maxLength),
      rightEye: new RotationLPF(maxLength),
    }
  }

  push(q: Quaternion | undefined, key: VRMHumanBoneName) {
    if (!q) return
    this._boneQueues[key].push(q)
  }
  pushAll(pose: avatarPose) {
    Object.keys(pose.bones).forEach((key) => {
      const bn = key as VRMHumanBoneName
      this.push(pose.bones[bn], bn)
    })
  }
  //   rotate(vrm: VRM) {
  //     Object.keys(this.boneQueues).forEach((boneName) => {
  //       const bn = boneName as VRMHumanBoneName
  //       const bone = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName[bn])
  //       this.boneQueues[bn].rotate(bone)
  //     })
  //   }
  filteredRotation(key: VRMHumanBoneName) {
    return this._boneQueues[key].current
  }
}

type BoneQueues = {
  [key in VRMHumanBoneName]: RotationLPF
}
