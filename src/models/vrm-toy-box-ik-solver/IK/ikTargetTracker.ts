import { VRM, VRMSchema } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { aiRim, avatarRim } from 'types'
import * as IKSolver from './IKSolver'

export class IkTargetTracker {
  private _shoulders: avatarRim
  private _elbows: avatarRim
  private _hands: avatarRim

  private _chains: Array<IKSolver.IKChain>

  constructor(vrm: VRM, chains: Array<IKSolver.IKChain>) {
    this._shoulders = {
      l: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftUpperArm)!,
      r: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.RightUpperArm)!,
    }
    this._elbows = {
      l: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftLowerArm)!,
      r: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.RightLowerArm)!,
    }
    this._hands = {
      l: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftHand)!,
      r: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.RightHand)!,
    }

    this._chains = chains
  }

  trackTargets(
    handPos: aiRim,
    elbowPos: aiRim,
    shoulderPos: aiRim /*handTipsPos: aiRim*/,
  ) {
    // const offset = new THREE.Vector3(0.5, 1.5, 0)

    // Track L_Hand IK Target
    if (!!handPos.l && !!elbowPos.l) {
      const [direction, boneLength, boneRoot] =
        this._getBoneRelativeInformation(
          elbowPos.l,
          handPos.l,
          this._elbows.l,
          this._hands.l,
        )
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_L_Hand')
    }
    // Track R_Hand IK Target
    if (!!handPos.r && !!elbowPos.r) {
      const [direction, boneLength, boneRoot] =
        this._getBoneRelativeInformation(
          elbowPos.r,
          handPos.r,
          this._elbows.r,
          this._hands.r,
        )
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_R_Hand')
    }
    // Track L_Elbow IK Target
    if (!!elbowPos.l && !!shoulderPos.l) {
      const [direction, boneLength, boneRoot] =
        this._getBoneRelativeInformation(
          shoulderPos.l,
          elbowPos.l,
          this._shoulders.l,
          this._elbows.l,
        )
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_L_LowerArm')
    }
    // Track R_Elbow IK Target
    if (!!elbowPos.r && !!shoulderPos.r) {
      const [direction, boneLength, boneRoot] =
        this._getBoneRelativeInformation(
          shoulderPos.r,
          elbowPos.r,
          this._shoulders.r,
          this._elbows.r,
        )
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_R_LowerArm')
    }
  }

  private _getBoneRelativeInformation(
    root: THREE.Vector3,
    end: THREE.Vector3,
    rootBone: THREE.Object3D,
    endBone: THREE.Object3D,
  ): [THREE.Vector3, number, THREE.Vector3] {
    const direction = new THREE.Vector3().subVectors(end, root).normalize()
    const boneLength = endBone.position.length()
    const boneRoot = new THREE.Vector3()
    rootBone.getWorldPosition(boneRoot)
    return [direction, boneLength, boneRoot]
  }

  private _trackIkTarget(
    direction: THREE.Vector3 | undefined,
    boneLength: number,
    boneRoot: THREE.Vector3,
    effectorName: string,
    lerpAmount: number = 0.3,
  ) {
    if (!direction) return

    let target: THREE.Object3D | null = null
    this._chains.forEach((chain) => {
      if (chain.effector.name === effectorName) target = chain.goal
    })
    if (target) {
      const pos = this._adjustTargetPos(direction, boneLength, boneRoot)
      ;(target as THREE.Object3D).position.lerp(pos, lerpAmount)
    }
  }

  private _adjustTargetPos(
    direction: THREE.Vector3,
    boneLength: number,
    root: THREE.Vector3,
    coef: number = 1,
  ): THREE.Vector3 {
    const rim = direction.clone().multiplyScalar(boneLength)
    return rim.add(root).multiplyScalar(coef)
  }
}
