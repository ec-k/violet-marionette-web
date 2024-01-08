import { Euler, MathUtils, Quaternion, Vector2 } from 'three'
import { GLTFNode, VRM, VRMSchema } from '@pixiv/three-vrm'
import { MotionFilter } from './motion-filter'
import { HumanoidBoneNameKey, avatarPose } from 'types'
import { trackingSettings } from 'stores/userSettings'
import { world2Local, local2world, squareBezier } from 'models/utils'

export class ConvertedMotion implements MotionFilter {
  private _bones: { [key in HumanoidBoneNameKey]: Quaternion }

  private _neck

  constructor(vrm: VRM) {
    this._neck = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Neck)

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

  private _convertY(y: number, bone: GLTFNode | null): number {
    if (!bone) return y
    const y_max_local = MathUtils.degToRad(90)
    const center = new Quaternion().identity()
    local2world(center, bone)
    const y_max = center.y + y_max_local
    const y_min = center.y - y_max_local
    const y_th = trackingSettings.headRotConversionThreshold
    const _coef = trackingSettings.headRotCoef

    if (
      !isFinite(_coef) ||
      !isFinite(y_th) ||
      y_max < -y_th * _coef ||
      y_min > y_th * _coef
    )
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

  push(q: Quaternion | undefined, key: HumanoidBoneNameKey) {
    if (!q) return
    const quat = q.clone()

    // Exaggerate the orientation of head according to the difference in viewing angle.
    if (key === 'Neck') {
      const bone = this._neck

      if (!!bone) {
        local2world(quat, bone)

        const euler = new Euler().setFromQuaternion(quat)
        euler.y = this._convertY(euler.y, bone)
        quat.setFromEuler(euler)

        world2Local(quat, bone)
      }
    }
    // Exaggerate the orientation of eyes according to the difference in viewing angle.
    if (key === 'LeftEye' || key === 'RightEye') {
      const max = MathUtils.degToRad(15)
      const offset = MathUtils.degToRad(trackingSettings.eyeRotationOffset)
      const euler = new Euler().setFromQuaternion(quat)
      euler.y = MathUtils.clamp(
        euler.y * trackingSettings.headRotCoef + offset,
        -max,
        max,
      )
      quat.setFromEuler(euler)
    }
    this._bones[key] = quat
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
