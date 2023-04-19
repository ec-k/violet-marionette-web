export type Transform = {
  position: {
    x: number
    y: number
    z: number
  }
  quaternion: {
    x: number
    y: number
    z: number
    w: number
  }
}

export function addTransform(a: Transform, b: Transform): Transform {
  a.position.x += b.position.x
  a.position.y += b.position.y
  a.position.z += b.position.z
  a.quaternion.x += b.quaternion.x
  a.quaternion.y += b.quaternion.y
  a.quaternion.z += b.quaternion.z
  a.quaternion.w += b.quaternion.w
  return a
}
export function subtractTransform(a: Transform, b: Transform): Transform {
  a.position.x -= b.position.x
  a.position.y -= b.position.y
  a.position.z -= b.position.z
  a.quaternion.x -= b.quaternion.x
  a.quaternion.y -= b.quaternion.y
  a.quaternion.z -= b.quaternion.z
  a.quaternion.w -= b.quaternion.w
  return a
}
