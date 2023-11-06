import * as Kalidokit from 'kalidokit'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { trackingSettings } from '../../stores/settings'
import { KalidokitRig, HumanoidBoneNameKey } from 'types'
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
    let quaternion = new THREE.Quaternion().setFromEuler(euler)
    if (name === 'RightUpperArm' || name === 'RightHand')
      this._rHandRotAdjust(quaternion)
    Part.quaternion.slerp(quaternion, _lerpAmount) // interpolate
  }

  private _rHandRotAdjust = (quat: THREE.Quaternion) => {
    quat.premultiply(
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(THREE.MathUtils.degToRad(-45), 0, 0),
      ),
    )
  }

  private _rigPosition = (
    vrm: VRM,
    name: HumanoidBoneNameKey,
    position = { x: 0, y: 0, z: 0 },
    dampener = 1,
    _lerpAmount = 0.3,
  ) => {
    if (!vrm.humanoid) return
    const Part = vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[name])
    if (!Part) return
    let vector = new THREE.Vector3(
      position.x * dampener,
      position.y * dampener,
      position.z * dampener,
    )
    Part.position.lerp(vector, _lerpAmount)
  }

  private _oldLookTarget = new THREE.Euler()
  private _rigFace(vrm: VRM, riggedFace: Kalidokit.TFace) {
    if (!vrm) return
    if (!riggedFace) return
    this._rigRotation(vrm, 'Neck', riggedFace.head, 0.7)

    const Blendshape = vrm.blendShapeProxy
    const PresetName = VRMSchema.BlendShapePresetName

    if (!Blendshape) return
    if (!PresetName) return
    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.
    riggedFace.eye.l = this._lerp(
      this._clamp(1 - riggedFace.eye.l, 0, 1),
      Blendshape.getValue(PresetName.Blink)!,
      0.5,
    )
    riggedFace.eye.r = this._lerp(
      this._clamp(1 - riggedFace.eye.r, 0, 1),
      Blendshape.getValue(PresetName.Blink)!,
      0.5,
    )
    riggedFace.eye = Kalidokit.Face.stabilizeBlink(
      riggedFace.eye,
      riggedFace.head.y,
    )
    Blendshape.setValue(PresetName.Blink, riggedFace.eye.l)

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
    // interpolate pupil and keep a copy of the value
    let lookTarget = new THREE.Euler(
      this._lerp(this._oldLookTarget.x, riggedFace.pupil.y, 0.4),
      this._lerp(this._oldLookTarget.y, riggedFace.pupil.x, 0.4),
      0,
      'XYZ',
    )
    this._oldLookTarget.copy(lookTarget)
    vrm.lookAt?.applyer?.lookAt(lookTarget)
  }

  setPose(vrm: VRM, enabledFK: boolean): void {
    const rig = this._rig
    if (!rig) return
    if (!vrm) return

    // Animate Face
    if (rig.face) {
      this._rigFace(vrm, rig.face)
    }

    // Animate Pose
    if (rig.pose) {
      this._rigRotation(vrm, 'Hips', rig.pose.Hips.rotation, 0.7)
      this._rigPosition(
        vrm,
        'Hips',
        {
          x: -rig.pose.Hips.position.x,
          y: rig.pose.Hips.position.y + 1,
          z: -rig.pose.Hips.position.z,
        },
        1,
        0.07,
      )

      this._rigRotation(vrm, 'Chest', rig.pose.Spine, 0.25, 0.3)
      this._rigRotation(vrm, 'Spine', rig.pose.Spine, 0.45, 0.3)

      if (enabledFK) {
        this._rigRotation(vrm, 'RightUpperArm', rig.pose.RightUpperArm, 1, 0.3)
        this._rigRotation(vrm, 'RightLowerArm', rig.pose.RightLowerArm, 1, 0.3)
        this._rigRotation(vrm, 'LeftUpperArm', rig.pose.LeftUpperArm, 1, 0.3)
        this._rigRotation(vrm, 'LeftLowerArm', rig.pose.LeftLowerArm, 1, 0.3)
      }

      if (trackingSettings.enableLeg) {
        this._rigRotation(vrm, 'LeftUpperLeg', rig.pose.LeftUpperLeg, 1, 0.3)
        this._rigRotation(vrm, 'LeftLowerLeg', rig.pose.LeftLowerLeg, 1, 0.3)
        this._rigRotation(vrm, 'RightUpperLeg', rig.pose.RightUpperLeg, 1, 0.3)
        this._rigRotation(vrm, 'RightLowerLeg', rig.pose.RightLowerLeg, 1, 0.3)
      } else {
        const defaultRot = new THREE.Quaternion(0, 0, 0, 1)
        this._rigRotation(vrm, 'LeftUpperLeg', defaultRot, 1, 0.3)
        this._rigRotation(vrm, 'LeftLowerLeg', defaultRot, 1, 0.3)
        this._rigRotation(vrm, 'RightUpperLeg', defaultRot, 1, 0.3)
        this._rigRotation(vrm, 'RightLowerLeg', defaultRot, 1, 0.3)
      }

      if (rig.leftHand) {
        if (enabledFK)
          this._rigRotation(vrm, 'LeftHand', {
            z: rig.pose.LeftHand.z,
            y: rig.leftHand.LeftWrist.y,
            x: rig.leftHand.LeftWrist.x,
          })
        this._rigRotation(
          vrm,
          'LeftRingProximal',
          rig.leftHand.LeftRingProximal,
        )
        this._rigRotation(
          vrm,
          'LeftRingIntermediate',
          rig.leftHand.LeftRingIntermediate,
        )
        this._rigRotation(vrm, 'LeftRingDistal', rig.leftHand.LeftRingDistal)
        this._rigRotation(
          vrm,
          'LeftIndexProximal',
          rig.leftHand.LeftIndexProximal,
        )
        this._rigRotation(
          vrm,
          'LeftIndexIntermediate',
          rig.leftHand.LeftIndexIntermediate,
        )
        this._rigRotation(vrm, 'LeftIndexDistal', rig.leftHand.LeftIndexDistal)
        this._rigRotation(
          vrm,
          'LeftMiddleProximal',
          rig.leftHand.LeftMiddleProximal,
        )
        this._rigRotation(
          vrm,
          'LeftMiddleIntermediate',
          rig.leftHand.LeftMiddleIntermediate,
        )
        this._rigRotation(
          vrm,
          'LeftMiddleDistal',
          rig.leftHand.LeftMiddleDistal,
        )
        this._rigRotation(
          vrm,
          'LeftThumbProximal',
          rig.leftHand.LeftThumbProximal,
        )
        this._rigRotation(
          vrm,
          'LeftThumbIntermediate',
          rig.leftHand.LeftThumbIntermediate,
        )
        // this._rigRotation(vrm, 'LeftThumbMetacarpal', this._rig.leftHand.LeftThumbProximal)
        // this._rigRotation(vrm, 'LeftThumbProximal', this._rig.leftHand.LeftThumbIntermediate)
        this._rigRotation(vrm, 'LeftThumbDistal', rig.leftHand.LeftThumbDistal)
        this._rigRotation(
          vrm,
          'LeftLittleProximal',
          rig.leftHand.LeftLittleProximal,
        )
        this._rigRotation(
          vrm,
          'LeftLittleIntermediate',
          rig.leftHand.LeftLittleIntermediate,
        )
        this._rigRotation(
          vrm,
          'LeftLittleDistal',
          rig.leftHand.LeftLittleDistal,
        )
      }
      if (rig.rightHand) {
        if (enabledFK)
          this._rigRotation(vrm, 'RightHand', {
            // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
            z: rig.pose.RightHand.z,
            y: rig.rightHand.RightWrist.y,
            x: rig.rightHand.RightWrist.x,
          })
        this._rigRotation(
          vrm,
          'RightRingProximal',
          rig.rightHand.RightRingProximal,
        )
        this._rigRotation(
          vrm,
          'RightRingIntermediate',
          rig.rightHand.RightRingIntermediate,
        )
        this._rigRotation(vrm, 'RightRingDistal', rig.rightHand.RightRingDistal)
        this._rigRotation(
          vrm,
          'RightIndexProximal',
          rig.rightHand.RightIndexProximal,
        )
        this._rigRotation(
          vrm,
          'RightIndexIntermediate',
          rig.rightHand.RightIndexIntermediate,
        )
        this._rigRotation(
          vrm,
          'RightIndexDistal',
          rig.rightHand.RightIndexDistal,
        )
        this._rigRotation(
          vrm,
          'RightMiddleProximal',
          rig.rightHand.RightMiddleProximal,
        )
        this._rigRotation(
          vrm,
          'RightMiddleIntermediate',
          rig.rightHand.RightMiddleIntermediate,
        )
        this._rigRotation(
          vrm,
          'RightMiddleDistal',
          rig.rightHand.RightMiddleDistal,
        )
        this._rigRotation(
          vrm,
          'RightThumbProximal',
          rig.rightHand.RightThumbProximal,
        )
        this._rigRotation(
          vrm,
          'RightThumbIntermediate',
          rig.rightHand.RightThumbIntermediate,
        )
        // this._rigRotation(vrm, 'RightThumbMetacarpal', this._rig.rightHand.RightThumbProximal)
        // this._rigRotation(vrm, 'RightThumbProximal', this._rig.rightHand.RightThumbIntermediate)
        this._rigRotation(
          vrm,
          'RightThumbDistal',
          rig.rightHand.RightThumbDistal,
        )
        this._rigRotation(
          vrm,
          'RightLittleProximal',
          rig.rightHand.RightLittleProximal,
        )
        this._rigRotation(
          vrm,
          'RightLittleIntermediate',
          rig.rightHand.RightLittleIntermediate,
        )
        this._rigRotation(
          vrm,
          'RightLittleDistal',
          rig.rightHand.RightLittleDistal,
        )
      }
    }
  }
}
