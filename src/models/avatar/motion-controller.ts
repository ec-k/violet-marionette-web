import { VrmFK } from './VrmFK'
import { VrmIK } from './IK'
import { RotateHand } from './RotateHand'
import { RawMotion, MotionFilter } from 'models/avatar/motion-filter'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import { HumanoidBoneNameKey, avatarPose } from 'types'
import { Vector3 } from 'three'

export class MotionController {
  private _IK: VrmIK
  private _FK: VrmFK
  private _rotateHand: RotateHand
  private _motionFilter: MotionFilter

  constructor(vrm: VRM /*, filterLength: number*/) {
    this._motionFilter = new RawMotion()
    // this._motionFilter = new MotionLPF(filterLength)
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
    [
      shoulders,
      elbows,
      hands,
      middleProximals,
      pinkyProximals,
      wrists,
    ]: rimPosition[],
  ) {
    const rots = this._FK.pushPose(vrm, !enabledIK)
    const rotations = !!rots ? rots : new avatarPose()
    if (enabledIK && !!this._IK) {
      const ikRots = this._IK.pushPose(hands, elbows, shoulders)
      ikRots.forEach((q, key) => {
        rotations.set(key, q)
      })
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

  updatePose(vrm: VRM) {
    if (!vrm.humanoid) return
    Object.keys(VRMSchema.HumanoidBoneName).forEach((bn) => {
      const boneName = bn as HumanoidBoneNameKey
      const boneNode = vrm.humanoid?.getBoneNode(
        VRMSchema.HumanoidBoneName[boneName],
      )
      if (!boneNode) return
      boneNode.quaternion.slerp(
        this._motionFilter.filteredRotation(boneName),
        0.5,
      )
    })
  }
}

type rimPosition = {
  l: Vector3 | undefined
  r: Vector3 | undefined
}
