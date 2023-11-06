import { Object3D } from 'three'
import { VRM } from '@pixiv/three-vrm'
import * as IKSolver from './IKSolver'
import { defaultIKConfig } from './DefaultConfig'
import { RotateHand } from './RotateHand'
import { IkTargetTracker } from './ikTargetTracker'

export class VrmIK {
  private _chains: Array<IKSolver.IKChain>
  private _iteration: number

  ikTargetTracker: IkTargetTracker
  rotateHand: RotateHand

  constructor(vrm: VRM, ikConfig: IKSolver.IKConfig = defaultIKConfig) {
    this._chains = ikConfig.chainConfigs.map((chainConfig) => {
      return this._createIKChain(vrm, chainConfig)
    })
    this._iteration = ikConfig.iteration || 1

    this.ikTargetTracker = new IkTargetTracker(vrm, this._chains)
    this.rotateHand = new RotateHand(vrm)
  }

  public get ikChains(): Array<IKSolver.IKChain> {
    return this._chains
  }

  solve() {
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
    this.rotateHand.rotateHands()
  }

  private _createIKChain(
    vrm: VRM,
    chainConfig: IKSolver.ChainConfig,
  ): IKSolver.IKChain {
    const goal = new Object3D()
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
