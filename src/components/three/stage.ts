/** Shared animation state for both intro renderers. GSAP tweens this object; a stage draws it. */
export interface IntroState {
  redX: number;
  redY: number;
  blueX: number;
  blueY: number;
  orbScale: number;
  orbOpacity: number;
  coreScale: number;
  coreOpacity: number;
  ringScale: number;
  ringOpacity: number;
  /** 0 → 1: burst particles travel outward (3D only). */
  burst: number;
  /** Bloom strength 0 → 1 (3D only). */
  bloom: number;
  /** Chromatic aberration offset (3D desktop only). */
  aberration: number;
}

export interface IntroStage {
  mode: "3d" | "2d";
  /** Diameter of one orb in CSS pixels at scale 1. */
  orbSize: number;
  render(state: IntroState): void;
  dispose(): void;
}

export interface StageGeometry {
  /** Collision point in viewport pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
  mobile: boolean;
}

export const LANE = { creative: "#ff4d6a", data: "#3db0ff", growth: "#a77cff" } as const;

export function orbSizeFor(g: StageGeometry): number {
  return Math.max(110, Math.min(260, Math.min(g.width, g.height) * 0.3));
}
