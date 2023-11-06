import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { Quaternion, Vector3 } from 'three'
import { aiRim, avatarRim, side } from 'types'
import * as THREE from 'three'

export class RotateHand {
  private _hands: avatarRim
  private _middleFingerProximal: avatarRim
  private _pinkyFingerProximal: avatarRim

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
  }

  rotateHands() {
    this._hands.l.quaternion.slerp(this._targetRotation.l, 0.3)
    this._hands.r.quaternion.slerp(this._targetRotation.r, 0.3)
  }

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
