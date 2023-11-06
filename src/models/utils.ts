import { Object3D, Quaternion, Euler, Vector3 } from 'three'
import { VRMSchema } from '@pixiv/three-vrm'
import { clamp } from 'three/src/math/MathUtils'

export function getGlobalRotation(object: Object3D | null): Quaternion {
  if (!object) return new Quaternion().identity()
  return new Quaternion().setFromRotationMatrix(object.matrixWorld)
}

export const setQuaternion = (front: Vector3, up: Vector3) => {
  const def = {
    front: new Vector3(0, 0, 1),
    up: new Vector3(0, 1, 0),
  }

  const q = new Quaternion().setFromUnitVectors(def.front, front)
  def.up.applyQuaternion(q)

  const axisSign = front.dot(new Vector3().crossVectors(def.up, up).normalize())
  const axis = axisSign >= 0 ? front : front.negate()
  const angle = def.up.angleTo(up)

  q.premultiply(new Quaternion().setFromAxisAngle(axis, angle))

  return q
}

export function ConvertBoneName(
  vrmBoneName: VRMSchema.HumanoidBoneName,
): string {
  let result: string = vrmBoneName

  if (vrmBoneName.includes('Thumb')) {
    result = InsertAfterKey(result, 'Thumb', '_')
    if (vrmBoneName.includes('Proximal'))
      result = result.replace('Proximal', 'Metacarpal')
    if (vrmBoneName.includes('Intermediate'))
      result = result.replace('Intermediate', 'Proximal')
  } else if (vrmBoneName.includes('Index'))
    result = InsertAfterKey(result, 'Index', 'Finger_')
  else if (vrmBoneName.includes('Middle'))
    result = InsertAfterKey(result, 'Middle', 'Finger_')
  else if (vrmBoneName.includes('Ring'))
    result = InsertAfterKey(result, 'Ring', 'Finger_')
  else if (vrmBoneName.includes('Little'))
    result = result.replace('Little', 'Pinky_')

  return result[0].toUpperCase() + result.slice(1)
}

const InsertAfterKey = (
  baseString: string,
  key: string,
  insertString: string,
): string => {
  return baseString.replace(key, key + insertString)
}

// This is for debugging.
export const eulerDegree = (quat: Quaternion) => {
  const euler = new Euler().setFromQuaternion(quat)
  const degree = {
    x: (euler.x * 180) / Math.PI,
    y: (euler.y * 180) / Math.PI,
    z: (euler.z * 180) / Math.PI,
  }
  return degree
}

export const quatClamp = (q: Quaternion, min: Vector3, max: Vector3) => {
  const q_euler = new Euler().setFromQuaternion(q)
  const _x = clamp(q_euler.x, min.x, max.x)
  const _y = clamp(q_euler.y, min.y, max.y)
  const _z = clamp(q_euler.z, min.z, max.z)
  return new Quaternion().setFromEuler(new Euler(_x, _y, _z))
}
