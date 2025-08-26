import * as Kalidokit from 'kalidokit'
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { trackingSettings } from '../../stores/userSettings'
import { avatarPose } from 'types'
import type { KalidokitRig } from 'types'
import { NormalizedLandmarkList } from '@mediapipe/holistic'

export class VrmFK {
  private _lerp = Kalidokit.Vector.lerp
  private _clamp = Kalidokit.Utils.clamp
  private _rig: KalidokitRig | null = null

  setRig(results: any, videoEl: HTMLVideoElement) {
    const facelm = results.facelm
    const poselm = results.poselm
    const poselm3d = results.poselm3d
    const rightHandlm = results.rightHandlm
    const leftHandlm = results.leftHandlm

    this._rotateResults(poselm)
    this._rotateResults(poselm3d)
    this._rotateResults(rightHandlm)
    this._rotateResults(leftHandlm)

    const vrmRigs: KalidokitRig = {
      face:
        facelm &&
        Kalidokit.Face.solve(facelm, {
          runtime: 'mediapipe',
          video: videoEl,
        }),
      pose:
        poselm &&
        poselm3d &&
        Kalidokit.Pose.solve(poselm3d, poselm, {
          runtime: 'mediapipe',
          video: videoEl,
          enableLegs: true,
        }),
      leftHand: leftHandlm && Kalidokit.Hand.solve(leftHandlm, 'Left'),
      rightHand: rightHandlm && Kalidokit.Hand.solve(rightHandlm, 'Right'),
    }
    this._rig = vrmRigs
  }

  // Coordinate transformation with camera angle.
  private _rotateResults(LMs: NormalizedLandmarkList | undefined) {
    if (!LMs) return
    LMs.forEach((lm) => {
      const angle = trackingSettings.angleWithRadian
      lm.z = lm.z * Math.cos(angle) - lm.y * Math.sin(angle)
      lm.y = lm.y * Math.cos(angle) + lm.z * Math.sin(angle)
    })
  }

  private _rigRotation = (
    vrm: VRM,
    name: VRMHumanBoneName,
    rotation = { x: 0, y: 0, z: 0 },
    dampener = 1,
    // lerpAmount = 0.3,
  ) => {
    if (!vrm) return
    const Part = vrm.humanoid?.getRawBoneNode(name)
    if (!Part) return

    const euler = new THREE.Euler(
      rotation.x * dampener,
      rotation.y * dampener,
      rotation.z * dampener,
    )

    return new THREE.Quaternion().setFromEuler(euler)
    // Part?.quaternion.slerp(quaternion, lerpAmount) // interpolate
  }

  // private _rigPosition = (
  //   vrm: VRM,
  //   name: HumanoidBoneNameKey,
  //   position = { x: 0, y: 0, z: 0 },
  //   dampener = 1,
  //   _lerpAmount = 0.3,
  // ) => {
  //   if (!vrm.humanoid) return
  //   const Part = vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[name])
  //   if (!Part) return
  //   let vector = new THREE.Vector3(
  //     position.x * dampener,
  //     position.y * dampener,
  //     position.z * dampener,
  //   )
  //   Part.position.lerp(vector, _lerpAmount)
  // }

