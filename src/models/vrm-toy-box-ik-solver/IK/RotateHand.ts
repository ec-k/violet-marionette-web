import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { Quaternion, Vector3 } from 'three'
import { aiRim, avatarRim, side } from 'types'

export class RotateHand {
  private _hands: avatarRim
  private _middleFingerProximal: avatarRim
  private _pinkyFingerProximal: avatarRim

  // private _lowerArms: avatarRim

  // private _armConstraint: ArmConstraint

  private _targetRotation = {
    l: new Quaternion().identity(),
    r: new Quaternion().identity(),
  }

  constructor(vrm: VRM) {
    this._middleFingerProximal = {
      l: vrm.humanoid?.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftMiddleProximal,
      )!,
      r: vrm.humanoid?.getBoneNode(
        VRMSchema.HumanoidBoneName.RightMiddleProximal,
      )!,
    }
    this._pinkyFingerProximal = {
      l: vrm.humanoid?.getBoneNode(
        VRMSchema.HumanoidBoneName.LeftLittleProximal,
      )!,
      r: vrm.humanoid?.getBoneNode(
        VRMSchema.HumanoidBoneName.RightLittleProximal,
      )!,
    }
    this._hands = {
      l: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftHand)!,
      r: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.RightHand)!,
    }
    // this._lowerArms = {
    //   l: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftLowerArm)!,
    //   r: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.RightLowerArm)!,
    // }

    // this._armConstraint = defaultConfig
  }

  rotateHands() {
    // constraintの範囲で手首を回す
    this._hands.l.quaternion.slerp(this._targetRotation.l, 0.3)
    this._hands.r.quaternion.slerp(this._targetRotation.r, 0.3)
    // this._hands.l.quaternion.slerp(
    //   rotationClamp(this._targetRotation.l, this._armConstraint.hand),
    //   0.3,
    // )
    // this._hands.r.quaternion.slerp(
    //   rotationClamp(this._targetRotation.r, this._armConstraint.hand),
    //   0.3,
    // )

    // this._rotateRoll(this._targetRotation.l, 0.3, 'left')
    // this._rotateRoll(this._targetRotation.r, 0.3, 'right')
  }

  // この名前正しくないので，適切な名前に変えよ
  // setFromAxisAngleで回した方が良いかもなぁ...
  // _rotateRoll(rotation: Quaternion, slerpAmount: number, side: side) {
  //   const isLeft = side === 'left'
  //   const _slerpAmount = MathUtils.clamp(slerpAmount, 0, 1)

  //   if (isLeft) {
  //     // Rotate lower arm.
  //     let roll = new Euler().setFromQuaternion(rotation).x
  //     let rollRot = this._lowerArms.l.quaternion
  //       .clone()
  //       .premultiply(new Quaternion().setFromEuler(new Euler(roll, 0, 0)))
  //     this._lowerArms.l.quaternion.slerp(rollRot, _slerpAmount)
  //   } else {
  //     // Rotate lower arm.
  //     let roll = new Euler().setFromQuaternion(rotation).x
  //     let rollRot = this._lowerArms.r.quaternion
  //       .clone()
  //       .premultiply(new Quaternion().setFromEuler(new Euler(roll, 0, 0)))
  //     this._lowerArms.r.quaternion.slerp(rollRot, _slerpAmount)
  //   }
  // }

  setHandTargets(wrists: aiRim, middleProximals: aiRim, pinkyProximals: aiRim) {
    if (!!wrists.l || !!middleProximals.l || !!pinkyProximals.l)
      this._setHandTargetRotation(
        wrists.l,
        middleProximals.l,
        pinkyProximals.l,
        'left',
      )
    if (!!wrists.r || !!middleProximals.r || !!pinkyProximals.r)
      this._setHandTargetRotation(
        wrists.r,
        middleProximals.r,
        pinkyProximals.r,
        'right',
      )
  }

  private _setHandTargetRotation(
    ai_wrist: Vector3 | undefined,
    ai_middleFinger: Vector3 | undefined,
    ai_pinkyFinger: Vector3 | undefined,
    side: side = 'left',
  ) {
    const isLeft = side === 'left'
    if (!ai_wrist || !ai_middleFinger || !ai_pinkyFinger) return

    // Get global hand landmark position.
    const [avatar_wrist, avatar_middleFinger, avatar_pinkyFinger] = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
    ]
    if (isLeft) {
      this._hands.l.getWorldPosition(avatar_wrist)
      this._middleFingerProximal.l.getWorldPosition(avatar_middleFinger)
      this._pinkyFingerProximal.l.getWorldPosition(avatar_pinkyFinger)
    } else {
      this._hands.r.getWorldPosition(avatar_wrist)
      this._middleFingerProximal.r.getWorldPosition(avatar_middleFinger)
      this._pinkyFingerProximal.r.getWorldPosition(avatar_pinkyFinger)
    }

    const [ai_front, ai_up] = this._getFrontUp(
      ai_wrist,
      ai_middleFinger,
      ai_pinkyFinger,
    )

    const targetQuat = this._getQuaternionFromFrontUp(ai_front, ai_up, side)

    if (isLeft) {
      this._world2Local(targetQuat, this._hands.l)
      this._targetRotation.l = targetQuat
    } else {
      this._world2Local(targetQuat, this._hands.r)
      this._targetRotation.r = targetQuat
    }
  }

  private _world2Local(worldRotation: Quaternion, target: THREE.Object3D) {
    const targetWorldRotation = new Quaternion()
    try {
      target.parent!.getWorldQuaternion(targetWorldRotation)
    } catch {
      return
    }
    worldRotation.premultiply(targetWorldRotation.invert())
  }

  private _getQuaternionFromFrontUp(
    front: Vector3,
    up: Vector3,
    side: side = 'left',
  ) {
    const isLeft = side === 'left'
    const defaultFrontUp = isLeft
      ? {
          front: new Vector3(-1, 0, 0),
          up: new Vector3(0, 1, 0),
        }
      : {
          front: new Vector3(1, 0, 0),
          // HACK: If "up" is not reversed, the roll rotation of the right hand is reversed.
          up: new Vector3(0, -1, 0),
        }

    const rot = new Quaternion().setFromUnitVectors(defaultFrontUp.front, front)
    defaultFrontUp.up.applyQuaternion(rot)
    const axis = new Vector3().crossVectors(defaultFrontUp.up, up).normalize()
    const angle = defaultFrontUp.up.angleTo(up)
    const rollQuat = new Quaternion().setFromAxisAngle(axis, angle)
    return rot.premultiply(rollQuat)
  }

  private _getFrontUp(
    wrist: Vector3,
    middleFingerProximal: Vector3,
    pinkyFingerProximal: Vector3,
    side: side = 'left',
  ) {
    const front = new Vector3()
      .subVectors(middleFingerProximal, wrist)
      .normalize()
    const up = new Vector3()
      .crossVectors(
        front.clone(),
        new Vector3().subVectors(pinkyFingerProximal, wrist),
      )
      .normalize()
    if (side === 'right') up.negate()
    return [front, up]
  }
}

