import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Quaternion } from 'three'
import { avatarPose } from 'types'

export interface RotationFilter {
  get current(): Quaternion
  push(q: Quaternion): void
}

export interface MotionFilter {
  push(q: Quaternion, key: VRMHumanBoneName): void
  pushAll(pose: avatarPose): void
  filteredRotation(key: VRMHumanBoneName): Quaternion
}

export class RotationQueue {
  private _queue: Quaternion[] = []

  get length() {
    return this._queue.length
  }
  get queue() {
    return this._queue
  }

  pop() {
    return this.queue.pop()
  }
  push(q: Quaternion) {
    this.queue.push(q)
  }
}
