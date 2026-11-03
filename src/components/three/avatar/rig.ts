import { type AnimationAction, type AnimationClip, AnimationMixer, LoopOnce, Object3D, Vector3 } from "three";
import type { VRM } from "@pixiv/three-vrm";
import { gsap } from "@/lib/motion/eases";
import { RELAXED } from "./look";

type Rot = [number, number, number];
export type PoseName = "idle" | "wave" | "point" | "castReady" | "castCharge" | "castRelease";
export type ExpressionName = "happy" | "surprised" | "angry" | "relaxed";

/**
 * The pose library (r9, docs/MOTION.md §24): keyframed rotations of normalized humanoid bones (VRM 1.0,
 * radians). Each pose lists only what differs from relaxed; the rig blends them by weight with GSAP.
 */
// Axes (VRM 1.0 normalized, she faces +Z): the left arm points +X, so a negative Y turn brings it
// forward and a negative Z turn lowers it; the right arm mirrors both. A hand's X turn rolls the palm
// (−π/2 faces the palms toward each other, −π turns them up); a Z turn bends the wrist up.
const POSES: Record<PoseName, Partial<Record<string, Rot>>> = {
  idle: {},
  // Right arm raised to the side, forearm up; the hand's side-to-side sway is added procedurally.
  wave: {
    rightUpperArm: [0, 0.25, -0.25],
    rightLowerArm: [0, 0, -1.55],
    rightHand: [-1.4, 0, 0],
    neck: [0, 0, -0.05],
  },
  // Right arm out toward a call-to-action (her right is the screen's left), index extended.
  point: {
    rightUpperArm: [0, 0.75, 0.12],
    rightLowerArm: [0, 0.1, 0],
    rightHand: [-0.6, 0, -0.1],
    spine: [0, 0.12, 0],
  },
  // Both arms forward at chest height, palms up.
  castReady: {
    leftUpperArm: [0, -1.05, -0.3],
    rightUpperArm: [0, 1.05, 0.3],
    leftLowerArm: [0, -0.5, 0],
    rightLowerArm: [0, 0.5, 0],
    leftHand: [-2.4, 0, 0],
    rightHand: [-2.4, 0, 0],
    spine: [0.04, 0, 0],
  },
  // Hands drawing toward each other in front of the chest, palms facing.
  castCharge: {
    leftUpperArm: [0, -0.95, -0.2],
    rightUpperArm: [0, 0.95, 0.2],
    leftLowerArm: [0, -1.25, 0],
    rightLowerArm: [0, 1.25, 0],
    leftHand: [-1.57, 0, 0],
    rightHand: [-1.57, 0, 0],
    spine: [0.08, 0, 0],
    neck: [0.08, 0, 0],
  },
  // Palms thrust forward, fingers up.
  castRelease: {
    leftUpperArm: [0, -1.4, -0.05],
    rightUpperArm: [0, 1.4, 0.05],
    leftLowerArm: [0, -0.1, 0],
    rightLowerArm: [0, 0.1, 0],
    leftHand: [0, 0, 1.3],
    rightHand: [0, 0, -1.3],
    spine: [-0.05, 0, 0],
  },
};

/** Iterate these, never Object.keys(weights): GSAP adds its own _gsap key to a tweened object. */
const POSE_NAMES = Object.keys(POSES) as PoseName[];

const BONES = new Set(
  Object.values(POSES)
    .flatMap((p) => Object.keys(p))
    .concat(Object.keys(RELAXED)),
);
const FINGERS = ["Index", "Middle", "Ring", "Little", "Thumb"];
const SEGMENTS = ["Proximal", "Intermediate", "Distal", "Metacarpal"];

interface JointBase {
  settings: { gravityDir: Vector3; gravityPower: number };
  dir: Vector3;
  power: number;
}

/**
 * Procedural animation for the avatar (r9). Everything is a pure function of time and inputs, applied
 * to normalized bones every frame, so scrubbing (the Convergence on scroll) can drive poses backwards.
 */