  private _oldLookTarget = new THREE.Euler()
  private _rigFace(vrm: VRM, riggedFace: Kalidokit.TFace): Map<VRMHumanBoneName, THREE.Quaternion> {
    const rotations = new Map<VRMHumanBoneName, THREE.Quaternion>()
    if (!vrm) return rotations
    if (!riggedFace) return rotations

    const neckRot = this._rigRotation(vrm, 'neck', riggedFace.head, 0.7)
    if (neckRot) rotations.set('neck', neckRot)

    const Blendshape = vrm.expressionManager

    if (!Blendshape) return rotations
    // for VRM, 1 is closed, 0 is open.
    const EyeL = this._lerp(
      this._clamp(1 - riggedFace.eye.l, 0, 1),
      Blendshape.getValue('blinkLeft')!,
      0.5,
    )
    const EyeR = this._lerp(
      this._clamp(1 - riggedFace.eye.r, 0, 1),
      Blendshape.getValue('blinkRight')!,
      0.5,
    )
    Blendshape.setValue('blinkLeft', EyeL)
    Blendshape.setValue('blinkRight', EyeR)

    // Interpolate and set mouth expression
    Blendshape.setValue('ih', this._lerp(riggedFace.mouth.shape.I, Blendshape.getValue('ih')!, 0.5))
    Blendshape.setValue('aa', this._lerp(riggedFace.mouth.shape.A, Blendshape.getValue('aa')!, 0.5))
    Blendshape.setValue('ee', this._lerp(riggedFace.mouth.shape.E, Blendshape.getValue('ee')!, 0.5))
    Blendshape.setValue('oh', this._lerp(riggedFace.mouth.shape.O, Blendshape.getValue('oh')!, 0.5))
    Blendshape.setValue('ou', this._lerp(riggedFace.mouth.shape.U, Blendshape.getValue('ou')!, 0.5))

    // PUPILS
    const eyeRots = {
      l: vrm.humanoid?.getRawBoneNode('leftEye')?.quaternion,
      r: vrm.humanoid?.getRawBoneNode('rightEye')?.quaternion,
    }
    const prevRots = {
      l: eyeRots.l?.clone(),
      r: eyeRots.r?.clone(),
    }

    // interpolate pupil and keep a copy of the value
    const lookTarget = new THREE.Euler(
      this._lerp(this._oldLookTarget.x, riggedFace.pupil.y, 0.4),
      this._lerp(this._oldLookTarget.y, riggedFace.pupil.x, 0.4),
      0,
      'XYZ',
    )
    vrm.lookAt?.applier?.lookAt(lookTarget)
    this._oldLookTarget.copy(lookTarget)

    if (eyeRots.l) rotations.set('leftEye', eyeRots.l.clone())
    if (eyeRots.r) rotations.set('rightEye', eyeRots.r.clone())

    // Counteracting side-effects not to move pupils in this function.
    if (prevRots.l) eyeRots.l?.copy(prevRots.l)
    if (prevRots.r) eyeRots.r?.copy(prevRots.r)

    return rotations
  }

