import { Effect } from "postprocessing";
import { Uniform, Vector2, Vector3 } from "three";

/**
 * Convergence space bend (r7, docs/MOTION.md §16): a screen-space lens around the vortex midpoint
 * that strengthens as the orbs close in, a ripple ring after the collapse, and the strike flash.
 * Not used on the low tier (phones): there the flash comes from the bloom spike instead.
 */
const fragment = /* glsl */ `
uniform vec2 uCentre;
uniform float uStrength;
uniform float uRipple;
uniform float uRippleAmp;
uniform float uAspect;
uniform vec3 uFlash;

void mainUv(inout vec2 uv) {
  vec2 d = uv - uCentre;
  d.x *= uAspect;
  float r = length(d);
  vec2 dir = r > 0.0001 ? d / r : vec2(0.0);
  // Lens: pull toward the centre, strongest near it, fading out by a third of the screen.
  float pull = uStrength * smoothstep(0.35, 0.0, r) * smoothstep(0.0, 0.04, r);
  // Ripple: a thin ring that pushes outward as it travels.
  float ring = uRippleAmp * exp(-pow((r - uRipple) * 18.0, 2.0));
  vec2 offset = dir * (pull * 0.05 - ring);
  offset.x /= uAspect;
  uv -= offset;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  outputColor = vec4(inputColor.rgb + uFlash, inputColor.a);
}
`;

export class LensEffect extends Effect {
  constructor() {
    super("LensEffect", fragment, {
      uniforms: new Map<string, Uniform>([
        ["uCentre", new Uniform(new Vector2(0.5, 0.5))],
        ["uStrength", new Uniform(0)],
        ["uRipple", new Uniform(0)],
        ["uRippleAmp", new Uniform(0)],
        ["uAspect", new Uniform(1)],
        ["uFlash", new Uniform(new Vector3())],
      ]),
    });
  }

  set(values: {
    centre?: Vector2;
    strength?: number;
    ripple?: number;
    rippleAmp?: number;
    aspect?: number;
    flash?: Vector3;
  }) {
    const u = this.uniforms;
    if (values.centre) u.get("uCentre")!.value.copy(values.centre);
    if (values.strength !== undefined) u.get("uStrength")!.value = values.strength;
    if (values.ripple !== undefined) u.get("uRipple")!.value = values.ripple;
    if (values.rippleAmp !== undefined) u.get("uRippleAmp")!.value = values.rippleAmp;
    if (values.aspect !== undefined) u.get("uAspect")!.value = values.aspect;
    if (values.flash) u.get("uFlash")!.value.copy(values.flash);
  }
}
