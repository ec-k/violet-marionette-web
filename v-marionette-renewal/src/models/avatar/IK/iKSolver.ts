import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Vector3, Quaternion, Object3D } from 'three'

import * as THREE from 'three'
declare module 'three' {
  interface Euler {
    toVector3(target: THREE.Vector3): THREE.Vector3
  }
}

// 計算用の一時的な変数
// 不要なインスタンス化をさける
const _goalPosition = new Vector3()
const _joint2GoalVector = new Vector3()
const _effectorPosition = new Vector3()
const _joint2EffectorVector = new Vector3()
const _jointPosition = new Vector3()
const _jointQuaternionInverse = new Quaternion()
const _jointScale = new Vector3()
const _axis = new Vector3()
const _vector = new Vector3()
const _quarternion = new Quaternion()

export const solve = (ikChain: IKChain, iteration: number) => {
  // 目標位置のワールド座標
  ikChain.goal?.getWorldPosition(_goalPosition)

  // To remove side effect.
  // let initialRot = new Map<HumanoidBoneNameKey, Quaternion>()
  // ikChain.joints.forEach((joint) => {
  //   initialRot.set(joint.boneName, joint.bone.quaternion.clone())
  // })

  for (let i = iteration; i > 0; i--) {
    let didConverge = true
    ikChain.joints.forEach((joint) => {
      if (!joint || !joint.bone) return
      // 注目関節のワールド座標・姿勢等を取得する
      joint.bone?.matrixWorld.decompose(_jointPosition, _jointQuaternionInverse, _jointScale)
      _jointQuaternionInverse.invert()

      //  注目関節 -> エフェクタのベクトル
      ikChain.effector?.getWorldPosition(_effectorPosition)
      _joint2EffectorVector.subVectors(_effectorPosition, _jointPosition)
      _joint2EffectorVector.applyQuaternion(_jointQuaternionInverse)
      _joint2EffectorVector.normalize()

      // 注目関節 -> 目標位置のベクトル
      _joint2GoalVector.subVectors(_goalPosition, _jointPosition)
      _joint2GoalVector.applyQuaternion(_jointQuaternionInverse)
      _joint2GoalVector.normalize()

      // cos rad
      let deltaAngle = _joint2GoalVector.dot(_joint2EffectorVector)

      if (deltaAngle > 1.0) {
        deltaAngle = 1.0
      } else if (deltaAngle < -1.0) {
        deltaAngle = -1.0
      }

      // rad
      deltaAngle = Math.acos(deltaAngle)

      // 振動回避
      if (deltaAngle < 1e-5) {
        return
      }

      // TODO:微小回転量の制限

      // 回転軸
      _axis.crossVectors(_joint2EffectorVector, _joint2GoalVector)
      _axis.normalize()

      // 回転
      _quarternion.setFromAxisAngle(_axis, deltaAngle)
      joint.bone?.quaternion.multiply(_quarternion)

      // 回転角・軸制限
      _vector
        .set(joint.bone.rotation.x, joint.bone.rotation.y, joint.bone.rotation.z)
        .max(joint.rotationMin)
        .min(joint.rotationMax)
      joint.bone.rotation.setFromVector3(_vector, joint.order) // This is SIDE EFFECT

      joint.bone.updateMatrixWorld(true)
      didConverge = false
    })

    if (didConverge) break
  }

  // let ikRotations = new Map<HumanoidBoneNameKey, Quaternion>()
  // ikChain.joints.forEach((joint) => {
  //   ikRotations.set(joint.boneName, joint.bone.quaternion.clone())
  // })
  // ikChain.joints.forEach((joint) => {
  //   const rot = initialRot.get(joint.boneName)
  //   if (!!rot) joint.bone.quaternion.copy(rot)
  // })

  // return ikRotations
}

export interface IKChain {
  goal: Object3D | null
  effector: Object3D | null
  joints: Array<Joint>
}

export interface Joint {
  bone: Object3D | null | undefined
  order: 'XYZ' | 'YZX' | 'ZXY' | 'XZY' | 'YXZ' | 'ZYX'
  rotationMin: Vector3
  rotationMax: Vector3
  boneName: VRMHumanBoneName
}

// VRM から IKChainを生成するための情報
export interface IKConfig {
  iteration: number
  chainConfigs: Array<ChainConfig>
}

export interface ChainConfig {
  jointConfigs: Array<JointConfig>
  effectorBoneName: VRMHumanBoneName // IKChain.effectorに設定するボーン
}

export interface JointConfig {
  boneName: VRMHumanBoneName

  // オイラー角の回転順序
  order: 'XYZ' | 'YZX' | 'ZXY' | 'XZY' | 'YXZ' | 'ZYX'

  // オイラー角による関節角度制限
  rotationMin: Vector3 // -pi ~ pi
  rotationMax: Vector3 // -pi ~ pi
}