  pushPose(vrm: VRM, enabledFK: boolean): avatarPose | undefined {
    const rig = this._rig
    if (!rig) return
    if (!vrm) return
    const rotations: avatarPose = new avatarPose()

    const setRotation = (
      name: VRMHumanBoneName,
      rotation = { x: 0, y: 0, z: 0 },
      dampener = 1,
      // lerpAmount = 0.3,
    ) => {
      const rot = this._rigRotation(vrm, name, rotation, dampener /*, lerpAmount*/)
      if (!rot) return
      rotations.set(name, rot)
    }

    // Animate Face
    if (rig.face) {
      const facePartsRotations = this._rigFace(vrm, rig.face)
      if (facePartsRotations)
        facePartsRotations.forEach((q, key) => {
          rotations.set(key, q)
        })
    }

    // Animate Pose
    if (rig.pose) {
      if (rig.pose.Hips.rotation && !trackingSettings.sit)
        setRotation('hips', { y: rig.pose.Hips.rotation.y, x: 0, z: 0 }, 0.7)
      // this._rigPosition(
      //   vrm,
      //   'Hips',
      //   {
      //     x: -rig.pose.Hips.position.x,
      //     y: rig.pose.Hips.position.y + 1,
      //     z: -rig.pose.Hips.position.z,
      //   },
      //   1,
      //   0.07,
      // )

      // const lerpAmount = 0.3
      setRotation('chest', rig.pose.Spine, 0.25)
      setRotation('spine', rig.pose.Spine, 0.45)

      if (enabledFK) {
        setRotation('rightUpperArm', rig.pose.RightUpperArm, 1)
        setRotation('rightLowerArm', rig.pose.RightLowerArm, 1)
        setRotation('leftUpperArm', rig.pose.LeftUpperArm, 1)
        setRotation('leftLowerArm', rig.pose.LeftLowerArm, 1)
      }

      if (trackingSettings.enableLeg) {
        setRotation('leftUpperLeg', rig.pose.LeftUpperLeg, 1)
        setRotation('leftLowerLeg', rig.pose.LeftLowerLeg, 1)
        setRotation('rightUpperLeg', rig.pose.RightUpperLeg, 1)
        setRotation('rightLowerLeg', rig.pose.RightLowerLeg, 1)
      } else if (trackingSettings.sit) {
        const upperLegRot = new THREE.Euler(Math.PI / 2, 0, 0)
        const lowerLegRot = new THREE.Euler(-Math.PI / 2, 0, 0)
        setRotation('leftUpperLeg', upperLegRot, 1)
        setRotation('leftLowerLeg', lowerLegRot, 1)
        setRotation('rightUpperLeg', upperLegRot, 1)
        setRotation('rightLowerLeg', lowerLegRot, 1)
      } else {
        const defaultRot = new THREE.Quaternion(0, 0, 0, 1)
        setRotation('leftUpperLeg', defaultRot, 1)
        setRotation('leftLowerLeg', defaultRot, 1)
        setRotation('rightUpperLeg', defaultRot, 1)
        setRotation('rightLowerLeg', defaultRot, 1)
      }

      if (rig.leftHand) {
        if (enabledFK)
          setRotation('leftHand', {
            z: rig.pose.LeftHand.z,
            y: rig.leftHand.LeftWrist.y,
            x: rig.leftHand.LeftWrist.x,
          })
        setRotation('leftRingProximal', rig.leftHand.LeftRingProximal)
        setRotation('leftRingIntermediate', rig.leftHand.LeftRingIntermediate)
        setRotation('leftRingDistal', rig.leftHand.LeftRingDistal)
        setRotation('leftIndexProximal', rig.leftHand.LeftIndexProximal)
        setRotation('leftIndexIntermediate', rig.leftHand.LeftIndexIntermediate)
        setRotation('leftIndexDistal', rig.leftHand.LeftIndexDistal)
        setRotation('leftMiddleProximal', rig.leftHand.LeftMiddleProximal)
        setRotation('leftMiddleIntermediate', rig.leftHand.LeftMiddleIntermediate)
        setRotation('leftMiddleDistal', rig.leftHand.LeftMiddleDistal)
        setRotation('leftThumbProximal', rig.leftHand.LeftThumbProximal)
        setRotation('leftThumbMetacarpal', rig.leftHand.LeftThumbIntermediate)
        // setRotation(LeftThumbMetacarpal', this._rig.leftHand.LeftThumbProximal)
        // setRotation(LeftThumbProximal', this._rig.leftHand.LeftThumbIntermediate)
        setRotation('leftThumbDistal', rig.leftHand.LeftThumbDistal)
        setRotation('leftLittleProximal', rig.leftHand.LeftLittleProximal)
        setRotation('leftLittleIntermediate', rig.leftHand.LeftLittleIntermediate)
        setRotation('leftLittleDistal', rig.leftHand.LeftLittleDistal)
      }
      if (rig.rightHand) {
        if (enabledFK)
          setRotation('rightHand', {
            // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
            z: rig.pose.RightHand.z,
            y: rig.rightHand.RightWrist.y,
            x: rig.rightHand.RightWrist.x,
          })
        setRotation('rightRingProximal', rig.rightHand.RightRingProximal)
        setRotation('rightRingIntermediate', rig.rightHand.RightRingIntermediate)
        setRotation('rightRingDistal', rig.rightHand.RightRingDistal)
        setRotation('rightIndexProximal', rig.rightHand.RightIndexProximal)
        setRotation('rightIndexIntermediate', rig.rightHand.RightIndexIntermediate)
        setRotation('rightIndexDistal', rig.rightHand.RightIndexDistal)
        setRotation('rightMiddleProximal', rig.rightHand.RightMiddleProximal)
        setRotation('rightMiddleIntermediate', rig.rightHand.RightMiddleIntermediate)
        setRotation('rightMiddleDistal', rig.rightHand.RightMiddleDistal)
        setRotation('rightThumbProximal', rig.rightHand.RightThumbProximal)
        setRotation('rightThumbMetacarpal', rig.rightHand.RightThumbIntermediate)
        // setRotation(RightThumbMetacarpal', this._rig.rightHand.RightThumbProximal)
        // setRotation(RightThumbProximal', this._rig.rightHand.RightThumbIntermediate)
        setRotation('rightThumbDistal', rig.rightHand.RightThumbDistal)
        setRotation('rightLittleProximal', rig.rightHand.RightLittleProximal)
        setRotation('rightLittleIntermediate', rig.rightHand.RightLittleIntermediate)
        setRotation('rightLittleDistal', rig.rightHand.RightLittleDistal)
      }
    }

    return rotations
  }
}
