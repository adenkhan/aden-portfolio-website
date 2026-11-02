/** GLSL for the persistent world (docs/MOTION.md §13). Original shaders; no third-party assets. */

/** 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT). */
export const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

/** Orb: noise-displaced sphere with a fresnel rim. OCTAVES is set per quality tier. */
export const ORB_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAmp;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${NOISE}
void main() {
  vec3 q = normal * 1.6 + vec3(uTime * 0.35);
  float n = snoise(q);
  #if OCTAVES > 1
  n += 0.5 * snoise(q * 2.0 + vec3(uTime * 0.2));
  #endif
  #if OCTAVES > 2
  n += 0.25 * snoise(q * 4.0 - vec3(uTime * 0.3));
  #endif
  vNoise = n;
  vec4 mv = modelViewMatrix * vec4(position + normal * n * uAmp, 1.0);
  vView = normalize(-mv.xyz);
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}
`;

export const ORB_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uOpacity;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
  float rim = pow(1.0 - facing, 2.4);
  vec3 core = uColor * (0.28 + 0.22 * vNoise) * facing;
  vec3 colour = core + uColor * rim * 2.2 + vec3(1.0) * pow(rim, 7.0) * 0.6;
  gl_FragColor = vec4(colour * uIntensity * uOpacity, uOpacity);
}
`;

/** Soft additive halo sprite behind each orb (feeds the bloom). */
export const HALO_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const HALO_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(uColor * a * a * 0.55 * uOpacity, 1.0);
}
`;

/** Trail particles: each samples the orb's recent path (uniform ring of heads) and drifts outward. */
export const TRAIL_LENGTH = 40;

export const TRAIL_VERTEX = /* glsl */ `
#define TRAIL_LENGTH ${TRAIL_LENGTH}
uniform vec3 uHeads[TRAIL_LENGTH];
uniform float uTime;
uniform float uSize;
uniform float uScale;
attribute float aT;
attribute vec3 aSeed;
varying float vAlpha;
void main() {
  float f = aT * float(TRAIL_LENGTH - 1);
  int i0 = int(floor(f));
  int i1 = min(i0 + 1, TRAIL_LENGTH - 1);
  vec3 p = mix(uHeads[i0], uHeads[i1], fract(f));
  float spread = (0.08 + aT * 0.7) * uScale;
  vec3 wobble = vec3(
    sin(uTime * 1.3 + aSeed.x * 31.0),
    cos(uTime * 1.1 + aSeed.y * 27.0),
    sin(uTime * 0.9 + aSeed.z * 23.0)
  );
  p += (aSeed - 0.5) * spread + wobble * spread * 0.25;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (1.0 - aT * 0.7) * (0.5 + aSeed.x) / -mv.z;
  vAlpha = (1.0 - aT) * (1.0 - aT);
  gl_Position = projectionMatrix * mv;
}
`;

export const POINT_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d) * vAlpha * uOpacity;
  gl_FragColor = vec4(uColor * a, 1.0);
}
`;

/** Work field: points start in a tight cluster at the orbs and open out into the field (uMorph). */
export const FIELD_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSize;
attribute vec3 aStart;
attribute vec3 aColour;
attribute float aSeed;
varying vec3 vColour;
varying float vAlpha;
void main() {
  float m = smoothstep(0.0, 1.0, uMorph);
  vec3 p = mix(aStart, position, m);
  p += vec3(sin(uTime * 0.3 + aSeed * 40.0), cos(uTime * 0.25 + aSeed * 30.0), 0.0) * 0.08 * m;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.4 + aSeed) / -mv.z;
  vColour = aColour;
  vAlpha = 0.35 + 0.65 * fract(aSeed * 7.31);
  gl_Position = projectionMatrix * mv;
}
`;

export const FIELD_FRAGMENT = /* glsl */ `
uniform float uOpacity;
varying vec3 vColour;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.2, d) * vAlpha * uOpacity;
  gl_FragColor = vec4(vColour * a, 1.0);
}
`;

/** Formation points: rotate gently; brighten when their case study is in view (uActive). */
export const FORMATION_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uActive;
uniform float uSize;
attribute float aSeed;
varying float vAlpha;
void main() {
  float a = uTime * (0.12 + 0.1 * uActive);
  mat2 r = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec3 p = position;
  p.xz = r * p.xz;
  p *= 0.85 + 0.15 * uActive;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.6 + aSeed) * (0.7 + 0.6 * uActive) / -mv.z;
  vAlpha = 0.25 + 0.75 * uActive;
  gl_Position = projectionMatrix * mv;
}
`;

/** About path: a glowing tube lit up to the scroll position (uProgress), dim beyond it. */
export const PATH_VERTEX = /* glsl */ `
varying float vT;
varying vec2 vUv;
void main() {
  vT = uv.x;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const PATH_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uProgress;
uniform float uOpacity;
uniform float uTime;
varying float vT;
varying vec2 vUv;
void main() {
  float lit = smoothstep(uProgress + 0.02, uProgress - 0.02, vT);
  float pulse = 0.5 + 0.5 * sin(vT * 80.0 - uTime * 3.0);
  float base = mix(0.12, 1.0, lit) * (0.8 + 0.2 * pulse);
  gl_FragColor = vec4(uColor * base * 1.1 * uOpacity, 1.0);
}
`;

/** Shockwave burst particles: fly out from the centre with uBurst (0 → 1). */
export const BURST_VERTEX = /* glsl */ `
uniform float uBurst;
uniform float uReach;
uniform float uSize;
attribute vec3 aDir;
attribute vec3 aColour;
varying vec3 vColour;
varying float vAlpha;
void main() {
  vec3 p = position + aDir * uBurst * uReach;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize / -mv.z;
  vColour = aColour;
  vAlpha = (1.0 - uBurst) * step(0.001, uBurst);
  gl_Position = projectionMatrix * mv;
}
`;

export const BURST_FRAGMENT = /* glsl */ `
varying vec3 vColour;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.0, d) * vAlpha;
  gl_FragColor = vec4(vColour * a * 1.5, 1.0);
}
`;

/** Shockwave ring: a thin soft band on a quad, scaled out by the timeline. */
export const RING_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float band = smoothstep(0.86, 0.95, d) * smoothstep(1.0, 0.95, d);
  gl_FragColor = vec4(uColor * band * 2.0 * uOpacity, 1.0);
}
`;
