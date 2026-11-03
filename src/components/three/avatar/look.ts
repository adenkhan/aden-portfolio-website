import { AmbientLight, DirectionalLight, type Object3D, type PerspectiveCamera, Vector3 } from "three";
import type { VRM } from "@pixiv/three-vrm";

/**
 * The avatar's LOOK RULE (r9, docs/ASSETS.md): she must look as she does in VRoid Studio. Her MToon
 * materials are never touched; she is lit like VRoid's viewport, one white key light from the front
 * and above plus a white ambient fill, and no coloured light ever falls on her by default. Shared by
 * the live site and scripts/render-avatar.mjs, so the poster and the live model match exactly.
 */
// Tuned with `node scripts/render-avatar.mjs tune` until her cheek matched VRoid's own thumbnail (stored
// in the VRM): rgb(244 212 187) against rgb(244 212 185), docs/screens/round4/look-compare.png.
export const LOOK = {
  key: { color: 0xffffff, intensity: 2.3, position: [0.35, 1.6, 2.2] as const },
  ambient: { color: 0xffffff, intensity: 0.8 },
};

/** Adds the VRoid-style lights to a group (the avatar's own rig, so they light only what is in it). */
export function applyLook(target: Object3D): { key: DirectionalLight; ambient: AmbientLight } {
  const key = new DirectionalLight(LOOK.key.color, LOOK.key.intensity);
  key.position.set(...LOOK.key.position);
  const ambient = new AmbientLight(LOOK.ambient.color, LOOK.ambient.intensity);
  target.add(key, ambient);
  return { key, ambient };
}

/** Arms down and relaxed (not a T-pose), fingers softly curled. Normalized humanoid bones, VRM 1.0. */
export const RELAXED: Record<string, [number, number, number]> = {
  leftUpperArm: [0, 0, -1.22],
  rightUpperArm: [0, 0, 1.22],
  leftLowerArm: [0, -0.18, 0],
  rightLowerArm: [0, 0.18, 0],
  leftHand: [0, 0, -0.08],
  rightHand: [0, 0, 0.08],
  spine: [0.02, 0, 0],
  neck: [-0.02, 0, 0],
};

const FINGERS = ["Index", "Middle", "Ring", "Little"];
const SEGMENTS = ["Proximal", "Intermediate", "Distal"];

export function relaxedPose(vrm: VRM, curl = 0.22): void {
  const h = vrm.humanoid;
  for (const [bone, [x, y, z]] of Object.entries(RELAXED))
    h.getNormalizedBoneNode(bone as never)?.rotation.set(x, y, z);
  for (const side of ["left", "right"] as const)
    for (const f of FINGERS)
      for (const s of SEGMENTS) {
        const node = h.getNormalizedBoneNode(`${side}${f}${s}` as never);
        // Fingers curl about their local Z (toward the palm): left negative, right positive.
        if (node) node.rotation.z = (side === "left" ? -1 : 1) * curl * (s === "Proximal" ? 0.8 : 1.1);
      }
  vrm.humanoid.update();
}

const v = new Vector3();
/** World position of a humanoid bone (raw), e.g. the head or a hand. */
export function boneWorld(vrm: VRM, bone: string, out = new Vector3()): Vector3 {
  const node = vrm.humanoid.getRawBoneNode(bone as never);
  return node ? node.getWorldPosition(out) : out.set(0, 0, 0);
}

export type Shot = "face" | "poster" | "card" | `og-${string}`;

/**
 * Camera framing, shared by the poster render and the live hero so the swap is invisible: the same
 * field of view (20°), the same distance and the same aim for the "poster"/"card" shot.
 */
export function frame(camera: PerspectiveCamera, vrm: VRM, shot: Shot): void {
  vrm.scene.updateMatrixWorld(true);
  const head = boneWorld(vrm, "head", v.clone());
  camera.fov = 20;
  if (shot === "face") {
    camera.position.set(head.x, head.y + 0.03, head.z + 1.05);
    camera.lookAt(head.x, head.y + 0.03, head.z);
  } else if (shot === "poster" || shot === "card") {
    // Head down to the hips, head in the upper third.
    // At 20° and 2.8 m the frame is ±0.49 m tall: from just above her head to her hips.
    const aimY = head.y - 0.28;
    camera.position.set(head.x, aimY + 0.05, head.z + 2.8);
    camera.lookAt(head.x, aimY, head.z);
  } else {
    // Open Graph: wide; she stands in the right third, head and shoulders.
    const aimY = head.y - 0.22;
    camera.position.set(head.x - 0.42, aimY + 0.04, head.z + 2.6);
    camera.lookAt(head.x - 0.42, aimY, head.z);
  }
  camera.updateProjectionMatrix();
}
