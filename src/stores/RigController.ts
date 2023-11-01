import * as Kalidokit from 'kalidokit'
import { VRM, VRMSchema } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { action, makeObservable, observable } from 'mobx'
import { trackingSettings } from './settings'

type HumanoidBoneNameKey = keyof typeof VRMSchema.HumanoidBoneName

export type VRMRigs = {
  face?: Kalidokit.TFace
  pose?: Kalidokit.TPose
  leftHand?: Kalidokit.THand<'Left'>
  rightHand?: Kalidokit.THand<'Right'>
}

class RigController {
  private lerp = Kalidokit.Vector.lerp
  private clamp = Kalidokit.Utils.clamp
  public rig: VRMRigs | null = null

  constructor() {
    makeObservable(this, {
      rig: observable.ref,
      setRig: action,
    })
  }
  setRig(results: any, videoEl: HTMLVideoElement) {
    const facelm = results.facelm
    const poselm = results.poselm
    const poselm3d = results.poselm3d
    const rightHandlm = results.rightHandlm
    const leftHandlm = results.leftHandlm
    const vrmRigs: VRMRigs = {
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
    rigController.rig = vrmRigs
  }

  private rigRotation = (
    vrm: VRM,
    name: HumanoidBoneNameKey,
    rotation = { x: 0, y: 0, z: 0 },
    dampener = 1,
    lerpAmount = 0.3,
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
    Part.quaternion.slerp(quaternion, lerpAmount) // interpolate
  }

  private rigPosition = (
    vrm: VRM,
    name: HumanoidBoneNameKey,
    position = { x: 0, y: 0, z: 0 },
    dampener = 1,
    lerpAmount = 0.3,
  ) => {
    if (!vrm.humanoid) return
    const Part = vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName[name])
    if (!Part) return
    let vector = new THREE.Vector3(
      position.x * dampener,
      position.y * dampener,
      position.z * dampener,
    )
    Part.position.lerp(vector, lerpAmount)
  }