export class Rig {
  readonly weights: Record<PoseName, number> = {
    idle: 1,
    wave: 0,
    point: 0,
    castReady: 0,
    castCharge: 0,
    castRelease: 0,
  };
  /** Pose weights set by a scrubbed timeline override the GSAP blend while not null. */
  scrub: Partial<Record<PoseName, number>> | null = null;
  private readonly expr: Record<ExpressionName, { value: number; target: number }> = {
    happy: { value: 0, target: 0 },
    surprised: { value: 0, target: 0 },
    angry: { value: 0, target: 0 },
    relaxed: { value: 0, target: 0 },
  };
  /** An expression a timeline drives directly (the cast's focused look), added on top. */
  readonly drive: Partial<Record<ExpressionName, number>> = {};
  readonly lookTarget = new Object3D();
  private time = 0;
  private blinkAt = 2;
  private blink = 0;
  private doubleBlink = false;
  private readonly joints: JointBase[] = [];
  private readonly wind = new Vector3();
  private readonly lean = new Vector3();
  /** Smoothed page scroll velocity, fed into the spring bones. */
  private vel = 0;
  private readonly available: Set<string>;
  /** Optional .vrma clips by pose name, played in an AnimationMixer in place of the procedural pose. */
  private mixer: AnimationMixer | null = null;
  private readonly actions: Partial<Record<PoseName, AnimationAction>> = {};

  constructor(private readonly vrm: VRM) {
    vrm.scene.add(this.lookTarget);
    if (vrm.lookAt) vrm.lookAt.target = this.lookTarget;
    this.available = new Set(Object.keys(vrm.expressionManager?.expressionMap ?? {}));
    for (const joint of vrm.springBoneManager?.joints ?? []) {
      const settings = joint.settings as JointBase["settings"];
      this.joints.push({ settings, dir: settings.gravityDir.clone(), power: settings.gravityPower });
    }
  }

  /** Names of the expressions the model has (checked against the ones the site uses). */
  get expressions(): string[] {
    return [...this.available];
  }

  /** Adds .vrma clips (optional upgrade slots). Poses with a clip crossfade it instead. */
  useClips(clips: Partial<Record<PoseName, AnimationClip>>): void {
    this.mixer ??= new AnimationMixer(this.vrm.scene);
    for (const [name, clip] of Object.entries(clips) as [PoseName, AnimationClip][]) {
      const action = this.mixer.clipAction(clip);
      if (name !== "idle") {
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
      }
      action.setEffectiveWeight(0);
      this.actions[name] = action;
    }
  }

  /** Blends to a pose over `duration` seconds (crossfading its clip when it has one). */
  pose(name: PoseName, duration = 0.6): gsap.core.Tween {
    const clip = this.actions[name];
    for (const [other, action] of Object.entries(this.actions) as [PoseName, AnimationAction][])
      if (other !== name && action.isRunning()) action.fadeOut(duration);
    if (clip) clip.reset().setEffectiveWeight(1).fadeIn(duration).play();
    // With a clip the procedural weights rest at idle; the clip moves the bones it animates.
    const to = Object.fromEntries(POSE_NAMES.map((k) => [k, k === (clip ? "idle" : name) ? 1 : 0]));
    return gsap.to(this.weights, { ...to, duration, ease: "power2.inOut", overwrite: true });
  }

  /** Eases an expression up to `peak`, holds, then back to neutral. Open-mouth ones stay brief. */
  express(name: ExpressionName, peak = 0.7, hold = 0.6): void {
    const e = this.expr[name];
    e.target = peak;
    gsap.delayedCall(hold, () => (e.target = 0));
  }

