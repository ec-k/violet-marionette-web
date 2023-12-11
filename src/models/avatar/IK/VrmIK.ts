import { Object3D, Quaternion } from 'three'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import * as IKSolver from './IKSolver'
import { defaultIKConfig } from './DefaultConfig'
import { IkTargetTracker } from './ikTargetTracker'
import { HumanoidBoneNameKey, aiRim } from 'types'

export class VrmIK {
  private _chains: Array<IKSolver.IKChain>
  private _iteration: number

  ikTargetTracker: IkTargetTracker

  constructor(vrm: VRM, ikConfig: IKSolver.IKConfig = defaultIKConfig) {
    this._chains = ikConfig.chainConfigs.map((chainConfig) => {
      return this._createIKChain(vrm, chainConfig)
    })
    this._iteration = ikConfig.iteration || 1

    this.ikTargetTracker = new IkTargetTracker(vrm, this._chains)
  }

  public get ikChains(): Array<IKSolver.IKChain> {
    return this._chains
  }

  pushPose(handPos: aiRim, elbowPos: aiRim, shoulderPos: aiRim) {
    this.ikTargetTracker.trackTargets(handPos, elbowPos, shoulderPos)
    return this._solve()
  }

  private _solve() {
    const rotations = new Map<HumanoidBoneNameKey, Quaternion>()
    // FIX: ただ，肘からsolveしたいだけ．もっといい書き方があるはず
    this._chains.forEach((chain) => {
      if (
        chain.effector.name === 'J_Bip_L_LowerArm' ||
        chain.effector.name === 'J_Bip_R_LowerArm'
      ) {
        const results = IKSolver.solve(chain, this._iteration)
        results.forEach((q, key) => {
          if (results.has(key)) results.delete(key)
          rotations.set(key, q)
        })
      }
    })
    this._chains.forEach((chain) => {
      if (
        chain.effector.name === 'J_Bip_L_Hand' ||
        chain.effector.name === 'J_Bip_R_Hand'
      ) {
        const results = IKSolver.solve(chain, this._iteration)
        results.forEach((q, key) => {
          if (results.has(key)) results.delete(key)
          rotations.set(key, q)
        })
      }
    })
    return rotations
  }

  private _createIKChain(
    vrm: VRM,
    chainConfig: IKSolver.ChainConfig,
  ): IKSolver.IKChain {
    const goal = new Object3D()
    const effector = vrm.humanoid?.getBoneNode(
      VRMSchema.HumanoidBoneName[chainConfig.effectorBoneName],
    )!
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
      bone: vrm.humanoid?.getBoneNode(
        VRMSchema.HumanoidBoneName[jointConfig.boneName],
      ) as any,
      order: jointConfig.order,
      rotationMin: jointConfig.rotationMin,
      rotationMax: jointConfig.rotationMax,
      boneName: jointConfig.boneName,
    }
  }
}
