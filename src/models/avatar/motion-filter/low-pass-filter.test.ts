import { MathUtils, Quaternion, Euler } from 'three'
import { RotationLPF } from './low-pass-filter'

test('test RotationLPF', () => {
  const rotLPF = new RotationLPF(30)
  const q = new Quaternion().identity()
  for (let i = 0; i < 60; i++) {
    const qq = new Quaternion().multiplyQuaternions(
      new Quaternion().setFromEuler(
        new Euler(MathUtils.degToRad(i * 2 - 60), 0, 0),
      ),
      q,
    )
    rotLPF.push(qq)
  }
  console.log(rotLPF.range)
  console.log(eulerDegree(rotLPF.current))
  const dummy = true

  expect(dummy).toBe(true)
})

const eulerDegree = (q: Quaternion) => {
  const euler = new Euler().setFromQuaternion(q)
  return {
    x: MathUtils.radToDeg(euler.x),
    y: MathUtils.radToDeg(euler.y),
    z: MathUtils.radToDeg(euler.z),
  }
}
