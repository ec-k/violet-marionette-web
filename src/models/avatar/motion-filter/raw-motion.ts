import { Quaternion } from 'three'
import { MotionFilter } from './motion-filter'
import { HumanoidBoneNameKey, avatarPose } from 'types'

export class RawMotion implements MotionFilter {
  private _bones: { [key in HumanoidBoneNameKey]: Quaternion }

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
  push(q: Quaternion | undefined, key: HumanoidBoneNameKey) {
    if (!q) return
    if (key) this._bones[key] = q.clone()
  }
  pushAll(pose: avatarPose): void {
    Object.keys(pose.bones).forEach((key) => {
      const bn = key as HumanoidBoneNameKey
      this.push(pose.bones[bn], bn)
    })
  }
  filteredRotation(key: HumanoidBoneNameKey) {
    return this._bones[key]
  }
}