// // lとrとは，eulerのy, zを反転させればいい
// // 反転：minとmaxを入れ替えて，それぞれの成分に-1をかける
// interface ArmConstraint {
//   // upperArm: Range
//   // lowerArm: Range
//   hand: Range
// }
// interface Range {
//   min: Euler
//   max: Euler
// }
// // 左手を基準とする
// const defaultConfig = {
//   // upperArm: {
//   //   min: new Euler(-Math.PI / 2, -Math.PI / 3, (-Math.PI * 2) / 3),
//   //   max: new Euler(0, (Math.PI * 2) / 3, Math.PI * 2),
//   // },
//   // lowerArm: {
//   //   min: new Euler(-Math.PI / 2, (-Math.PI * 2) / 3, 0),
//   //   max: new Euler(Math.PI / 2, 0, 0),
//   // },
//   hand: {
//     min: new Euler(0, -Math.PI / 4, -Math.PI / 2),
//     max: new Euler(0, Math.PI / 4, Math.PI / 2),
//   },
// }

// const rotationClamp = (q: Quaternion, constraint: Range) => {
//   const euler = new Euler().setFromQuaternion(q)
//   euler.x = MathUtils.clamp(euler.x, constraint.min.x, constraint.max.x)
//   euler.y = MathUtils.clamp(euler.y, constraint.min.y, constraint.max.y)
//   euler.z = MathUtils.clamp(euler.z, constraint.min.z, constraint.max.z)
//   return new Quaternion().setFromEuler(euler)
// }
