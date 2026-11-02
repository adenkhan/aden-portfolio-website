/**
 * Quality tiers for the persistent world (docs/MOTION.md §13). Tiers lower quality, never remove an
 * effect: every tier draws the orbs, trails, field, path, constellation and shockwave.
 */
export type QualityTier = "high" | "medium" | "low";

export interface QualitySettings {
  tier: QualityTier;
  /** Upper bound for the renderer pixel ratio. */
  dpr: number;
  /** Trail particles per orb. */
  trail: number;
  /** Work field particles. */
  field: number;
  /** Particles per case-study formation. */
  formation: number;
  /** Noise octaves in the orb shader (1–3). */
  octaves: number;
  /** Sphere subdivision for the orbs. */
  orbDetail: number;
  bloomScale: number;
  aberration: boolean;
  /** Render at 30 fps while nothing is being scrolled or pointed at. */
  idleCap: boolean;
}

const SETTINGS: Record<QualityTier, Omit<QualitySettings, "tier">> = {
  high: {
    dpr: 2,
    trail: 1200,
    field: 6000,
    formation: 480,
    octaves: 3,
    orbDetail: 48,
    bloomScale: 1,
    aberration: true,
    idleCap: false,
  },
  medium: {
    dpr: 1.5,
    trail: 800,
    field: 4000,
    formation: 320,
    octaves: 2,
    orbDetail: 40,
    bloomScale: 0.75,
    aberration: true,
    idleCap: false,
  },
  low: {
    dpr: 1,
    trail: 600,
    field: 3000,
    formation: 240,
    octaves: 1,
    orbDetail: 32,
    bloomScale: 0.5,
    aberration: false,
    idleCap: true,
  },
};

export const TIERS: QualityTier[] = ["high", "medium", "low"];

export function settingsFor(tier: QualityTier): QualitySettings {
  return { tier, ...SETTINGS[tier] };
}

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
}

/**
 * First guess from the device; the frame governor corrects it within two seconds.
 * Phones (coarse pointer, small screen) start low; tablets and laptops medium; desktops with a
 * discrete or high-end GPU high. Software rendering is always low.
 */
export function detectTier(gl: WebGLRenderingContext | WebGL2RenderingContext): QualityTier {
  const forced = new URLSearchParams(location.search).get("quality");
  if (forced === "high" || forced === "medium" || forced === "low") return forced;

  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const gpu = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  if (/swiftshader|llvmpipe|software|basic render/i.test(gpu)) return "low";

  const coarse = matchMedia("(pointer: coarse)").matches;
  const small = Math.min(screen.width, screen.height) < 768;
  if (coarse && small) return "low";

  const nav = navigator as NavigatorHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const strongGpu = /nvidia|geforce|rtx|quadro|radeon (rx|pro)|apple m\d (pro|max|ultra)/i.test(gpu);
  if (!coarse && strongGpu && cores >= 8 && memory >= 8) return "high";
  return "medium";
}

/**
 * Measures rendered frames and steps the tier down when they drop: under 50 fps on high, under
 * 38 fps on medium, averaged over two seconds. It never steps up, so quality cannot oscillate.
 */
export class FrameGovernor {
  private frames = 0;
  private start = 0;
  constructor(
    private tier: QualityTier,
    private onStepDown: (tier: QualityTier) => void,
  ) {}

  /** Call once per rendered frame with the timestamp. `capped` frames (30 fps idle) are not measured. */
  sample(now: number, capped: boolean): void {
    if (capped || this.tier === "low") {
      this.frames = 0;
      this.start = now;
      return;
    }
    if (!this.start) this.start = now;
    this.frames++;
    const elapsed = now - this.start;
    if (elapsed < 2000) return;
    const fps = (this.frames * 1000) / elapsed;
    this.frames = 0;
    this.start = now;
    const floor = this.tier === "high" ? 50 : 38;
    if (fps < floor) {
      this.tier = TIERS[TIERS.indexOf(this.tier) + 1];
      this.onStepDown(this.tier);
    }
  }

  /** Restart measuring, e.g. after the tab was hidden (the gap is not a slow frame). */
  reset(): void {
    this.frames = 0;
    this.start = 0;
  }
}
