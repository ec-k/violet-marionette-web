import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { Viewer } from './Viewer'
import { Avatar } from './Avatar'

export const setupIKController = (viewer: Viewer, avatar: Avatar) => {
  if (!avatar.vrmIK || !avatar.vrm) return
  avatar.vrmIK.ikChains.forEach((chain) => {
    const transCtrl = new TransformControls(viewer.camera, viewer.canvas)
    transCtrl.size = 0.5
    transCtrl.attach(chain.goal)
    transCtrl.addEventListener('dragging-changed', (event) => {
      viewer.orbitControl.enabled = !event.value
    })
    avatar.vrm?.scene.add(transCtrl)
  })
}
