import { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'
import type { aiRim } from '@/types'
import * as IKSolver from './iKSolver'
import { localPosToWorldPos } from '@/models/utils'

export class IkTargetTracker {
  private _offset: THREE.Vector3

  private _anchor: THREE.Object3D | null
  private _hips: THREE.Object3D | null

  private _chains: Array<IKSolver.IKChain>

  constructor(vrm: VRM, chains: Array<IKSolver.IKChain>) {
    this._offset = new THREE.Vector3(0, 0, 0)

    this._anchor = vrm.humanoid?.getRawBoneNode('head')
    this._hips = vrm.humanoid?.getRawBoneNode('hips')

    this._chains = chains
  }

  trackTargets(handPos: aiRim, elbowPos: aiRim, offset: THREE.Vector3 | undefined) {
    if (this._anchor) localPosToWorldPos(this._offset.set(0, 0.06, 0), this._anchor)

    // Track L_Hand IK Target
    if (handPos.l) {
      this._trackIkTarget(
        handPos.l,
        offset,
        this._offset,
        'J_Bip_L_Hand',
        new THREE.Vector3(-0.03, 0.05, 0),
      )
    }
    // Track R_Hand IK Target
    if (handPos.r) {
      this._trackIkTarget(
        handPos.r,
        offset,
        this._offset,
        'J_Bip_R_Hand',
        new THREE.Vector3(0.03, 0.05, 0),
      )
    }
    // Track L_Elbow IK Target
    if (elbowPos.l) {
      this._trackIkTarget(elbowPos.l, offset, this._offset, 'J_Bip_L_LowerArm')
    }
    // Track R_Elbow IK Target
    if (elbowPos.r) {
      this._trackIkTarget(elbowPos.r, offset, this._offset, 'J_Bip_R_LowerArm')
    }
  }

  private _trackIkTarget(
    ai_effector: THREE.Vector3 | undefined,
    ai_root: THREE.Vector3 | undefined,
    boneRoot: THREE.Vector3,
    effectorName: string,
    offset?: THREE.Vector3,
    lerpAmount: number = 0.2,
  ) {
    if (!ai_effector || !ai_root) return

    let target: THREE.Object3D | null = null
    this._chains.forEach((chain) => {
      if (chain.effector?.name === effectorName) target = chain.goal
    })
    if (target) {
      const pos = (() => {
        if (offset) return this._adjustTargetPos(ai_effector, ai_root, boneRoot, offset)
        return this._adjustTargetPos(ai_effector, ai_root, boneRoot)
      })()
      ;(target as THREE.Object3D).position.lerp(pos, lerpAmount)
    }
  }

  private _adjustTargetPos(
    ai_effector: THREE.Vector3,
    ai_root: THREE.Vector3,
    root: THREE.Vector3,
    offset?: THREE.Vector3,
    coef: number = 1,
  ): THREE.Vector3 {
    const headToTarget = (() => {
      if (offset) return ai_effector.clone().sub(ai_root).multiplyScalar(coef).add(offset)
      return ai_effector.clone().sub(ai_root).multiplyScalar(coef)
    })()
    this._rotateTargetByHipsRotation(headToTarget)
    return headToTarget.add(root)
  }

  private _rotateTargetByHipsRotation(target: THREE.Vector3) {
    // Get hips' world rotation.
    const hipsRot = new THREE.Quaternion()
    this._hips?.getWorldQuaternion(hipsRot)

    // // Extract y rotation.
    // const euler = new THREE.Euler().setFromQuaternion(hipsRot)
    // euler.x = 0
    // euler.z = 0

    // Rotate target by extracted angle.
    // const rot = new THREE.Quaternion().setFromEuler(euler)
    target.applyQuaternion(hipsRot)
  }
}
