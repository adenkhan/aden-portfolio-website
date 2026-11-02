import { gsap } from "@/lib/motion/eases";

/**
 * Convergence (r7, docs/MOTION.md §16): the red and blue orbs spiral into each other on a decaying,
 * precessing double helix, lightning arcs between them, space bends, and they collapse into purple.
 * One GSAP timeline over a plain state object, so the same motion can autoplay (the Home intro),
 * be scrubbed by scroll (the CREATIVE · DATA · GROWTH section) or run in reverse.
 */
export interface ConvergenceState {
  /** Orbit angle (radians): about three accelerating turns. */
  theta: number;
  /** Orbit radius as a share of the starting radius. */
  radius: number;
  /** Orbit-plane precession (radians), tilting the plane in depth. */
  phi: number;
  /** Second-axis wobble of the orbit plane (radians). */
  psi: number;
  summon: number;
  /** Shell displacement and plasma, growing with proximity. */
  charge: number;
  bolts: number;
  distortion: number;
  shake: number;
  dolly: number;
  merge: number;
  flashWhite: number;
  flashPurple: number;
  ring: number;
  ripple: number;
  aberration: number;
  pulse: number;
  /** The purple sphere rushing toward the camera. */
  surge: number;
  /** The radial tear that reveals the hero (intro only). */
  tear: number;
}

export const CONVERGENCE_DURATION = 3.5;
/** Scroll scrubs up to here: the collapse and the purple pulse, not the surge and tear. */
export const SCROLL_END = 3.25;

export function initialState(): ConvergenceState {
  return {
    theta: 0,
    radius: 1,
    phi: 0.35,
    psi: 0,
    summon: 0,
    charge: 0,
    bolts: 0,
    distortion: 0,
    shake: 0,
    dolly: 0,
    merge: 0,
    flashWhite: 0,
    flashPurple: 0,
    ring: 0,
    ripple: 0,
    aberration: 0,
    pulse: 0,
    surge: 0,
    tear: 0,
  };
}

/** The five beats as one paused timeline (3.5 s). */
export function buildTimeline(state: ConvergenceState): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  const TURN = Math.PI * 2;
  tl
    // 1. Summon (0–0.5): the orbs ignite left and right with a crackle of small sparks.
    .fromTo(state, { summon: 0 }, { summon: 1, duration: 0.5, ease: "power2.out" }, 0)
    .fromTo(
      state,
      { bolts: 0 },
      { bolts: 0.18, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" },
      0.05,
    )
    // 2. Spiral (0.5–2.2): three turns, each faster; the radius falls ease-in; the plane precesses.
    .fromTo(state, { theta: 0 }, { theta: 3 * TURN, duration: 1.7, ease: "power2.in" }, 0.5)
    .fromTo(state, { radius: 1 }, { radius: 0.3, duration: 1.7, ease: "power2.in" }, 0.5)
    .fromTo(state, { phi: 0.35 }, { phi: 0.35 + 2.4, duration: 2.3, ease: "sine.inOut" }, 0.5)
    .fromTo(
      state,
      { psi: -0.25 },
      { psi: 0.45, duration: 1.15, ease: "sine.inOut", yoyo: true, repeat: 1 },
      0.5,
    )
    .fromTo(state, { charge: 0 }, { charge: 0.6, duration: 1.7, ease: "power1.in" }, 0.5)
    .to(state, { bolts: 0.45, duration: 1.2, ease: "power1.in" }, 1.0)
    .fromTo(state, { distortion: 0 }, { distortion: 0.45, duration: 1.7, ease: "power2.in" }, 0.5)
    // 3. Charge (2.2–2.8): nearly touching; lightning everywhere; distortion peaks; shake and dolly-in.
    .to(state, { theta: `+=${TURN * 1.25}`, radius: 0.07, duration: 0.6, ease: "power1.in" }, 2.2)
    .to(state, { charge: 1, bolts: 1, distortion: 1, duration: 0.6, ease: "power2.in" }, 2.2)
    .fromTo(state, { shake: 0 }, { shake: 1, duration: 0.6, ease: "power2.in" }, 2.2)
    .fromTo(state, { dolly: 0 }, { dolly: 1, duration: 0.9, ease: "power1.inOut" }, 2.2)
    // 4. Collapse (2.8–3.1): merge; white flash, then purple; shockwave ring and ripple; aberration spike.
    .to(state, { radius: 0, duration: 0.08, ease: "power3.in" }, 2.8)
    .fromTo(state, { merge: 0 }, { merge: 1, duration: 0.1, ease: "power2.out" }, 2.8)
    .fromTo(state, { flashWhite: 0 }, { flashWhite: 1, duration: 0.03 }, 2.8)
    .to(state, { flashWhite: 0, duration: 0.15, ease: "power2.out" }, 2.83)
    .fromTo(state, { flashPurple: 0 }, { flashPurple: 1, duration: 0.06 }, 2.86)
    .to(state, { flashPurple: 0, duration: 0.2, ease: "power2.out" }, 2.92)
    .fromTo(state, { ring: 0 }, { ring: 1, duration: 0.6, ease: "power3.out" }, 2.82)
    .fromTo(state, { ripple: 0 }, { ripple: 1, duration: 0.55, ease: "power2.out" }, 2.82)
    .fromTo(state, { aberration: 0 }, { aberration: 1, duration: 0.04 }, 2.8)
    .to(state, { aberration: 0, duration: 0.35, ease: "power2.out" }, 2.84)
    .to(state, { bolts: 0, distortion: 0, shake: 0, charge: 0, duration: 0.25, ease: "power2.out" }, 2.85)
    // 5. Release (3.1–3.5): the purple sphere pulses, surges toward the camera and tears the screen open.
    .fromTo(
      state,
      { pulse: 0 },
      { pulse: 1, duration: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut" },
      3.05,
    )
    .fromTo(state, { surge: 0 }, { surge: 1, duration: 0.25, ease: "power3.in" }, 3.25)
    .fromTo(state, { tear: 0 }, { tear: 1, duration: 0.25, ease: "power2.in" }, 3.25);
  tl.addLabel("reveal", 3.25);
  return tl;
}
