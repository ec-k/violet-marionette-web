import { VRMSchema } from '@pixiv/three-vrm'

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

function InsertAfterKey(
  baseString: string,
  key: string,
  insertString: string,
): string {
  return baseString.replace(key, key + insertString)
}
