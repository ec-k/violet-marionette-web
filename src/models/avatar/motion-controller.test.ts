import { VRMSchema } from '@pixiv/three-vrm'
import { HumanoidBoneNameKey } from 'types'

test('test humanoid bone key', () => {
  let dummy = 0
  Object.keys(VRMSchema.HumanoidBoneName).forEach((bn) => {
    const boneName = bn as HumanoidBoneNameKey
    console.log(boneName)
    // if (boneName === 'Head') return
    dummy++
  })
  expect(dummy).toBe(55)
})
