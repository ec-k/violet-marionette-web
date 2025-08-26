import * as Kalidokit from 'kalidokit'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { trackingSettings } from '../../stores/userSettings'
import { KalidokitRig, HumanoidBoneNameKey, avatarPose } from 'types'
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
    name: HumanoidBoneNameKey,
    rotation = { x: 0, y: 0, z: 0 },
    dampener = 1,
    _lerpAmount = 0.3,
  ) => {
    if (!vrm) return
    const Part = vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName[name])
    if (!Part) return

    let euler = new THREE.Euler(
      rotation.x * dampener,
      rotation.y * dampener,
      rotation.z * dampener,
    )

    return new THREE.Quaternion().setFromEuler(euler)
    // Part.quaternion.slerp(quaternion, _lerpAmount) // interpolate
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
  private _rigFace(
    vrm: VRM,
    riggedFace: Kalidokit.TFace,
  ): Map<HumanoidBoneNameKey, THREE.Quaternion> {
    const rotations = new Map<HumanoidBoneNameKey, THREE.Quaternion>()
    if (!vrm) return rotations
    if (!riggedFace) return rotations

    const neckRot = this._rigRotation(vrm, 'Neck', riggedFace.head, 0.7)
    if (neckRot) rotations.set('Neck', neckRot)

    const Blendshape = vrm.blendShapeProxy
    const PresetName = VRMSchema.BlendShapePresetName

    if (!Blendshape) return rotations
    if (!PresetName) return rotations
    // for VRM, 1 is closed, 0 is open.
    const EyeL = this._lerp(
      this._clamp(1 - riggedFace.eye.l, 0, 1),
      Blendshape.getValue(PresetName.BlinkL)!,
      0.5,
    )
    const EyeR = this._lerp(
      this._clamp(1 - riggedFace.eye.r, 0, 1),
      Blendshape.getValue(PresetName.BlinkR)!,
      0.5,
    )
    Blendshape.setValue(PresetName.BlinkL, EyeL)
    Blendshape.setValue(PresetName.BlinkR, EyeR)

    // Interpolate and set mouth expression
    Blendshape.setValue(
      PresetName.I,
      this._lerp(
        riggedFace.mouth.shape.I,
        Blendshape.getValue(PresetName.I)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.A,
      this._lerp(
        riggedFace.mouth.shape.A,
        Blendshape.getValue(PresetName.A)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.E,
      this._lerp(
        riggedFace.mouth.shape.E,
        Blendshape.getValue(PresetName.E)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.O,
      this._lerp(
        riggedFace.mouth.shape.O,
        Blendshape.getValue(PresetName.O)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.U,
      this._lerp(
        riggedFace.mouth.shape.U,
        Blendshape.getValue(PresetName.U)!,
        0.5,
      ),
    )

    // PUPILS
    const eyeRots = {
      l: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.LeftEye)
        ?.quaternion,
      r: vrm.humanoid?.getBoneNode(VRMSchema.HumanoidBoneName.RightEye)
        ?.quaternion,
    }
    const prevRots = {
      l: eyeRots.l?.clone(),
      r: eyeRots.r?.clone(),
    }

    // interpolate pupil and keep a copy of the value
    let lookTarget = new THREE.Euler(
      this._lerp(this._oldLookTarget.x, riggedFace.pupil.y, 0.4),
      this._lerp(this._oldLookTarget.y, riggedFace.pupil.x, 0.4),
      0,
      'XYZ',
    )
    vrm.lookAt?.applyer?.lookAt(lookTarget)
    this._oldLookTarget.copy(lookTarget)

    if (eyeRots.l) rotations.set('LeftEye', eyeRots.l.clone())
    if (eyeRots.r) rotations.set('RightEye', eyeRots.r.clone())

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
      name: HumanoidBoneNameKey,
      rotation = { x: 0, y: 0, z: 0 },
      dampener = 1,
      _lerpAmount = 0.3,
    ) => {
      const rot = this._rigRotation(vrm, name, rotation, dampener, _lerpAmount)
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
        setRotation('Hips', { y: rig.pose.Hips.rotation.y, x: 0, z: 0 }, 0.7)
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

      setRotation('Chest', rig.pose.Spine, 0.25, 0.3)
      setRotation('Spine', rig.pose.Spine, 0.45, 0.3)

      if (enabledFK) {
        setRotation('RightUpperArm', rig.pose.RightUpperArm, 1, 0.3)
        setRotation('RightLowerArm', rig.pose.RightLowerArm, 1, 0.3)
        setRotation('LeftUpperArm', rig.pose.LeftUpperArm, 1, 0.3)
        setRotation('LeftLowerArm', rig.pose.LeftLowerArm, 1, 0.3)
      }

      if (trackingSettings.enableLeg) {
        setRotation('LeftUpperLeg', rig.pose.LeftUpperLeg, 1, 0.3)
        setRotation('LeftLowerLeg', rig.pose.LeftLowerLeg, 1, 0.3)
        setRotation('RightUpperLeg', rig.pose.RightUpperLeg, 1, 0.3)
        setRotation('RightLowerLeg', rig.pose.RightLowerLeg, 1, 0.3)
      } else if (trackingSettings.sit) {
        const upperLegRot = new THREE.Euler(Math.PI / 2, 0, 0)
        const lowerLegRot = new THREE.Euler(-Math.PI / 2, 0, 0)
        setRotation('LeftUpperLeg', upperLegRot, 1, 0.3)
        setRotation('LeftLowerLeg', lowerLegRot, 1, 0.3)
        setRotation('RightUpperLeg', upperLegRot, 1, 0.3)
        setRotation('RightLowerLeg', lowerLegRot, 1, 0.3)
      } else {
        const defaultRot = new THREE.Quaternion(0, 0, 0, 1)
        setRotation('LeftUpperLeg', defaultRot, 1, 0.3)
        setRotation('LeftLowerLeg', defaultRot, 1, 0.3)
        setRotation('RightUpperLeg', defaultRot, 1, 0.3)
        setRotation('RightLowerLeg', defaultRot, 1, 0.3)
      }

      if (rig.leftHand) {
        if (enabledFK)
          setRotation('LeftHand', {
            z: rig.pose.LeftHand.z,
            y: rig.leftHand.LeftWrist.y,
            x: rig.leftHand.LeftWrist.x,
          })
        setRotation('LeftRingProximal', rig.leftHand.LeftRingProximal)
        setRotation('LeftRingIntermediate', rig.leftHand.LeftRingIntermediate)
        setRotation('LeftRingDistal', rig.leftHand.LeftRingDistal)
        setRotation('LeftIndexProximal', rig.leftHand.LeftIndexProximal)
        setRotation('LeftIndexIntermediate', rig.leftHand.LeftIndexIntermediate)
        setRotation('LeftIndexDistal', rig.leftHand.LeftIndexDistal)
        setRotation('LeftMiddleProximal', rig.leftHand.LeftMiddleProximal)
        setRotation(
          'LeftMiddleIntermediate',
          rig.leftHand.LeftMiddleIntermediate,
        )
        setRotation('LeftMiddleDistal', rig.leftHand.LeftMiddleDistal)
        setRotation('LeftThumbProximal', rig.leftHand.LeftThumbProximal)
        setRotation('LeftThumbIntermediate', rig.leftHand.LeftThumbIntermediate)
        // setRotation(LeftThumbMetacarpal', this._rig.leftHand.LeftThumbProximal)
        // setRotation(LeftThumbProximal', this._rig.leftHand.LeftThumbIntermediate)
        setRotation('LeftThumbDistal', rig.leftHand.LeftThumbDistal)
        setRotation('LeftLittleProximal', rig.leftHand.LeftLittleProximal)
        setRotation(
          'LeftLittleIntermediate',
          rig.leftHand.LeftLittleIntermediate,
        )
        setRotation('LeftLittleDistal', rig.leftHand.LeftLittleDistal)
      }
      if (rig.rightHand) {
        if (enabledFK)
          setRotation('RightHand', {
            // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
            z: rig.pose.RightHand.z,
            y: rig.rightHand.RightWrist.y,
            x: rig.rightHand.RightWrist.x,
          })
        setRotation('RightRingProximal', rig.rightHand.RightRingProximal)
        setRotation(
          'RightRingIntermediate',
          rig.rightHand.RightRingIntermediate,
        )
        setRotation('RightRingDistal', rig.rightHand.RightRingDistal)
        setRotation('RightIndexProximal', rig.rightHand.RightIndexProximal)
        setRotation(
          'RightIndexIntermediate',
          rig.rightHand.RightIndexIntermediate,
        )
        setRotation('RightIndexDistal', rig.rightHand.RightIndexDistal)
        setRotation('RightMiddleProximal', rig.rightHand.RightMiddleProximal)
        setRotation(
          'RightMiddleIntermediate',
          rig.rightHand.RightMiddleIntermediate,
        )
        setRotation('RightMiddleDistal', rig.rightHand.RightMiddleDistal)
        setRotation('RightThumbProximal', rig.rightHand.RightThumbProximal)
        setRotation(
          'RightThumbIntermediate',
          rig.rightHand.RightThumbIntermediate,
        )
        // setRotation(RightThumbMetacarpal', this._rig.rightHand.RightThumbProximal)
        // setRotation(RightThumbProximal', this._rig.rightHand.RightThumbIntermediate)
        setRotation('RightThumbDistal', rig.rightHand.RightThumbDistal)
        setRotation('RightLittleProximal', rig.rightHand.RightLittleProximal)
        setRotation(
          'RightLittleIntermediate',
          rig.rightHand.RightLittleIntermediate,
        )
        setRotation('RightLittleDistal', rig.rightHand.RightLittleDistal)
      }
    }

    return rotations
  }
}
