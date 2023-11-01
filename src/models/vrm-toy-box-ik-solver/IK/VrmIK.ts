import * as THREE from 'three'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import * as IKSolver from './IKSolver'
import { defaultIKConfig } from './DefaultConfig'
import { aiRim, avatarRim } from './types'

export class VrmIK {
  private _chains: Array<IKSolver.IKChain>
  private _iteration: number
  private _shoulders: avatarRim
  private _elbows: avatarRim
  private _hands: avatarRim

  constructor(vrm: VRM, ikConfig: IKSolver.IKConfig = defaultIKConfig) {
    this._chains = ikConfig.chainConfigs.map((chainConfig) => {
      return this._createIKChain(vrm, chainConfig)
    })
    this._iteration = ikConfig.iteration || 1

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
  }

  public get ikChains(): Array<IKSolver.IKChain> {
    return this._chains
  }

  // TODO: updateの方が良い？
  public solve() {
    // FIX: ただ，肘からsolveしたいだけ．もっといい書き方があるはず
    this._chains.forEach((chain) => {
      if (
        chain.effector.name === 'J_Bip_L_LowerArm' ||
        chain.effector.name === 'J_Bip_R_LowerArm'
      )
        IKSolver.solve(chain, this._iteration)
    })
    this._chains.forEach((chain) => {
      if (
        chain.effector.name === 'J_Bip_L_Hand' ||
        chain.effector.name === 'J_Bip_R_Hand'
      )
        IKSolver.solve(chain, this._iteration)
    })
  }

  public trackPose(handPos: aiRim, elbowPos: aiRim, shoulderPos: aiRim) {
    this._trackTargets(handPos, elbowPos, shoulderPos)
    this.solve()
  }

  private _trackTargets(handPos: aiRim, elbowPos: aiRim, shoulderPos: aiRim) {
    // const offset = new THREE.Vector3(0.5, 1.5, 0)

    // Track L_Hand IK Target
    if (!!handPos.l && !!elbowPos.l) {
      const direction = new THREE.Vector3()
        .subVectors(handPos.l, elbowPos.l)
        .normalize()
      const boneLength = this._hands.l.position.length()
      const boneRoot = new THREE.Vector3()
      this._elbows.l.getWorldPosition(boneRoot)
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_L_Hand')
    }
    // Track R_Hand IK Target
    if (!!handPos.r && !!elbowPos.r) {
      const direction = new THREE.Vector3()
        .subVectors(handPos.r, elbowPos.r)
        .normalize()
      const boneLength = this._hands.r.position.length()
      const boneRoot = new THREE.Vector3()
      this._elbows.r.getWorldPosition(boneRoot)
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_R_Hand')
    }
    // Track L_Elbow IK Target
    if (!!elbowPos.l && !!shoulderPos.l) {
      const direction = new THREE.Vector3()
        .subVectors(elbowPos.l, shoulderPos.l)
        .normalize()
      const boneLength = this._elbows.l.position.length()
      const boneRoot = new THREE.Vector3()
      this._shoulders.l.getWorldPosition(boneRoot)
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_L_LowerArm')
    }
    // Track R_Elbow IK Target
    if (!!elbowPos.r && !!shoulderPos.r) {
      const direction = new THREE.Vector3()
        .subVectors(elbowPos.r, shoulderPos.r)
        .normalize()
      const boneLength = this._elbows.r.position.length()
      const boneRoot = new THREE.Vector3()
      this._shoulders.r.getWorldPosition(boneRoot)
      this._trackIkTarget(direction, boneLength, boneRoot, 'J_Bip_R_LowerArm')
    }
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
    const rim = new THREE.Vector3(-direction.x, -direction.y, direction.z)
      .clone()
      .multiplyScalar(boneLength)
    return rim.add(root).multiplyScalar(coef)
  }

  private _createIKChain(
    vrm: VRM,
    chainConfig: IKSolver.ChainConfig,
  ): IKSolver.IKChain {
    const goal = new THREE.Object3D()
    const effector = vrm.humanoid?.getBoneNode(chainConfig.effectorBoneName)!
    const joints = chainConfig.jointConfigs.map((jointConfig) => {
      return this._createJoint(vrm, jointConfig)
    })

    effector.getWorldPosition(goal.position)
    vrm.scene.add(goal)

    return {
      goal: goal,
      effector: effector,
      joints: joints,
    }
  }

  private _createJoint(
    vrm: VRM,
    jointConfig: IKSolver.JointConfig,
  ): IKSolver.Joint {
    return {
      bone: vrm.humanoid?.getBoneNode(jointConfig.boneName) as any,
      order: jointConfig.order,
      rotationMin: jointConfig.rotationMin,
      rotationMax: jointConfig.rotationMax,
    }
  }
}
