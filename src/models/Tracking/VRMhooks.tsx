import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMUtils } from '@pixiv/three-vrm'
import React from 'react'
import { useFrame } from 'react-three-fiber'
import { Vector3 } from 'three'

const useVRM = (): [
  VRM | null,
  (url: string /*scene: THREE.Scene*/) => Promise<void>,
] => {
  const { current: loader } = React.useRef(new GLTFLoader())
  const [vrm, setVRM] = React.useState<VRM | null>(null)

  const loadVRM = React.useCallback(
    (url: string /*scene: THREE.Scene*/): Promise<void> =>
      new Promise((resolve: (_: GLTF) => void) =>
        loader.load(url, resolve),
      ).then((gltf) => {
        // if (vrm) scene.remove(vrm.scene)
        VRMUtils.removeUnnecessaryJoints(gltf.scene)
        VRM.from(gltf)
          .then((gotVrm) => {
            // scene.add(gotVrm.scene)
            // gotVrm.scene.rotation.y = Math.PI
            // if (scene)
            setVRM(gotVrm)
          })
          .catch((e) => {
            console.log('Failed to load VRM', e)
          })
      }),
    [],
  )

  return [vrm, loadVRM]
}

type VRMElementProps = {
  vrm: VRM | null
}
export const VRMElement: React.FC<VRMElementProps> = ({ vrm }) => {
  useFrame(({ clock, mouse }, delta) => {
    if (vrm) {
      vrm.scene.rotation.y = Math.PI * Math.sin(clock.getElapsedTime())
      if (vrm.lookAt) vrm.lookAt.lookAt(new Vector3(mouse.x, mouse.y, 0))

      vrm.update(delta)
    }
  })

  return vrm && <primitive object={vrm.scene} />
}

export { useVRM }
