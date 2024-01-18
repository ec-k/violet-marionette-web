import { MathUtils, Object3D, Quaternion, Vector3 } from 'three'

export class TwoBoneIK {
  private _chain
  constructor(bone_1: Object3D, bone_2: Object3D, bone_3: Object3D) {
    this._chain = [bone_1, bone_2, bone_3]
  }

  solve(target: Vector3) {
    const [a, b, c] = [new Vector3(), new Vector3(), new Vector3()]
    this._chain[0].getWorldPosition(a)
    this._chain[1].getWorldPosition(b)
    this._chain[2].getWorldPosition(c)

    const ab = new Vector3().subVectors(b, a)
    const bc = new Vector3().subVectors(c, b)
    const at = new Vector3().subVectors(a, target)

    const ab_normalized = ab.clone().normalize()
    const bc_normalized = bc.clone().normalize()

    const lab = ab.length()
    const lbc = bc.length()
    const lat = at.length()

    const clamp = MathUtils.clamp
    const acos = Math.acos

    const ab_ac_current = acos(clamp(ab_normalized.dot(bc_normalized), -1, 1))
    const ba_bc_current = acos(
      clamp(ab_normalized.clone().negate().dot(bc_normalized), -1, 1),
    )

    const ab_ac_target = clamp(
      acos((lab ** 2 + lat ** 2 - lbc ** 2) / (2 * lab * lat)),
      -1,
      1,
    )
    const ba_bc_target = clamp(
      acos((lab ** 2 + lbc ** 2 - lat ** 2) / (2 * lab * lbc)),
      -1,
      1,
    )
    const ac = new Vector3().subVectors(c, a)
    const ac_normalized = ac.clone().normalize()
    const at_normalized = at.clone().normalize()
    const ac_at = clamp(acos(ac_normalized.dot(at_normalized)), -1, 1)

    const axis_0 = new Vector3().crossVectors(ac, ab)
    const axis_1 = new Vector3().crossVectors(ac, at)

    const a_rot_world = new Quaternion()
    this._chain[0].getWorldQuaternion(a_rot_world)
    const b_rot_world = new Quaternion()
    this._chain[1].getWorldQuaternion(b_rot_world)

    const q_root = new Quaternion().setFromAxisAngle(
      axis_0.clone().applyQuaternion(a_rot_world.invert()),
      ab_ac_target - ab_ac_current,
    )
    const q_mid = new Quaternion().setFromAxisAngle(
      axis_0.clone().applyQuaternion(b_rot_world.invert()),
      ba_bc_target - ba_bc_current,
    )
    const q_target = new Quaternion().setFromAxisAngle(
      axis_1.clone().applyQuaternion(a_rot_world.invert()),
      ac_at,
    )

    this._chain[0].quaternion.multiply(q_root).multiply(q_target)
    this._chain[1].quaternion.multiply(q_mid)
  }
  //   private _upVectorConstraint(joint: Joint, targetPos: Vector3): void {
  //       const _targetPos = this._worldPosToLocalPos(targetPos.clone(), joint.bone)
  //   }
}
