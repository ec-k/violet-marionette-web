import { Object3D, Euler, MathUtils, Quaternion, Vector2 } from 'three'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import type { MotionFilter } from './motionFilter'
import { avatarPose } from '@/types'
import { trackingSettings } from '@/stores/userSettings'
import { world2Local, local2world, squareBezier } from '@/models/utils'

export class ConvertedMotion implements MotionFilter {
  private _bones: { [value in VRMHumanBoneName]: Quaternion }

  private _neck

  constructor(vrm: VRM) {
    this._neck = vrm.humanoid?.getRawBoneNode('neck')

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

  private _convertY(y: number, bone: Object3D | null): number {
    if (!bone) return y
    const y_max_local = MathUtils.degToRad(90)
    const center = new Quaternion().identity()
    local2world(center, bone)
    const y_max = center.y + y_max_local
    const y_min = center.y - y_max_local
    const y_th = trackingSettings.headRotConversionThreshold
    const _coef = trackingSettings.headRotCoef

    if (!isFinite(_coef) || !isFinite(y_th) || y_max < -y_th * _coef || y_min > y_th * _coef)
      return y

    const clamp = MathUtils.clamp
    if (y > y_th) {
      const t = clamp((y - y_th) / (y_max - y_th), 0, 1)
      const p1 = new Vector2(y_th, clamp(y_th * _coef, y_min, y_max))
      const p2 = new Vector2(y_max / _coef, y_max)
      const p3 = new Vector2(y_max, y_max)
      return squareBezier(t, p1, p2, p3).y
    } else if (-y_th <= y && y <= y_th) {
      return clamp(_coef * y, y_min, y_max)
    } else {
      const t = clamp((-y_th - y) / (-y_th - y_min), 0, 1)
      const p1 = new Vector2(-y_th, clamp(-y_th * _coef, y_min, y_max))
      const p2 = new Vector2(y_min / _coef, y_min)
      const p3 = new Vector2(y_min, y_min)
      return squareBezier(t, p1, p2, p3).y
    }
  }

  push(q: Quaternion | undefined, key: VRMHumanBoneName) {
    if (!q) return
    const quat = q.clone()

    // Exaggerate the orientation of head according to the difference in viewing angle.
    if (key === 'neck') {
      const bone = this._neck

      if (bone) {
        local2world(quat, bone)

        const euler = new Euler().setFromQuaternion(quat)
        euler.y = this._convertY(euler.y, bone)
        quat.setFromEuler(euler)

        world2Local(quat, bone)
      }
    }
    // Exaggerate the orientation of eyes according to the difference in viewing angle.
    if (key === 'leftEye' || key === 'rightEye') {
      const max = MathUtils.degToRad(15)
      const offset = MathUtils.degToRad(trackingSettings.eyeRotationOffset)
      const euler = new Euler().setFromQuaternion(quat)
      euler.y = MathUtils.clamp(euler.y * trackingSettings.headRotCoef + offset, -max, max)
      quat.setFromEuler(euler)
    }
    this._bones[key] = quat
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
