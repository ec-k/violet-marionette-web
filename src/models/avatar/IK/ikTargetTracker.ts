import { GLTFNode, VRM, VRMSchema } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { aiRim } from 'types'
import * as IKSolver from './IKSolver'

export class IkTargetTracker {
  private _head: GLTFNode | null
  private _hips: GLTFNode | null

  private _chains: Array<IKSolver.IKChain>

  constructor(vrm: VRM, chains: Array<IKSolver.IKChain>) {
    this._head = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Head)!
    this._hips = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.Head)!

    this._chains = chains
  }

  trackTargets(
    handPos: aiRim,
    elbowPos: aiRim,
    headPos: THREE.Vector3 | undefined,
  ) {
    const avatarHeadPosition = new THREE.Vector3()
    this._head?.getWorldPosition(avatarHeadPosition)

    // Track L_Hand IK Target
    if (!!handPos.l) {
      const effector = handPos.l
      this._trackIkTarget(effector, headPos, avatarHeadPosition, 'J_Bip_L_Hand')
    }
    // Track R_Hand IK Target
    if (!!handPos.r) {
      const effector = handPos.r
      this._trackIkTarget(effector, headPos, avatarHeadPosition, 'J_Bip_R_Hand')
    }
    // Track L_Elbow IK Target
    if (!!elbowPos.l) {
      const effector = elbowPos.l
      this._trackIkTarget(
        effector,
        headPos,
        avatarHeadPosition,
        'J_Bip_L_LowerArm',
      )
    }
    // Track R_Elbow IK Target
    if (!!elbowPos.r) {
      const effector = elbowPos.r
      this._trackIkTarget(
        effector,
        headPos,
        avatarHeadPosition,
        'J_Bip_R_LowerArm',
      )
    }
  }

  private _trackIkTarget(
    ai_effector: THREE.Vector3 | undefined,
    ai_root: THREE.Vector3 | undefined,
    boneRoot: THREE.Vector3,
    effectorName: string,
    lerpAmount: number = 0.3,
  ) {
    if (!ai_effector || !ai_root) return

    let target: THREE.Object3D | null = null
    this._chains.forEach((chain) => {
      if (chain.effector.name === effectorName) target = chain.goal
    })
    if (target) {
      const pos = this._adjustTargetPos(ai_effector, ai_root, boneRoot)
      ;(target as THREE.Object3D).position.lerp(pos, lerpAmount)
    }
  }

  private _adjustTargetPos(
    ai_effector: THREE.Vector3,
    ai_root: THREE.Vector3,
    root: THREE.Vector3,
    coef: number = 1,
  ): THREE.Vector3 {
    const headToTarget = ai_effector.clone().sub(ai_root).multiplyScalar(coef)
    this._rotateTargetByHipsRotation(headToTarget)
    return headToTarget.add(root)
  }

  private _rotateTargetByHipsRotation(target: THREE.Vector3) {
    const rot = new THREE.Quaternion()
    this._hips?.getWorldQuaternion(rot)
    target.applyQuaternion(rot)
  }
}
