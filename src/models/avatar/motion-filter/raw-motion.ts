import { Quaternion } from 'three'
import type { MotionFilter } from './motion-filter'
import { avatarPose } from '@/types'
import type { VRMHumanBoneName } from '@pixiv/three-vrm'

export class RawMotion implements MotionFilter {
  private _bones: { [value in VRMHumanBoneName]: Quaternion }

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
  push(q: Quaternion | undefined, key: VRMHumanBoneName) {
    if (!q) return
    this._bones[key] = q.clone()
  }
  pushAll(pose: avatarPose): void {
    Object.keys(pose.bones).forEach((key) => {
      const bn = key as VRMHumanBoneName
      this.push(pose.bones[bn], bn)
    })
  }
  filteredRotation(key: VRMHumanBoneName) {
    return this._bones[key]
  }
}
