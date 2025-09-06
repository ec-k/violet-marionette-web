import { VrmFK } from './vrmFK'
import { VrmIK } from './ik'
import { RotateHand } from './rotateHand'
import {
  MotionLPF,
  // ConvertedMotion,
  RawMotion,
} from '@/models/avatar/motion-filter'
import type { MotionFilter } from '@/models/avatar/motion-filter'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { avatarPose, type aiRim, type Arms } from '@/types'
import { Vector3 } from 'three'

export class MotionController {
  private _IK: VrmIK
  private _FK: VrmFK
  private _rotateHand: RotateHand
  private _motionFilter: MotionFilter
  private _rotations: avatarPose
  private _hands: aiRim
  private _elbows: aiRim
  private _wrists: aiRim
  private _middleProximals: aiRim
  private _pinkyProximals: aiRim

  constructor(vrm: VRM) {
    const flg = false // This variable is for smooth debugging.
    this._motionFilter = flg ? new MotionLPF(1) : new RawMotion()
    // this._motionFilter = flg ? new MotionLPF(1) : new ConvertedMotion(vrm)
    this._FK = new VrmFK()
    this._IK = new VrmIK(vrm)
    this._rotateHand = new RotateHand(vrm)
    this._rotations = new avatarPose()
    this._hands = { l: undefined, r: undefined }
    this._elbows = { l: undefined, r: undefined }
    this._wrists = { l: undefined, r: undefined }
    this._middleProximals = { l: undefined, r: undefined }
    this._pinkyProximals = { l: undefined, r: undefined }
  }
  get motionLPF() {
    return this._motionFilter
  }
  get IK() {
    return this._IK
  }
  get FK() {
    return this._FK
  }

  pushPose2Filter(
    vrm: VRM,
    enabledIK: boolean,
    offset: Vector3 | undefined,
    armResults: Arms | undefined,
  ) {
    if (!armResults) return
    const rots = this._FK.pushPose(vrm, !enabledIK)
    const rotations = rots ? rots : this._rotations
    if (!rots) {
      rotations.reset()
    }
    if (enabledIK && !!this._IK && !!this._IK.ikTargetTracker) {
      this._hands.l = armResults.l?.hand
      this._hands.r = armResults.r?.hand

      this._elbows.l = armResults.l?.elbow
      this._elbows.r = armResults.r?.elbow

      this._wrists.l = armResults.l?.wrist
      this._wrists.r = armResults.r?.wrist

      this._middleProximals.l = armResults.l?.middleProximal
      this._middleProximals.r = armResults.r?.middleProximal

      this._pinkyProximals.l = armResults.l?.pinkyProximal
      this._pinkyProximals.r = armResults.r?.pinkyProximal

      this._IK.ikTargetTracker.trackTargets(this._hands, this._elbows, offset)
      // const ikRots = this._IK.pushPose(hands, elbows, shoulders)
      // ikRots.forEach((q, key) => {
      //   rotations.set(key, q)
      // })
      const handRotation = this._rotateHand.setHandTargets(
        this._wrists,
        this._middleProximals,
        this._pinkyProximals,
      )
      if (handRotation.l) rotations.set('leftHand', handRotation.l)
      if (handRotation.r) rotations.set('rightHand', handRotation.r)
    }
    this._motionFilter.pushAll(rotations)
  }

  updatePose(vrm: VRM, enabledIK: boolean) {
    if (!vrm.humanoid) return
    Object.values(VRMHumanBoneName).forEach((boneName) => {
      if (
        enabledIK &&
        (boneName === 'leftShoulder' ||
          boneName === 'leftUpperArm' ||
          boneName === 'leftLowerArm' ||
          boneName === 'rightShoulder' ||
          boneName === 'rightUpperArm' ||
          boneName === 'rightLowerArm')
      )
        return
      const boneNode = vrm.humanoid?.getRawBoneNode(boneName)
      if (!boneNode) return

      boneNode.quaternion.slerp(this._motionFilter.filteredRotation(boneName), 0.3)
    })
    if (enabledIK) this._IK._solve()
  }
}
