import { Euler, Quaternion } from 'three'
import { HumanoidBoneNameKey, avatarPose } from 'types'
import { MotionFilter, RotationFilter, RotationQueue } from './motion-filter'

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
      Hips: new RotationLPF(maxLength),
      Spine: new RotationLPF(maxLength),
      Chest: new RotationLPF(maxLength),
      UpperChest: new RotationLPF(maxLength),
      Neck: new RotationLPF(maxLength),
      Head: new RotationLPF(maxLength),
      Jaw: new RotationLPF(maxLength),
      LeftShoulder: new RotationLPF(maxLength),
      LeftUpperArm: new RotationLPF(maxLength),
      LeftLowerArm: new RotationLPF(maxLength),
      LeftUpperLeg: new RotationLPF(maxLength),
      LeftLowerLeg: new RotationLPF(maxLength),
      LeftFoot: new RotationLPF(maxLength),
      LeftToes: new RotationLPF(maxLength),
      RightShoulder: new RotationLPF(maxLength),
      RightUpperArm: new RotationLPF(maxLength),
      RightLowerArm: new RotationLPF(maxLength),
      RightUpperLeg: new RotationLPF(maxLength),
      RightLowerLeg: new RotationLPF(maxLength),
      RightFoot: new RotationLPF(maxLength),
      RightToes: new RotationLPF(maxLength),
      LeftHand: new RotationLPF(maxLength),
      LeftThumbProximal: new RotationLPF(maxLength),
      LeftThumbDistal: new RotationLPF(maxLength),
      LeftThumbIntermediate: new RotationLPF(maxLength),
      LeftIndexProximal: new RotationLPF(maxLength),
      LeftIndexIntermediate: new RotationLPF(maxLength),
      LeftIndexDistal: new RotationLPF(maxLength),
      LeftMiddleProximal: new RotationLPF(maxLength),
      LeftMiddleIntermediate: new RotationLPF(maxLength),
      LeftMiddleDistal: new RotationLPF(maxLength),
      LeftRingProximal: new RotationLPF(maxLength),
      LeftRingIntermediate: new RotationLPF(maxLength),
      LeftRingDistal: new RotationLPF(maxLength),
      LeftLittleProximal: new RotationLPF(maxLength),
      LeftLittleIntermediate: new RotationLPF(maxLength),
      LeftLittleDistal: new RotationLPF(maxLength),
      RightHand: new RotationLPF(maxLength),
      RightThumbProximal: new RotationLPF(maxLength),
      RightThumbIntermediate: new RotationLPF(maxLength),
      RightThumbDistal: new RotationLPF(maxLength),
      RightIndexProximal: new RotationLPF(maxLength),
      RightIndexIntermediate: new RotationLPF(maxLength),
      RightIndexDistal: new RotationLPF(maxLength),
      RightMiddleProximal: new RotationLPF(maxLength),
      RightMiddleIntermediate: new RotationLPF(maxLength),
      RightMiddleDistal: new RotationLPF(maxLength),
      RightRingProximal: new RotationLPF(maxLength),
      RightRingIntermediate: new RotationLPF(maxLength),
      RightRingDistal: new RotationLPF(maxLength),
      RightLittleProximal: new RotationLPF(maxLength),
      RightLittleIntermediate: new RotationLPF(maxLength),
      RightLittleDistal: new RotationLPF(maxLength),
      LeftEye: new RotationLPF(maxLength),
      RightEye: new RotationLPF(maxLength),
    }
  }

  push(q: Quaternion | undefined, key: HumanoidBoneNameKey) {
    if (!q) return
    this._boneQueues[key].push(q)
  }
  pushAll(pose: avatarPose) {
    Object.keys(pose.bones).forEach((key) => {
      const bn = key as HumanoidBoneNameKey
      this.push(pose.bones[bn], bn)
    })
  }
  //   rotate(vrm: VRM) {
  //     Object.keys(this.boneQueues).forEach((boneName) => {
  //       const bn = boneName as HumanoidBoneNameKey
  //       const bone = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName[bn])
  //       this.boneQueues[bn].rotate(bone)
  //     })
  //   }
  filteredRotation(key: HumanoidBoneNameKey) {
    return this._boneQueues[key].current
  }
}

type BoneQueues = {
  [key in HumanoidBoneNameKey]: RotationLPF
}
