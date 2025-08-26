import { Quaternion } from 'three'
import { HumanoidBoneNameKey, avatarPose } from 'types'

export interface RotationFilter {
  get current(): Quaternion
  push(q: Quaternion): void
}

export interface MotionFilter {
  push(q: Quaternion, key: HumanoidBoneNameKey): void
  pushAll(pose: avatarPose): void
  filteredRotation(key: HumanoidBoneNameKey): Quaternion
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
