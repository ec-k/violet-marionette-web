import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { Viewer } from './viewer'
import { Avatar } from './avatar'

const transCtrlList: TransformControls[] = []

export const setupIKController = (viewer: Viewer, avatar: Avatar, isEnable = false) => {
  if (transCtrlList.length > 0) _deleteIKController()
  if (!avatar.motionController || !avatar.motionController.IK || !avatar.vrm) return
  avatar.motionController.IK.ikChains.forEach((chain) => {
    const transCtrl = new TransformControls(viewer.camera, viewer.canvas)
    transCtrl.size = 0.5
    if (chain.goal) transCtrl.attach(chain.goal)
    transCtrl.addEventListener('dragging-changed', (event) => {
      viewer.orbitControl.enabled = !event.value
    })
    transCtrlList.push(transCtrl)
    if (!isEnable) disableIKController()
  })
}

export const enableIKController = () => {
  transCtrlList.forEach((transCtrl) => {
    transCtrl.object.visible = true
    transCtrl.enabled = true
  })
}
export const disableIKController = () => {
  transCtrlList.forEach((transCtrl) => {
    transCtrl.enabled = false
    transCtrl.object.visible = false
  })
}

const _deleteIKController = () => {
  while (transCtrlList.length > 0) {
    transCtrlList.pop()
  }
}
