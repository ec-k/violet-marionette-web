import { VrmFK } from './VrmFK'
import { VrmIK } from './IK'
import { RotateHand } from './RotateHand'
import {
  MotionLPF,
  // ConvertedMotion,
  MotionFilter,
  RawMotion,
} from 'models/avatar/motion-filter'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { HumanoidBoneNameKey, avatarPose } from 'types'
import { Vector3 } from 'three'

export class MotionController {
  private _IK: VrmIK
  private _FK: VrmFK
  private _rotateHand: RotateHand
  private _motionFilter: MotionFilter

  constructor(vrm: VRM) {
    const flg = false // This variable is for smooth debugging.
    this._motionFilter = flg ? new MotionLPF(1) : new RawMotion()
    // this._motionFilter = flg ? new MotionLPF(1) : new ConvertedMotion(vrm)
    this._FK = new VrmFK()
    this._IK = new VrmIK(vrm)
    this._rotateHand = new RotateHand(vrm)
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
    head: Vector3 | undefined,
    [elbows, hands, middleProximals, pinkyProximals, wrists]: rimPosition[],
  ) {
    const rots = this._FK.pushPose(vrm, !enabledIK)
    const rotations = !!rots ? rots : new avatarPose()
    if (enabledIK && !!this._IK && !!this._IK.ikTargetTracker) {
      this._IK.ikTargetTracker.trackTargets(hands, elbows, head)
      // const ikRots = this._IK.pushPose(hands, elbows, shoulders)
      // ikRots.forEach((q, key) => {
      //   rotations.set(key, q)
      // })
      const handRotation = this._rotateHand.setHandTargets(
        wrists,
        middleProximals,
        pinkyProximals,
      )
      if (!!handRotation.l) rotations.set('LeftHand', handRotation.l)
      if (!!handRotation.r) rotations.set('RightHand', handRotation.r)
    }
    this._motionFilter.pushAll(rotations)
  }

  updatePose(vrm: VRM, enabledIK: boolean) {
    if (!vrm.humanoid) return
    Object.keys(VRMSchema.HumanoidBoneName).forEach((bn) => {
      const boneName = bn as HumanoidBoneNameKey
      if (
        enabledIK &&
        (boneName === 'LeftShoulder' ||
          boneName === 'LeftUpperArm' ||
          boneName === 'LeftLowerArm' ||
          boneName === 'RightShoulder' ||
          boneName === 'RightUpperArm' ||
          boneName === 'RightLowerArm')
      )
        return
      const boneNode = vrm.humanoid?.getBoneNode(
        VRMSchema.HumanoidBoneName[boneName],
      )
      if (!boneNode) return
      boneNode.quaternion.slerp(
        this._motionFilter.filteredRotation(boneName),
        0.3,
      )
    })
    this._IK._solve()
  }
}

type rimPosition = {
  l: Vector3 | undefined
  r: Vector3 | undefined
}
