// もしかしたら，websocketの子クラスとかにした方がいいかもしれない．
/*
import { Transform } from 'models/Tracking/Types'
import * as Kalidokit from 'kalidokit'
// import { videoRef.current } from 'models/Tracking/MediapipeAction'
import { videoRef } from 'Components/App'
// import trackingSettings from '../Tracking/TrackingSetting'
import * as THREE from 'three'
// import { TransformOptions } from 'stream'

type Origin = {
  host: string
  port: number
}

// const TrackingControlMessage = {
//     NOTsendToNeos: 0,
//     sendToNeos: 1
// }

export class NetworkHandler {
  private m_ws: any
  private m_clientOrigin: Origin
  private m_isActive: boolean

  constructor(clientOrigin: Origin) {
    this.m_clientOrigin = clientOrigin
    this.m_isActive = false
  }

  get getClientOrigin() {
    return this.m_clientOrigin
  }
  set setClientOrigin({ host, port }: Origin) {
    this.m_clientOrigin.host = host
    this.m_clientOrigin.port = port
  }
  set setWSStatus(isActive: boolean) {
    this.m_isActive = isActive
  }
  get getWSStatus() {
    return this.m_isActive
  }

  ConnectWS(): void {
    const origin: string = `ws://${this.m_clientOrigin.host}:${this.m_clientOrigin.port}`
    this.m_ws = new WebSocket(origin)
  }

  private isTransform(data: unknown): data is Transform {
    const transform = data as Transform

    return (
      typeof transform?.position.x === 'number' &&
      typeof transform?.position.y === 'number' &&
      typeof transform?.position.z === 'number' &&
      typeof transform?.quaternion.x === 'number' &&
      typeof transform?.quaternion.y === 'number' &&
      typeof transform?.quaternion.z === 'number' &&
      typeof transform?.quaternion.w === 'number'
    )
  }

  Send(address: string, values: unknown): void {
    let address_base: string = '/violet-marionette/'
    if (this.isTransform(values)) {
      address_base += 'tracking/'
      this.SendTrackingMessage(`${address_base}${address}`, values)
    } else {
      address_base += 'config/'
      this.SendConfigMessage(`${address_base}${address}`, values)
    }
  }
  // `trackingTargetAddress` is OSC address that signify the tracking target.
  // e.g. 'violet-marionette/tracking/head': if you want to move head
  private SendTrackingMessage(
    trackingTargetAddress: string,
    transform: Transform,
  ): void {
    this.m_ws.send(
      trackingTargetAddress,
      transform.position.x,
      transform.position.y,
      transform.position.z,
      transform.quaternion.x,
      transform.quaternion.y,
      transform.quaternion.z,
      transform.quaternion.w,
    )
  }

  // e.g. `violet-marionette/config/height`
  private SendConfigMessage(configTargetAddress: string, values: any): void {
    this.m_ws.send(configTargetAddress, ...values)
  }

  private ConvertToQuaternionFromEuler(rotation = { x: 0, y: 0, z: 0 }) {
    let euler = new THREE.Euler(rotation.x, rotation.y, rotation.z)
    let quaternion = new THREE.Quaternion().setFromEuler(euler)
    return {
      x: quaternion.x,
      y: quaternion.y,
      z: quaternion.z,
      w: quaternion.w,
    }
  }

  SendPoseMessage(results: any) {
    if (!videoRef.current) return
    // const offset: Transform = trackingSettings.getOffset
    const tmp_addressBase = '/violet-marionette/tracking'

    let riggedPose: Kalidokit.TPose
    let riggedLeftHand: Kalidokit.THand<'Left'>
    let riggedRightHand: Kalidokit.THand<'Right'>
    let riggedFace: Kalidokit.TFace

    const faceLandmarks = results.faceLandmarks
    const pose3DLandmarks = results.ea
    const pose2DLandmarks = results.poseLandmarks
    const leftHandLandmarks = results.rightHandLandmarks
    const rightHandLandmarks = results.leftHandLandmarks

    if (faceLandmarks) {
      riggedFace = Kalidokit.Face.solve(faceLandmarks, {
        runtime: 'mediapipe',
        video: videoRef.current,
      }) as Kalidokit.TFace
      const quaternion_head = this.ConvertToQuaternionFromEuler(riggedFace.head)
      const message_head = [
        tmp_addressBase + 'Head',
        pose3DLandmarks[0].x,
        pose3DLandmarks[0].y,
        pose3DLandmarks[0].z,
        quaternion_head.x,
        -quaternion_head.y,
        -quaternion_head.z,
        quaternion_head.w,
      ]
      // networkHandler.SendPoseMessage(`Head`,)
      this.m_ws.send(...message_head)
    }

    if (pose2DLandmarks && pose3DLandmarks) {
      riggedPose = Kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
        runtime: 'mediapipe',
        video: videoRef.current,
      }) as Kalidokit.TPose

      if (leftHandLandmarks) {
        // if (rightHandLandmarks) {
        riggedLeftHand = Kalidokit.Hand.solve(
          leftHandLandmarks,
          'Left',
        ) as Kalidokit.THand<'Left'>
        // riggedRightHand = Kalidokit.Hand.solve(rightHandLandmarks, "Right");
        const quaternion_leftHand = this.ConvertToQuaternionFromEuler({
          z: riggedPose.LeftHand.z,
          y: riggedLeftHand.LeftWrist.y,
          x: riggedLeftHand.LeftWrist.x,
        })
        // const quaternion_leftHand = ConvertToQuaternionFromEuler({ z: -riggedPose.RightHand.z + OFFSET_LeftHand.rotation.z, y: riggedRightHand.RightWrist.y + OFFSET_LeftHand.rotation.y, x: riggedRightHand.RightWrist.x + OFFSET_LeftHand.rotation.x });
        // const message_leftHand = new OSC.Message(address_base + 'Hand_L',
        const message_leftHand = [
          tmp_addressBase + 'Hand_L',
          pose3DLandmarks[16].x,
          pose3DLandmarks[16].y,
          pose3DLandmarks[16].z,
          // pose3DLandmarks[15].x,
          // pose3DLandmarks[15].y,
          // pose3DLandmarks[15].z,
          quaternion_leftHand.x,
          quaternion_leftHand.y,
          quaternion_leftHand.z,
          quaternion_leftHand.w,
          // tmp_num, tmp_num, tmp_num, tmp_num, tmp_num, tmp_num, tmp_num,
        ]
        this.m_ws.send(...message_leftHand)
      }

      if (rightHandLandmarks) {
        // if (leftHandLandmarks) {
        riggedRightHand = Kalidokit.Hand.solve(
          rightHandLandmarks,
          'Right',
        ) as Kalidokit.THand<'Right'>
        // riggedLeftHand = Kalidokit.Hand.solve(leftHandLandmarks, "Left");
        const quaternion_rightHand = this.ConvertToQuaternionFromEuler({
          z: riggedPose.RightHand.z,
          y: riggedRightHand.RightWrist.y,
          x: riggedRightHand.RightWrist.x,
        })
        // const quaternion_rightHand = ConvertToQuaternionFromEuler({ z: -riggedPose.LeftHand.z + OFFSET_RightHand.rotation.z, y: riggedLeftHand.LeftWrist.y + OFFSET_RightHand.rotation.y, x: riggedLeftHand.LeftWrist.x + OFFSET_RightHand.rotation.x, });
        // const message_rightHand = new OSC.Message(address_base + 'Hand_R',
        const message_rightHand = [
          tmp_addressBase + 'Hand_R',
          -pose3DLandmarks[15].X,
          -pose3DLandmarks[15].y,
          -pose3DLandmarks[15].z,
          // pose3DLandmarks[16].x,
          // pose3DLandmarks[16].y,
          // pose3DLandmarks[16].z,
          quaternion_rightHand.x,
          quaternion_rightHand.y,
          quaternion_rightHand.z,
          quaternion_rightHand.w,
          // tmp_num, tmp_num, tmp_num, tmp_num, tmp_num, tmp_num, tmp_num,
        ]
        this.m_ws.send(...message_rightHand)
      }
    }

    // osc.send(new OSC.Message('KalidoVR/Root/', 10, ENABLE.TRACKING_REFERENCE, 0.1, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001));
    // osc.send(['KalidoVR/Root/',0.001, 0.001, 0.001, 0.001, 0.001, 0.001, 0.001]);
    // tmp_num += 0.1;
    // if (tmp_num > 90.99) tmp_num = 0.5;
  }
}

const networkHandler = Object.freeze(
  new NetworkHandler({ host: `localhost`, port: 3000 }),
)
export default networkHandler
*/