  /**
   * One frame. `scroll` is the page's scroll velocity (Lenis), `wind` a radial vortex strength for the
   * Convergence, `look` a point to look at in the avatar's space (null: drift).
   */
  update(dt: number, opts: { scroll: number; wind: number; look: Vector3 | null }): void {
    this.time += dt;
    const t = this.time;
    const h = this.vrm.humanoid;
    const w = this.scrub ? fill(this.scrub) : this.weights;

    // Poses: relaxed plus each pose's offset from relaxed, by weight.
    for (const bone of BONES) {
      const node = h.getNormalizedBoneNode(bone as never);
      if (!node) continue;
      const base = RELAXED[bone] ?? [0, 0, 0];
      const r: Rot = [...base];
      for (const name of POSE_NAMES) {
        const weight = w[name];
        const p = POSES[name][bone];
        if (!p || weight <= 0) continue;
        for (let i = 0; i < 3; i++) r[i] += (p[i] - base[i]) * weight;
      }
      node.rotation.set(r[0], r[1], r[2]);
    }

    // Idle life: breathing on spine and chest, a slow weight shift, small head tilts.
    const breath = Math.sin(t * 1.6) * 0.5 + 0.5;
    h.getNormalizedBoneNode("spine")!.rotation.x += breath * 0.015;
    const chest = h.getNormalizedBoneNode("chest");
    if (chest) chest.rotation.x = breath * 0.025;
    const hips = h.getNormalizedBoneNode("hips");
    if (hips) hips.rotation.z = Math.sin(t * 0.35) * 0.025;
    const neck = h.getNormalizedBoneNode("neck")!;
    neck.rotation.z += Math.sin(t * 0.27 + 1) * 0.03;
    // Wave: the raised hand sways side to side.
    if (w.wave > 0) h.getNormalizedBoneNode("rightLowerArm")!.rotation.z += Math.sin(t * 9) * 0.35 * w.wave;

    // Fingers: a soft curl that breathes a little; open for the release, extended index for point.
    const open = w.castRelease;
    for (const side of ["left", "right"] as const)
      for (const f of FINGERS)
        for (const s of SEGMENTS) {
          const node = h.getNormalizedBoneNode(`${side}${f}${s}` as never);
          if (!node) continue;
          let curl = (0.22 + breath * 0.05) * (1 - open * 0.9);
          if (side === "right" && f === "Index") curl *= 1 - w.point;
          else if (side === "right") curl += w.point * 0.9;
          if (f === "Thumb") {
            node.rotation.y = (side === "left" ? 1 : -1) * curl * 0.5;
            continue;
          }
          node.rotation.z = (side === "left" ? -1 : 1) * curl * (s === "Proximal" ? 0.8 : 1.1);
        }

    // Blinks every 2–6 s, sometimes twice.
    this.blinkAt -= dt;
    if (this.blinkAt <= 0) {
      this.blink = 1;
      this.doubleBlink = !this.doubleBlink && Math.random() < 0.2;
      this.blinkAt = this.doubleBlink ? 0.22 : 2 + Math.random() * 4;
    }
    this.blink = Math.max(0, this.blink - dt * 8);
    const em = this.vrm.expressionManager;
    if (em) {
      em.setValue("blink", Math.sin(this.blink * Math.PI));
      for (const [name, e] of Object.entries(this.expr) as [ExpressionName, (typeof this.expr)["happy"]][]) {
        e.value += (e.target - e.value) * Math.min(1, dt * 6);
        if (this.available.has(name)) em.setValue(name, Math.min(1, e.value + (this.drive[name] ?? 0)));
      }
    }

    // Eyes and head: follow the given point, or drift gently.
    const head = h.getRawBoneNode("head");
    if (head) {
      head.getWorldPosition(this.lookTarget.position);
      this.vrm.scene.worldToLocal(this.lookTarget.position);
      if (opts.look) this.lookTarget.position.add(opts.look);
      else this.lookTarget.position.add(new Vector3(Math.sin(t * 0.4) * 0.3, Math.sin(t * 0.23) * 0.12, 1.2));
    }

    // Physics that reacts to the site: scroll speed tilts the hair and skirt's gravity and adds force,
    // and the Convergence adds a radial vortex wind around her.
    this.vel += (opts.scroll - this.vel) * Math.min(1, dt * 6);
    const push = Math.max(-1, Math.min(1, this.vel / 40));
    this.wind.set(Math.cos(t * 6), 0, Math.sin(t * 6)).multiplyScalar(opts.wind);
    for (const j of this.joints) {
      this.lean.set(0, push * 0.9, -Math.abs(push) * 0.4);
      j.settings.gravityDir.copy(j.dir).add(this.lean).add(this.wind).normalize();
      j.settings.gravityPower = j.power + Math.abs(push) * 0.6 + opts.wind * 1.2;
    }

    // Clips last, over the procedural pose; scrubbed casts drive clip weights directly.
    if (this.mixer) {
      if (this.scrub)
        for (const name of POSE_NAMES) {
          const action = this.actions[name];
          if (!action) continue;
          const weight = this.scrub[name] ?? 0;
          if (weight > 0 && !action.isRunning()) action.play();
          action.setEffectiveWeight(weight);
        }
      this.mixer.update(dt);
    }

    this.vrm.update(dt);
  }
}

const fill = (w: Partial<Record<PoseName, number>>): Record<PoseName, number> => ({
  idle: 0,
  wave: 0,
  point: 0,
  castReady: 0,
  castCharge: 0,
  castRelease: 0,
  ...w,
});
