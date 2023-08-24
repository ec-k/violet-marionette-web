import { Object3D, Quaternion } from 'three'

export function getGlobalRotation(object: Object3D | null): Quaternion {
  if (!object) return new Quaternion().identity()
  return new Quaternion().setFromRotationMatrix(object.matrixWorld)
}