  private oldLookTarget = new THREE.Euler()
  private rigFace(vrm: VRM, riggedFace: Kalidokit.TFace) {
    if (!vrm) return
    if (!riggedFace) return
    this.rigRotation(vrm, 'Neck', riggedFace.head, 0.7)

    const Blendshape = vrm.blendShapeProxy
    const PresetName = VRMSchema.BlendShapePresetName

    if (!Blendshape) return
    if (!PresetName) return
    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.
    riggedFace.eye.l = this.lerp(
      this.clamp(1 - riggedFace.eye.l, 0, 1),
      Blendshape.getValue(PresetName.Blink)!,
      0.5,
    )
    riggedFace.eye.r = this.lerp(
      this.clamp(1 - riggedFace.eye.r, 0, 1),
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
      this.lerp(
        riggedFace.mouth.shape.I,
        Blendshape.getValue(PresetName.I)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.A,
      this.lerp(
        riggedFace.mouth.shape.A,
        Blendshape.getValue(PresetName.A)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.E,
      this.lerp(
        riggedFace.mouth.shape.E,
        Blendshape.getValue(PresetName.E)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.O,
      this.lerp(
        riggedFace.mouth.shape.O,
        Blendshape.getValue(PresetName.O)!,
        0.5,
      ),
    )
    Blendshape.setValue(
      PresetName.U,
      this.lerp(
        riggedFace.mouth.shape.U,
        Blendshape.getValue(PresetName.U)!,
        0.5,
      ),
    )

    // PUPILS
    // interpolate pupil and keep a copy of the value
    let lookTarget = new THREE.Euler(
      this.lerp(this.oldLookTarget.x, riggedFace.pupil.y, 0.4),
      this.lerp(this.oldLookTarget.y, riggedFace.pupil.x, 0.4),
      0,
      'XYZ',
    )
    this.oldLookTarget.copy(lookTarget)
    vrm.lookAt?.applyer?.lookAt(lookTarget)
  }

  setVrmPose(vrm: VRM, rig: VRMRigs): void {
    if (!vrm) return
    if (!rig) return

    // Animate Face
    if (rig.face) {
      this.rigFace(vrm, rig.face)
    }

    // Animate Pose
    if (rig.pose) {
      this.rigRotation(vrm, 'Hips', rig.pose.Hips.rotation, 0.7)
      this.rigPosition(
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

      this.rigRotation(vrm, 'Chest', rig.pose.Spine, 0.25, 0.3)
      this.rigRotation(vrm, 'Spine', rig.pose.Spine, 0.45, 0.3)

      this.rigRotation(vrm, 'RightUpperArm', rig.pose.RightUpperArm, 1, 0.3)
      this.rigRotation(vrm, 'RightLowerArm', rig.pose.RightLowerArm, 1, 0.3)
      this.rigRotation(vrm, 'LeftUpperArm', rig.pose.LeftUpperArm, 1, 0.3)
      this.rigRotation(vrm, 'LeftLowerArm', rig.pose.LeftLowerArm, 1, 0.3)

      if (trackingSettings.enableLeg) {
        this.rigRotation(vrm, 'LeftUpperLeg', rig.pose.LeftUpperLeg, 1, 0.3)
        this.rigRotation(vrm, 'LeftLowerLeg', rig.pose.LeftLowerLeg, 1, 0.3)
        this.rigRotation(vrm, 'RightUpperLeg', rig.pose.RightUpperLeg, 1, 0.3)
        this.rigRotation(vrm, 'RightLowerLeg', rig.pose.RightLowerLeg, 1, 0.3)
      } else {
        const defaultRot = new THREE.Quaternion(0, 0, 0, 1)
        this.rigRotation(vrm, 'LeftUpperLeg', defaultRot, 1, 0.3)
        this.rigRotation(vrm, 'LeftLowerLeg', defaultRot, 1, 0.3)
        this.rigRotation(vrm, 'RightUpperLeg', defaultRot, 1, 0.3)
        this.rigRotation(vrm, 'RightLowerLeg', defaultRot, 1, 0.3)
      }

      if (rig.leftHand) {
        this.rigRotation(vrm, 'LeftHand', {
          z: rig.pose.LeftHand.z,
          y: rig.leftHand.LeftWrist.y,
          x: rig.leftHand.LeftWrist.x,
        })
        this.rigRotation(vrm, 'LeftRingProximal', rig.leftHand.LeftRingProximal)
        this.rigRotation(
          vrm,
          'LeftRingIntermediate',
          rig.leftHand.LeftRingIntermediate,
        )
        this.rigRotation(vrm, 'LeftRingDistal', rig.leftHand.LeftRingDistal)
        this.rigRotation(
          vrm,
          'LeftIndexProximal',
          rig.leftHand.LeftIndexProximal,
        )
        this.rigRotation(
          vrm,
          'LeftIndexIntermediate',
          rig.leftHand.LeftIndexIntermediate,
        )
        this.rigRotation(vrm, 'LeftIndexDistal', rig.leftHand.LeftIndexDistal)
        this.rigRotation(
          vrm,
          'LeftMiddleProximal',
          rig.leftHand.LeftMiddleProximal,
        )
        this.rigRotation(
          vrm,
          'LeftMiddleIntermediate',
          rig.leftHand.LeftMiddleIntermediate,
        )
        this.rigRotation(vrm, 'LeftMiddleDistal', rig.leftHand.LeftMiddleDistal)
        this.rigRotation(
          vrm,
          'LeftThumbProximal',
          rig.leftHand.LeftThumbProximal,
        )
        this.rigRotation(
          vrm,
          'LeftThumbIntermediate',
          rig.leftHand.LeftThumbIntermediate,
        )
        // this.rigRotation(vrm, 'LeftThumbMetacarpal', this.rig.leftHand.LeftThumbProximal)
        // this.rigRotation(vrm, 'LeftThumbProximal', this.rig.leftHand.LeftThumbIntermediate)
        this.rigRotation(vrm, 'LeftThumbDistal', rig.leftHand.LeftThumbDistal)
        this.rigRotation(
          vrm,
          'LeftLittleProximal',
          rig.leftHand.LeftLittleProximal,
        )
        this.rigRotation(
          vrm,
          'LeftLittleIntermediate',
          rig.leftHand.LeftLittleIntermediate,
        )
        this.rigRotation(vrm, 'LeftLittleDistal', rig.leftHand.LeftLittleDistal)
      }
      if (rig.rightHand) {
        this.rigRotation(vrm, 'RightHand', {
          // Combine Z axis from pose hand and X/Y axis from hand wrist rotation
          z: rig.pose.RightHand.z,
          y: rig.rightHand.RightWrist.y,
          x: rig.rightHand.RightWrist.x,
        })
        this.rigRotation(
          vrm,
          'RightRingProximal',
          rig.rightHand.RightRingProximal,
        )
        this.rigRotation(
          vrm,
          'RightRingIntermediate',
          rig.rightHand.RightRingIntermediate,
        )
        this.rigRotation(vrm, 'RightRingDistal', rig.rightHand.RightRingDistal)
        this.rigRotation(
          vrm,
          'RightIndexProximal',
          rig.rightHand.RightIndexProximal,
        )
        this.rigRotation(
          vrm,
          'RightIndexIntermediate',
          rig.rightHand.RightIndexIntermediate,
        )
        this.rigRotation(
          vrm,
          'RightIndexDistal',
          rig.rightHand.RightIndexDistal,
        )
        this.rigRotation(
          vrm,
          'RightMiddleProximal',
          rig.rightHand.RightMiddleProximal,
        )
        this.rigRotation(
          vrm,
          'RightMiddleIntermediate',
          rig.rightHand.RightMiddleIntermediate,
        )
        this.rigRotation(
          vrm,
          'RightMiddleDistal',
          rig.rightHand.RightMiddleDistal,
        )
        this.rigRotation(
          vrm,
          'RightThumbProximal',
          rig.rightHand.RightThumbProximal,
        )
        this.rigRotation(
          vrm,
          'RightThumbIntermediate',
          rig.rightHand.RightThumbIntermediate,
        )
        // this.rigRotation(vrm, 'RightThumbMetacarpal', this.rig.rightHand.RightThumbProximal)
        // this.rigRotation(vrm, 'RightThumbProximal', this.rig.rightHand.RightThumbIntermediate)
        this.rigRotation(
          vrm,
          'RightThumbDistal',
          rig.rightHand.RightThumbDistal,
        )
        this.rigRotation(
          vrm,
          'RightLittleProximal',
          rig.rightHand.RightLittleProximal,
        )
        this.rigRotation(
          vrm,
          'RightLittleIntermediate',
          rig.rightHand.RightLittleIntermediate,
        )
        this.rigRotation(
          vrm,
          'RightLittleDistal',
          rig.rightHand.RightLittleDistal,
        )
      }
    }
  }
}

export const rigController = new RigController()
