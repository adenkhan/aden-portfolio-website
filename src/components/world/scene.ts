import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
  HalfFloatType,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import {
  BlendFunction,
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  RenderPass,
  VignetteEffect,
} from "postprocessing";
import { gsap } from "@/lib/motion/eases";
import type { StageGeometry } from "@/components/three/stage";
import { buildTimeline, CONVERGENCE_DURATION, initialState, SCROLL_END } from "./convergence";
import { LensEffect } from "./lens";
import { Lightning } from "./lightning";
import { FrameGovernor, settingsFor, type QualitySettings, type QualityTier } from "./quality";
import * as S from "./shaders";

export type Station = "home" | "about" | "work" | "contact" | "rest";

/** Live inputs the controller writes from the page (DOM anchors, scroll progress, pointer). */
export interface WorldInput {
  hero: Element | null;
  teaser: Element | null;
  teaserProgress: number;
  aboutProgress: number;
  arcsLit: number;
  activeCase: number;
  skills: boolean;
  lanes: Element[];
  laneHover: number;
  contact: Element | null;
  pointer: { x: number; y: number; active: boolean };
}

const COLOURS = { creative: new Color("#ff4d6a"), data: new Color("#3db0ff"), growth: new Color("#a77cff") };
const BG = new Color("#0b0d1a");
const ORB_RADIUS = 0.55;
const DEPTH = 10;
const ABOUT = new Vector3(16, -4, -14);
const WORK = new Vector3(-18, -6, -16);
const CASE_LANES = ["growth", "data", "data", "growth", "creative", "creative"] as const;
const LANE_COLOURS = ["growth", "creative", "data", "creative"] as const;

const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt);
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const rand = (seed: number) => {
  // Deterministic, so every visit builds the same world.
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

/** One orb: displaced fresnel sphere, an additive halo and a GPU particle trail. */
class Orb {
  readonly group = new Group();
  readonly target = new Vector3();
  scale = 0;
  targetScale = 1;
  opacity = 1;
  private readonly sphere: Mesh<IcosahedronGeometry, ShaderMaterial>;
  private readonly core: Mesh<IcosahedronGeometry, MeshBasicMaterial>;
  private readonly halo: Mesh<PlaneGeometry, ShaderMaterial>;
  private readonly trail: Points<BufferGeometry, ShaderMaterial>;
  private readonly heads: Vector3[];

  constructor(colour: Color, q: QualitySettings, dpr: number, withTrail: boolean) {
    const sphereMaterial = new ShaderMaterial({
      vertexShader: S.ORB_VERTEX,
      fragmentShader: S.ORB_FRAGMENT,
      defines: { OCTAVES: q.octaves },
      uniforms: {
        uTime: { value: 0 },
        uAmp: { value: 0.06 },
        uColor: { value: colour.clone() },
        uIntensity: { value: 1.3 },
        uOpacity: { value: 1 },
        uDisplace: { value: 0 },
        uPlasma: { value: 0.35 },
      },
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    });
    this.sphere = new Mesh(new IcosahedronGeometry(ORB_RADIUS, Math.round(q.orbDetail / 4)), sphereMaterial);
    this.halo = new Mesh(
      new PlaneGeometry(ORB_RADIUS * 6, ORB_RADIUS * 6),
      new ShaderMaterial({
        vertexShader: S.HALO_VERTEX,
        fragmentShader: S.HALO_FRAGMENT,
        uniforms: { uColor: { value: colour.clone() }, uOpacity: { value: 1 } },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    // Layered (r7): a bright inner core seen through the translucent plasma shell, inside the halo.
    this.core = new Mesh(
      new IcosahedronGeometry(ORB_RADIUS * 0.42, 2),
      new MeshBasicMaterial({
        color: colour.clone().multiplyScalar(2.6),
        transparent: true,
        depthWrite: false,
      }),
    );
    this.core.renderOrder = 0;
    this.sphere.renderOrder = 1;
    this.group.add(this.halo, this.core, this.sphere);

    this.heads = Array.from({ length: S.TRAIL_LENGTH }, () => new Vector3());
    const count = withTrail ? q.trail : 0;
    const t = new Float32Array(count);
    const seeds = new Float32Array(count * 3);
    const r = rand(colour.getHex() + 7);
    for (let i = 0; i < count; i++) {
      t[i] = Math.pow(r(), 1.6);
      seeds.set([r(), r(), r()], i * 3);
    }
    const geometry = new BufferGeometry();
    // Positions come from the shader; three still needs a position attribute for the draw count.
    geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aT", new Float32BufferAttribute(t, 1));
    geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 3));
    this.trail = new Points(
      geometry,
      new ShaderMaterial({
        vertexShader: S.TRAIL_VERTEX,
        fragmentShader: S.POINT_FRAGMENT,
        uniforms: {
          uHeads: { value: this.heads },
          uTime: { value: 0 },
          uSize: { value: 70 * dpr },
          uScale: { value: 1 },
          uColor: { value: colour.clone() },
          uOpacity: { value: 1 },
        },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    this.trail.frustumCulled = false;
  }

  get trailObject() {
    return this.trail;
  }

  /** Convergence: displacement and plasma grow as the orbs close in (0–1). */
  setCharge(charge: number) {
    const u = this.sphere.material.uniforms;
    u.uDisplace.value = charge;
    u.uPlasma.value = 0.35 + 0.65 * charge;
  }

  setTrailCount(count: number) {
    this.trail.geometry.setDrawRange(0, count);
  }

  /** Moves toward the target; `snap` places it there at once (still frames, the intro). */
  update(dt: number, time: number, camera: PerspectiveCamera, snap: boolean) {
    const g = this.group;
    if (snap) {
      g.position.copy(this.target);
      this.scale = this.targetScale;
    } else {
      g.position.lerp(this.target, damp(4, dt));
      this.scale += (this.targetScale - this.scale) * damp(3, dt);
    }
    const s = Math.max(this.scale, 0.0001);
    this.sphere.scale.setScalar(s);
    this.core.scale.setScalar(s);
    this.halo.scale.setScalar(s);
    this.halo.quaternion.copy(camera.quaternion);
    const visible = this.scale > 0.01 && this.opacity > 0.01;
    this.sphere.visible = this.halo.visible = this.core.visible = visible;
    this.core.material.opacity = this.opacity;
    this.sphere.material.uniforms.uTime.value = time;
    this.sphere.material.uniforms.uOpacity.value = this.opacity;
    this.halo.material.uniforms.uOpacity.value = this.opacity;

    // Trail: newest head first. Snapping (still frames) collapses the trail onto the orb.
    if (snap) for (const h of this.heads) h.copy(g.position);
    else {
      const last = this.heads.pop()!;
      this.heads.unshift(last.copy(g.position));
    }
    const u = this.trail.material.uniforms;
    u.uTime.value = time;
    u.uScale.value = s;
    u.uOpacity.value = this.opacity * Math.min(1, this.scale * 1.5);
    this.trail.visible = visible;
  }
}

export interface WorldDebug {
  station: Station;
  tier: QualityTier;
  frames: number;
  running: boolean;
  geometries: number;
  textures: number;
  convergence: "off" | "intro" | "scroll";
  convergenceProgress: number;
}

/**
 * The persistent world: one renderer, one scene, one camera, alive for the whole visit
 * (BaseLayout mounts its host with transition:persist). Stations move the camera and cast;
 * nothing is rebuilt on navigation, so there is exactly one WebGL context per visit.
 */
export class World {
  readonly input: WorldInput = {
    hero: null,
    teaser: null,
    teaserProgress: 0,
    aboutProgress: 0,
    arcsLit: 0,
    activeCase: -1,
    skills: false,
    lanes: [],
    laneHover: -1,
    contact: null,
    pointer: { x: 0, y: 0, active: false },
  };
  station: Station = "home";
  frames = 0;

  private readonly renderer: WebGLRenderer;
  private readonly composer: EffectComposer;
  private readonly camera = new PerspectiveCamera(40, 1, 0.1, 200);
  private readonly scene = new Scene();
  private quality: QualitySettings;
  private readonly governor: FrameGovernor;
  private readonly bloom: BloomEffect;
  private readonly aberration: ChromaticAberrationEffect;
  private readonly aberrationPass: EffectPass;

  private readonly red: Orb;
  private readonly blue: Orb;
  private readonly purple: Orb;
  private readonly camPos = new Vector3(0, 0, DEPTH);
  private readonly camLook = new Vector3();
  private readonly camPosTarget = new Vector3(0, 0, DEPTH);
  private readonly camLookTarget = new Vector3();

  private readonly path: CatmullRomCurve3;
  // About and Work pieces are built on the first visit to their station (keeps Home's start light).
  private pathMesh: Mesh<TubeGeometry, ShaderMaterial> | null = null;
  private readonly pathNodes: Mesh<IcosahedronGeometry, MeshBasicMaterial>[] = [];
  private field: Points<BufferGeometry, ShaderMaterial> | null = null;
  private readonly dust: Points<BufferGeometry, ShaderMaterial>;
  private readonly formations: Points<BufferGeometry, ShaderMaterial>[] = [];
  private readonly clusters: Group[] = [];
  private readonly ring: Mesh<PlaneGeometry, ShaderMaterial>;
  private readonly burst: Points<BufferGeometry, ShaderMaterial>;
  private readonly shock = { ring: 0, ringOpacity: 0, burst: 0, centre: new Vector3() };
  private flash: gsap.core.Timeline | null = null;

  private orbitAngle = 0;
  private fieldMorph = 0;
  private skillsMix = 0;
  private pathT = 0;
  private readonly pointer = new Vector2();

  // Convergence (r7): one timeline over one state, autoplayed by the intro or scrubbed by scroll.
  private readonly conv = initialState();
  private readonly convTl = buildTimeline(this.conv);
  private convMode: "off" | "intro" | "scroll" = "off";
  private convStage: StageGeometry | null = null;
  private convHandlers: { reveal: () => void; complete: () => void } | null = null;
  private convRevealed = false;
  private readonly lightning: Lightning;
  private readonly swirl: Points<BufferGeometry, ShaderMaterial>;
  private lens: LensEffect | null = null;
  private lensPass: EffectPass | null = null;
  private swirlPhase = 0;
  private velPhase = 0;
  private vel = 0;
  private strike = 0;
  /** Reduced motion: the Home still shows the merged purple sphere. */
  stillMode = false;

  private time = 0;
  private last = 0;
  private lastInput = 0;
  private raf = 0;
  private running = false;
  private snapNext = true;
  private readonly tmp = new Vector3();
  private readonly tmp2 = new Vector3();
  private readonly aDir = new Vector3();
  private readonly aFwd = new Vector3();
  private readonly host: HTMLElement;

  constructor(host: HTMLElement, tier: QualityTier) {
    this.host = host;
    this.quality = settingsFor(tier);
    const q = this.quality;
    this.renderer = new WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
    });
    // scene.background, not setClearColor: three converts it for the bound target at render time. A clear
    // colour set while the screen is bound is stored as sRGB and comes out lighter in the linear buffer.
    this.scene.background = BG.clone();
    // Synchronous shader checks stall the main thread on every program link; dev builds keep them.
    this.renderer.debug.checkShaderErrors = import.meta.env.DEV;
    this.renderer.domElement.className = "world-canvas";
    this.renderer.domElement.dataset.worldCanvas = String(Date.now());
    host.append(this.renderer.domElement);
    const dpr = this.dpr();

    this.red = new Orb(COLOURS.creative, q, dpr, true);
    this.blue = new Orb(COLOURS.data, q, dpr, true);
    this.purple = new Orb(COLOURS.growth, q, dpr, false);
    this.purple.targetScale = 0;
    this.scene.add(
      this.red.group,
      this.red.trailObject,
      this.blue.group,
      this.blue.trailObject,
      this.purple.group,
    );

    // About: a glowing path the merged orb travels; one node per origin arc.
    const local = [
      [0, 5, 0],
      [2.6, 2.2, -1.5],
      [-2.2, -0.6, -3],
      [2.4, -3.4, -4.5],
      [-1.8, -6.2, -6],
      [0.6, -9, -7.5],
    ].map(([x, y, z]) => new Vector3(x, y, z).add(ABOUT));
    this.path = new CatmullRomCurve3(local, false, "catmullrom", 0.4);
    // Everywhere: sparse dust, so camera flights between stations have depth.
    this.dust = this.makeField(
      Math.round(q.field / 5),
      new Vector3(0, -4, -14),
      new Vector3(42, 26, 20),
      null,
      0.5,
    );
    this.scene.add(this.dust);

    // Shockwave: ring and burst particles (intro, the scroll collision, the contact send).
    this.ring = new Mesh(
      new PlaneGeometry(2, 2),
      new ShaderMaterial({
        vertexShader: S.HALO_VERTEX,
        fragmentShader: S.RING_FRAGMENT,
        uniforms: { uColor: { value: COLOURS.growth.clone() }, uOpacity: { value: 0 } },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    this.scene.add(this.ring);
    this.burst = this.makeBurst(q.tier === "low" ? 120 : 220, dpr);
    this.scene.add(this.burst);

    // Convergence: lightning (subdivision depth by tier) and the ambient particles it draws in.
    this.lightning = new Lightning(
      q.tier === "low" ? 4 : q.tier === "medium" ? 6 : 7,
      new Vector2(innerWidth, innerHeight),
    );
    this.scene.add(this.lightning.group);
    this.swirl = this.makeSwirl(q.tier === "low" ? 300 : q.tier === "medium" ? 600 : 900, dpr);
    this.scene.add(this.swirl);

    // Post: bloom, film grain and a vignette in one pass; chromatic aberration in its own pass.
    this.composer = new EffectComposer(this.renderer, { frameBufferType: HalfFloatType });
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    // Space bend around the vortex (r7). Phones (low tier) skip it; their flash comes from the bloom.
    if (q.tier !== "low") {
      this.lens = new LensEffect();
      this.lensPass = new EffectPass(this.camera, this.lens);
      this.composer.addPass(this.lensPass);
    }
    this.bloom = new BloomEffect({
      intensity: 1.1,
      luminanceThreshold: 0.12,
      luminanceSmoothing: 0.3,
      mipmapBlur: true,
      radius: 0.75,
      resolutionScale: q.bloomScale,
    });
    const grain = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: true });
    grain.blendMode.opacity.value = 0.22;
    const vignette = new VignetteEffect({ darkness: 0.4, offset: 0.35 });
    this.composer.addPass(new EffectPass(this.camera, this.bloom, grain, vignette));
    this.aberration = new ChromaticAberrationEffect({
      offset: new Vector2(0.0006, 0.0004),
      radialModulation: true,
      modulationOffset: 0.25,
    });
    this.aberrationPass = new EffectPass(this.camera, this.aberration);
    this.applyAberration(q.aberration);

    this.governor = new FrameGovernor(q.tier, (next) => this.setTier(next));
    this.resize();
  }

  get debug(): WorldDebug {
    const info = this.renderer.info;
    return {
      station: this.station,
      tier: this.quality.tier,
      frames: this.frames,
      running: this.running,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      convergence: this.convMode,
      convergenceProgress: this.convTl.progress(),
    };
  }

  private dpr() {
    return Math.min(window.devicePixelRatio || 1, this.quality.dpr);
  }

  private makeField(
    count: number,
    centre: Vector3,
    size: Vector3,
    start: Vector3 | null,
    brightness: number,
  ): Points<BufferGeometry, ShaderMaterial> {
    const r = rand(count + Math.round(centre.x * 10));
    const positions = new Float32Array(count * 3);
    const starts = new Float32Array(count * 3);
    const colours = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const palette = [COLOURS.data, COLOURS.data, COLOURS.creative, COLOURS.growth];
    for (let i = 0; i < count; i++) {
      const p = [
        centre.x + (r() - 0.5) * size.x,
        centre.y + (r() - 0.5) * size.y,
        centre.z + (r() - 0.5) * size.z,
      ];
      positions.set(p, i * 3);
      if (start)
        starts.set(
          [start.x + (r() - 0.5) * 0.4, start.y + (r() - 0.5) * 0.4, start.z + (r() - 0.5) * 0.4],
          i * 3,
        );
      else starts.set(p, i * 3);
      const c = palette[Math.floor(r() * palette.length)];
      colours.set([c.r * brightness, c.g * brightness, c.b * brightness], i * 3);
      seeds[i] = r();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aStart", new Float32BufferAttribute(starts, 3));
    geometry.setAttribute("aColour", new Float32BufferAttribute(colours, 3));
    geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
    const points = new Points(
      geometry,
      new ShaderMaterial({
        vertexShader: S.FIELD_VERTEX,
        fragmentShader: S.FIELD_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uMorph: { value: start ? 0 : 1 },
          uSize: { value: 36 * this.dpr() },
          uOpacity: { value: start ? 0 : 0.7 },
        },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    points.frustumCulled = false;
    return points;
  }

  /** Six shapes, one per case study (R4 refines them): ring, lattice, helix, sphere, wave, spiral. */
  private makeFormation(index: number, count: number, dpr: number) {
    const r = rand(100 + index);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const u = i / count;
      let p: [number, number, number];
      switch (index) {
        case 0: {
          const a = u * Math.PI * 2;
          const rr = 1.1 + (r() - 0.5) * 0.25;
          p = [Math.cos(a) * rr, (r() - 0.5) * 0.2, Math.sin(a) * rr];
          break;
        }
        case 1: {
          const n = 6;
          p = [
            Math.floor(r() * n) / (n - 1) - 0.5,
            Math.floor(r() * n) / (n - 1) - 0.5,
            Math.floor(r() * n) / (n - 1) - 0.5,
          ].map((v) => v * 1.8 + (r() - 0.5) * 0.05) as [number, number, number];
          break;
        }
        case 2: {
          const a = u * Math.PI * 8;
          const strand = i % 2 ? Math.PI : 0;
          p = [Math.cos(a + strand) * 0.6, (u - 0.5) * 2.6, Math.sin(a + strand) * 0.6];
          break;
        }
        case 3: {
          const y = 1 - 2 * u;
          const rad = Math.sqrt(1 - y * y);
          const a = i * 2.39996;
          p = [Math.cos(a) * rad * 1.1, y * 1.1, Math.sin(a) * rad * 1.1];
          break;
        }
        case 4: {
          const x = (r() - 0.5) * 2.6;
          const z = (r() - 0.5) * 2.6;
          p = [x, Math.sin(x * 2.4) * Math.cos(z * 2) * 0.35, z];
          break;
        }
        default: {
          const arm = i % 3;
          const d = Math.sqrt(u) * 1.4;
          const a = d * 3.2 + (arm * Math.PI * 2) / 3;
          p = [Math.cos(a) * d, (r() - 0.5) * 0.15, Math.sin(a) * d];
        }
      }
      positions.set(p, i * 3);
      seeds[i] = r();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
    const points = new Points(
      geometry,
      new ShaderMaterial({
        vertexShader: S.FORMATION_VERTEX,
        fragmentShader: S.POINT_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uActive: { value: 0 },
          uSize: { value: 90 * dpr },
          uColor: { value: COLOURS[CASE_LANES[index]].clone().multiplyScalar(1.4) },
          uOpacity: { value: 0 },
        },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    // Formations stack down the field, offset right of centre so the case study text stays clear.
    points.position.copy(WORK).add(new Vector3(0, 7.5 - index * 3.6, 0));
    points.frustumCulled = false;
    return points;
  }

  private makeCluster(index: number, dpr: number, r: () => number) {
    const group = new Group();
    const nodes = 9 + index * 2;
    const positions = new Float32Array(nodes * 3);
    const seeds = new Float32Array(nodes);
    for (let i = 0; i < nodes; i++) {
      positions.set([(r() - 0.5) * 1.6, (r() - 0.5) * 0.9, (r() - 0.5) * 0.6], i * 3);
      seeds[i] = r();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
    const colour = COLOURS[LANE_COLOURS[index]];
    const points = new Points(
      geometry,
      new ShaderMaterial({
        vertexShader: S.FORMATION_VERTEX,
        fragmentShader: S.POINT_FRAGMENT,
        uniforms: {
          uTime: { value: 0 },
          uActive: { value: 0.4 },
          uSize: { value: 110 * dpr },
          uColor: { value: colour.clone().multiplyScalar(1.6) },
          uOpacity: { value: 0 },
        },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    points.frustumCulled = false;
    // Lines: each node to the next, the constellation's shape.
    const lines: number[] = [];
    for (let i = 0; i < nodes - 1; i++)
      lines.push(...positions.slice(i * 3, i * 3 + 3), ...positions.slice(i * 3 + 3, i * 3 + 6));
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute("position", new Float32BufferAttribute(lines, 3));
    const segments = new LineSegments(
      lineGeometry,
      new LineBasicMaterial({
        color: colour.clone().multiplyScalar(0.9),
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    group.add(segments, points);
    group.visible = false;
    return group;
  }

  private makeBurst(count: number, dpr: number) {
    const r = rand(9);
    const dirs = new Float32Array(count * 3);
    const colours = new Float32Array(count * 3);
    const palette = [COLOURS.creative, COLOURS.data, COLOURS.growth];
    for (let i = 0; i < count; i++) {
      const a = r() * Math.PI * 2;
      const e = (r() - 0.5) * 1.2;
      const speed = 0.35 + r() * 0.65;
      dirs.set(
        [Math.cos(a) * Math.cos(e) * speed, Math.sin(e) * speed, Math.sin(a) * Math.cos(e) * speed * 0.6],
        i * 3,
      );
      palette[i % 3].toArray(colours, i * 3);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aDir", new Float32BufferAttribute(dirs, 3));
    geometry.setAttribute("aColour", new Float32BufferAttribute(colours, 3));
    const points = new Points(
      geometry,
      new ShaderMaterial({
        vertexShader: S.BURST_VERTEX,
        fragmentShader: S.BURST_FRAGMENT,
        uniforms: { uBurst: { value: 0 }, uReach: { value: 4 }, uSize: { value: 60 * dpr } },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    points.frustumCulled = false;
    return points;
  }

  /** World point at a camera-space depth behind a viewport position (CSS pixels). */
  private anchor(x: number, y: number, depth: number, out: Vector3): Vector3 {
    const w = this.host.clientWidth || innerWidth;
    const h = this.host.clientHeight || innerHeight;
    const dir = this.aDir
      .set((x / w) * 2 - 1, -(y / h) * 2 + 1, 0.5)
      .unproject(this.camera)
      .sub(this.camera.position)
      .normalize();
    const distance = depth / dir.dot(this.camera.getWorldDirection(this.aFwd));
    return out.copy(this.camera.position).addScaledVector(dir, distance);
  }

  /** World units per CSS pixel at a camera-space depth. */
  private unitsPerPixel(depth: number) {
    const h = this.host.clientHeight || innerHeight;
    return (2 * depth * Math.tan((this.camera.fov * Math.PI) / 360)) / h;
  }

  private rectAnchor(el: Element | null, out: Vector3, clampY = false): DOMRect | null {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const h = this.host.clientHeight || innerHeight;
    let y = rect.top + rect.height / 2;
    if (clampY) y = Math.min(Math.max(y, h * 0.28), h * 0.72);
    this.anchor(rect.left + rect.width / 2, y, DEPTH, out);
    return rect;
  }

  /** First visit to About: the glowing path and its four nodes. */
  private ensureAbout() {
    if (this.pathMesh) return;
    const pathMesh = new Mesh(
      new TubeGeometry(this.path, 260, 0.035, 6, false),
      new ShaderMaterial({
        vertexShader: S.PATH_VERTEX,
        fragmentShader: S.PATH_FRAGMENT,
        uniforms: {
          uColor: { value: COLOURS.growth.clone() },
          uProgress: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
        },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    this.pathMesh = pathMesh;
    this.scene.add(pathMesh);
    for (const t of [0.2, 0.42, 0.64, 0.86]) {
      const node = new Mesh(
        new IcosahedronGeometry(0.16, 2),
        new MeshBasicMaterial({ color: COLOURS.growth.clone(), transparent: true, opacity: 0 }),
      );
      node.position.copy(this.path.getPointAt(t));
      node.userData.t = t;
      this.pathNodes.push(node);
      this.scene.add(node);
    }
  }

  /** First visit to Work: the field, the six formations and the skills constellation. */
  private ensureWork() {
    if (this.field) return;
    const q = this.quality;
    const dpr = this.dpr();
    const r = rand(42);
    // Work: a field of points that opens out of the orbs, and one small formation per case study.
    this.field = this.makeField(
      q.field,
      WORK.clone().add(new Vector3(0, -1.5, 0)),
      new Vector3(12, 24, 8),
      WORK,
      1.0,
    );
    this.scene.add(this.field);
    for (let i = 0; i < 6; i++) {
      const formation = this.makeFormation(i, q.formation, dpr);
      this.formations.push(formation);
      this.scene.add(formation);
    }

    // Skills: four clusters (one per HTML lane), anchored behind their labels in camera space.
    for (let c = 0; c < 4; c++) {
      const cluster = this.makeCluster(c, dpr, r);
      this.clusters.push(cluster);
      this.scene.add(cluster);
    }
  }

  setStation(station: Station, instant = false) {
    if (station === "about") this.ensureAbout();
    if (station === "work") this.ensureWork();
    this.station = station;
    if (instant) this.snapNext = true;
    this.lastInput = performance.now();
    if (!this.running) this.renderStill();
  }

  /** Steps quality down without rebuilding: pixel ratio, draw counts, bloom and aberration. */
  setTier(tier: QualityTier) {
    const prev = this.quality;
    this.quality = settingsFor(tier);
    const q = this.quality;
    this.renderer.setPixelRatio(this.dpr());
    this.red.setTrailCount(Math.min(prev.trail, q.trail));
    this.blue.setTrailCount(Math.min(prev.trail, q.trail));
    this.field?.geometry.setDrawRange(0, q.field);
    this.dust.geometry.setDrawRange(0, Math.round(q.field / 5));
    for (const f of this.formations) f.geometry.setDrawRange(0, q.formation);
    this.bloom.resolution.scale = q.bloomScale;
    this.applyAberration(q.aberration);
    this.lightning.setDepth(tier === "low" ? 4 : tier === "medium" ? 6 : 7);
    if (tier === "low" && this.lensPass) {
      this.composer.removePass(this.lensPass);
      this.lensPass = null;
      this.lens = null;
    }
    this.resize();
    this.host.dataset.quality = tier;
  }

  /**
   * Adds or removes the aberration pass. Removing (not disabling) it matters: the composer renders
   * to the screen from its last pass, and a disabled last pass would leave the screen blank.
   */
  private applyAberration(on: boolean) {
    const present = this.composer.passes.includes(this.aberrationPass);
    if (on && !present) this.composer.addPass(this.aberrationPass);
    if (!on && present) this.composer.removePass(this.aberrationPass);
  }

  resize() {
    const w = this.host.clientWidth || innerWidth;
    const h = this.host.clientHeight || innerHeight;
    this.renderer.setPixelRatio(this.dpr());
    this.renderer.setSize(w, h, false);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.lightning.setResolution(w * this.dpr(), h * this.dpr());
    if (!this.running) this.renderStill();
  }

  /**
   * The Home intro (r7): Convergence autoplays at the stage point. `reveal` fires at the tear
   * (3.25 s), `complete` at the end (3.5 s). The returned stop() ends it early (Skip, Esc).
   */
  playConvergence(g: StageGeometry, on: { reveal: () => void; complete: () => void }) {
    this.convStage = g;
    this.convMode = "intro";
    this.convHandlers = on;
    this.convRevealed = false;
    this.convTl.eventCallback("onComplete", () => {
      const done = this.convHandlers;
      this.endConvergence();
      done?.complete();
    });
    this.convTl.restart();
    this.lastInput = performance.now();
    return { stop: () => this.endConvergence() };
  }

  private endConvergence() {
    this.convTl.eventCallback("onComplete", null);
    this.convTl.pause();
    this.convMode = "off";
    this.convHandlers = null;
    this.convStage = null;
    this.lightning.hide();
  }

  /** Ambient particles that the vortex draws in. */
  private makeSwirl(count: number, dpr: number) {
    const r = rand(77);
    const polar = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      polar.set([1.2 + r() * 3.4, r() * Math.PI * 2, (r() - 0.5) * 2.4], i * 3);
      seeds[i] = r();
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aPolar", new Float32BufferAttribute(polar, 3));
    geometry.setAttribute("aSeed", new Float32BufferAttribute(seeds, 1));
    const points = new Points(
      geometry,
      new ShaderMaterial({
        vertexShader: S.SWIRL_VERTEX,
        fragmentShader: S.POINT_FRAGMENT,
        uniforms: {
          uPhase: { value: 0 },
          uSuck: { value: 0 },
          uSize: { value: 46 * dpr },
          uColor: { value: COLOURS.growth.clone().multiplyScalar(1.3) },
          uOpacity: { value: 0 },
        },
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    points.frustumCulled = false;
    points.visible = false;
    return points;
  }

  /**
   * Applies the Convergence state: the decaying, precessing double helix, the merge, lightning,
   * the space bend, camera shake and dolly, and the collapse. Orb A sits at
   * centre + R·(cos θ, sin θ·cos φ, sin θ·sin φ) in the orbit plane (wobbled by ψ); orb B at θ + π.
   */
  private applyConvergence(dt: number, centre: Vector3, r0: number, size: number) {
    const c = this.conv;
    const cam = this.camera;
    const right = new Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    const back = new Vector3(0, 0, 1).applyQuaternion(cam.quaternion);
    const cp = Math.cos(c.psi);
    const sp = Math.sin(c.psi);
    const e1 = right.clone().multiplyScalar(cp).addScaledVector(back, sp);
    const e3 = back.clone().multiplyScalar(cp).addScaledVector(right, -sp);
    const theta = c.theta + this.velPhase;
    const radius = c.radius * r0;
    const at = (angle: number) =>
      centre
        .clone()
        .addScaledVector(e1, Math.cos(angle) * radius)
        .addScaledVector(up, Math.sin(angle) * Math.cos(c.phi) * radius)
        .addScaledVector(e3, Math.sin(angle) * Math.sin(c.phi) * radius);
    this.red.target.copy(at(theta));
    this.blue.target.copy(at(theta + Math.PI));
    this.red.targetScale = this.blue.targetScale = c.summon * (1 - c.merge) * size;
    this.red.opacity = this.blue.opacity = Math.min(1, c.summon * 1.2);
    this.red.setCharge(c.charge);
    this.blue.setCharge(c.charge);
    // Purple: pulses once, then surges toward the camera (the intro's release).
    this.purple.target.copy(centre).lerp(cam.position, c.surge * 0.8);
    this.purple.targetScale = c.merge * 1.4 * size * (1 + 0.25 * c.pulse) * (1 + c.surge * 3);
    this.purple.opacity = c.merge;
    this.purple.setCharge(c.merge * (1 - c.surge));

    // Camera: a slow dolly-in and a slight shake while charging (the centre stays where it was).
    const toCentre = this.tmp.copy(centre).sub(cam.position).normalize();
    cam.position.addScaledVector(toCentre, c.dolly * 0.9);
    if (c.shake > 0)
      cam.position.add(
        new Vector3(Math.random() - 0.5, Math.random() - 0.5, 0).multiplyScalar(c.shake * 0.06),
      );
    cam.updateMatrixWorld();

    // Lightning: more and thicker bolts as they close in; scroll speed adds more.
    const boost = this.convMode === "scroll" ? Math.min(0.5, Math.abs(this.vel) / 60) : 0;
    this.lightning.update(
      performance.now(),
      this.red.group.position,
      this.blue.group.position,
      Math.min(1, c.bolts + boost * c.summon),
      r0 * 1.2,
    );
    this.strike = Math.max(this.strike * Math.exp(-dt * 25), this.lightning.strike);
    this.lightning.strike = 0;

    // The surrounding particles get drawn into the spiral.
    const sw = this.swirl.material.uniforms;
    this.swirlPhase += dt * (0.4 + c.bolts * 3 + Math.abs(this.vel) * 0.04);
    sw.uPhase.value = this.swirlPhase;
    sw.uSuck.value = Math.min(1, c.distortion * 0.9 + c.charge * 0.2);
    sw.uOpacity.value = c.summon * (1 - c.merge);
    this.swirl.visible = sw.uOpacity.value > 0.01;
    this.swirl.position.copy(centre);
    this.swirl.quaternion.copy(cam.quaternion);
    this.swirl.scale.setScalar(r0 / 1.7);

    // Collapse: a shockwave ring lying in the orbit plane (a real 3D ring) and the burst.
    const sh = this.shock;
    sh.centre.copy(centre);
    sh.ring = (0.15 + c.ring * 3.2) * r0;
    sh.ringOpacity = c.ring > 0 && c.ring < 1 ? 1 - c.ring : 0;
    sh.burst = c.ring;
    const normal = e1
      .clone()
      .cross(up.clone().multiplyScalar(Math.cos(c.phi)).addScaledVector(e3, Math.sin(c.phi)));
    this.ring.position.copy(centre);
    this.ring.lookAt(centre.clone().add(normal));

    // Post: bloom carries the flashes and strikes; aberration spikes on the collapse; space bends.
    this.bloom.intensity = 1.1 + c.bolts * 1.3 + c.flashWhite * 5 + c.flashPurple * 2.5 + this.strike * 1.5;
    this.aberration.offset.set(0.0006 + c.aberration * 0.012, 0.0004 + c.aberration * 0.008);
    if (this.lens) {
      const v = centre.clone().project(cam);
      const w = this.host.clientWidth || innerWidth;
      const h = this.host.clientHeight || innerHeight;
      this.lens.set({
        centre: new Vector2((v.x + 1) / 2, (v.y + 1) / 2),
        strength: c.distortion,
        ripple: c.ripple * 0.7,
        rippleAmp: c.ripple > 0 && c.ripple < 1 ? (1 - c.ripple) * 0.05 : 0,
        aspect: w / h,
        flash: new Vector3(1, 1, 1)
          .multiplyScalar(c.flashWhite * 0.9 + this.strike * 0.25)
          .add(new Vector3(0.65, 0.48, 1).multiplyScalar(c.flashPurple * 0.45)),
      });
    }
  }

  /** A purple flash, shockwave and burst at a viewport point (the contact form send). */
  burstAt(x: number, y: number) {
    this.anchor(x, y, DEPTH, this.shock.centre);
    this.flash?.kill();
    const s = this.shock;
    this.flash = gsap
      .timeline()
      .fromTo(s, { ring: 0.1, ringOpacity: 1 }, { ring: 2.6, duration: 0.7, ease: "power3.out" }, 0)
      .to(s, { ringOpacity: 0, duration: 0.35 }, 0.35)
      .fromTo(s, { burst: 0 }, { burst: 1, duration: 0.7, ease: "power2.out" }, 0);
    this.lastInput = performance.now();
    if (!this.running) this.renderStill();
  }

  notifyInput() {
    this.lastInput = performance.now();
  }

  // ---------------------------------------------------------------- per-frame logic

  private update(dt: number, snap: boolean) {
    const t = this.time;
    const input = this.input;
    const mobile = (this.host.clientWidth || innerWidth) < 768;

    // Pointer drift (Home): eased, so the orbs lean toward the cursor without twitching.
    const p = input.pointer;
    this.pointer.x += ((p.active ? p.x : 0) - this.pointer.x) * damp(2, dt);
    this.pointer.y += ((p.active ? p.y : 0) - this.pointer.y) * damp(2, dt);

    let merge = 0;
    let orbScale = 1;
    let fieldTarget = 0;
    let pathOpacity = 0;
    let formationsOpacity = 0;
    let skillsTarget = 0;
    const centre = this.tmp2.set(0, 0, 0);

    // Camera target per station.
    switch (this.station) {
      case "about": {
        this.pathT += (0.04 + input.aboutProgress * 0.86 - this.pathT) * (snap ? 1 : damp(3, dt));
        const point = this.path.getPointAt(this.pathT);
        // Phones: the orb rides the right edge, beside the text rather than behind it.
        this.camLookTarget.copy(point).add(new Vector3(mobile ? -0.8 : -1.2, -0.3, 0));
        this.camPosTarget.copy(point).add(new Vector3(mobile ? -0.8 : 1.4, 1.1, 6.4));
        break;
      }
      case "work": {
        const i = input.activeCase;
        const offset = mobile ? 0 : 2.8;
        if (i >= 0 && !input.skills && this.formations[i]) {
          const f = this.formations[i].position;
          this.camLookTarget.set(f.x - offset, f.y, f.z);
          this.camPosTarget.set(f.x - offset, f.y + 0.3, f.z + 6.8);
        } else {
          this.camLookTarget.copy(WORK).add(new Vector3(0, input.skills ? -6 : 3, 0));
          this.camPosTarget.copy(this.camLookTarget).add(new Vector3(0, 0, 15));
        }
        break;
      }
      case "contact":
        this.camLookTarget.set(0, 4, -6);
        this.camPosTarget.set(0, 4, 4);
        break;
      default:
        this.camLookTarget.set(0, 0, 0);
        this.camPosTarget.set(0, 0, DEPTH);
    }
    const ck = snap ? 1 : damp(this.station === "work" ? 2.2 : 1.8, dt);
    this.camPos.lerp(this.camPosTarget, ck);
    this.camLook.lerp(this.camLookTarget, ck);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
    this.camera.updateMatrixWorld();

    // Cast per station.
    this.orbitAngle += dt * (this.station === "contact" ? 0.35 : 0.7);
    const a = this.orbitAngle;
    const upp = this.unitsPerPixel(DEPTH);
    let rx = mobile ? 0.85 : 1.25;
    let ry = rx * 0.45;

    switch (this.station) {
      case "home": {
        // Desktop: the orbs circle around the avatar card's edges (the card is opaque, so not behind it).
        // Phones: a small orbit in the top-right corner, clear of the headline.
        const vw = this.host.clientWidth || innerWidth;
        const vh = this.host.clientHeight || innerHeight;
        const card = mobile ? null : this.rectAnchor(input.hero, centre, true);
        if (card) {
          rx = card.width * upp * 0.6;
          ry = card.height * upp * 0.34;
        } else if (mobile) {
          // Right of the short H1 lines ("Product", "Marketer"), not behind them.
          this.anchor(vw * 0.82, vh * 0.28, DEPTH, centre);
          rx = 0.42;
          ry = 0.2;
        } else this.anchor(vw * 0.72, vh * 0.45, DEPTH, centre);
        if (!mobile) centre.add(new Vector3(this.pointer.x * 0.9, this.pointer.y * 0.6, 0));
        // Reduced motion: the still is the merged purple sphere (the end of Convergence).
        if (this.stillMode) merge = 1;
        break;
      }
      case "about":
        centre.copy(this.path.getPointAt(this.pathT));
        merge = 1;
        rx = ry = 0.3;
        pathOpacity = 1;
        break;
      case "work":
        centre.copy(WORK).add(new Vector3(0, 3, 0));
        orbScale = 0;
        fieldTarget = 1;
        formationsOpacity = input.skills ? 0.15 : 1;
        skillsTarget = input.skills ? 1 : 0;
        break;
      case "contact": {
        const rect = this.rectAnchor(input.contact, centre);
        if (rect) {
          rx = rect.width * upp * 0.62;
          ry = rect.height * upp * 0.62;
        } else this.anchor(innerWidth / 2, innerHeight / 2, DEPTH, centre);
        break;
      }
      default:
        this.anchor(
          (this.host.clientWidth || innerWidth) * (mobile ? 0.5 : 0.7),
          (this.host.clientHeight || innerHeight) * 0.42,
          DEPTH,
          centre,
        );
    }

    // Orbit: red and blue circle each other (a tilted ellipse, so they pass in front and behind).
    const right = this.tmp.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(this.camera.quaternion);
    const back = new Vector3(0, 0, 1).applyQuaternion(this.camera.quaternion);
    const offset = (angle: number) =>
      right
        .clone()
        .multiplyScalar(Math.cos(angle) * rx)
        .add(up.clone().multiplyScalar(Math.sin(angle) * ry))
        .add(back.clone().multiplyScalar(Math.sin(angle) * rx * 0.5));
    this.red.target.copy(centre).add(offset(a));
    this.blue.target.copy(centre).add(offset(a + Math.PI));
    // Phones: a smaller cast, so text over the canvas keeps its contrast.
    const size = mobile ? 0.45 : 1;
    this.red.targetScale = this.blue.targetScale = orbScale * (1 - merge) * size;
    this.purple.target.copy(centre);
    this.purple.targetScale = orbScale * merge * 1.3 * size;
    this.red.opacity = this.blue.opacity = this.purple.opacity = 1;

    // Convergence (r7). The intro autoplays it; on Home the CREATIVE · DATA · GROWTH section scrubs it.
    const lenis = (window as unknown as { __akLenis?: { velocity: number } }).__akLenis;
    this.vel += ((lenis?.velocity ?? 0) - this.vel) * (snap ? 1 : damp(6, dt));
    if (this.convMode !== "intro") {
      const scrubbing =
        this.station === "home" && !this.stillMode && !!input.teaser && input.teaserProgress > 0.001;
      if (scrubbing) {
        this.convMode = "scroll";
        this.convTl.progress((input.teaserProgress * SCROLL_END) / CONVERGENCE_DURATION);
        // Scrolling faster spins the vortex faster; scrolling back unwinds it.
        this.velPhase += this.vel * dt * 0.05;
      } else if (this.convMode === "scroll") {
        this.convMode = "off";
        this.lightning.hide();
      }
    }
    const conv = this.convMode !== "off";
    if (conv) {
      let r0 = mobile ? 0.9 : 1.7;
      if (this.convMode === "intro" && this.convStage) {
        this.anchor(this.convStage.x, this.convStage.y, DEPTH, centre);
      } else {
        const rect = this.rectAnchor(input.teaser, centre);
        if (rect) r0 = Math.min(2.2, Math.max(0.8, rect.width * upp * 0.32));
      }
      this.applyConvergence(dt, centre, r0, mobile ? 0.6 : 1);
      if (this.convMode === "intro" && !this.convRevealed && this.convTl.time() >= 3.25) {
        this.convRevealed = true;
        this.convHandlers?.reveal();
      }
    } else {
      this.red.setCharge(0);
      this.blue.setCharge(0);
      this.purple.setCharge(merge);
      this.bloom.intensity = 1.1;
      this.aberration.offset.set(0.0006, 0.0004);
      this.lens?.set({ strength: 0, rippleAmp: 0, flash: new Vector3() });
      this.swirl.visible = false;
      this.strike = 0;
    }

    for (const orb of [this.red, this.blue, this.purple]) orb.update(dt, t, this.camera, snap || conv);

    // About path and nodes.
    const pathMesh = this.pathMesh;
    if (pathMesh) {
      const pu = pathMesh.material.uniforms;
      const pathTarget = pathOpacity * (mobile ? 0.55 : 1);
      pu.uOpacity.value += (pathTarget - pu.uOpacity.value) * (snap ? 1 : damp(2.5, dt));
      pu.uProgress.value = this.pathT;
      pu.uTime.value = t;
      pathMesh.visible = pu.uOpacity.value > 0.01;
    }
    this.pathNodes.forEach((node, i) => {
      const lit = this.station === "about" && input.arcsLit > i ? 1 : 0;
      const m = node.material;
      const targetOpacity = pathOpacity * (0.35 + 0.65 * lit);
      m.opacity += (targetOpacity - m.opacity) * (snap ? 1 : damp(4, dt));
      // Lit nodes glow, but stay below white so headings over them keep their contrast.
      m.color.copy(COLOURS.growth).multiplyScalar(0.5 + lit * 1.3);
      node.scale.setScalar(1 + lit * 0.5 + lit * Math.sin(t * 3 + i) * 0.08);
      node.visible = m.opacity > 0.01;
    });

    // Work field: morphs open from the orbs on arrival and closes when leaving.
    this.fieldMorph += (fieldTarget - this.fieldMorph) * (snap ? 1 : damp(1.4, dt));
    const field = this.field;
    if (field) {
      const fu = field.material.uniforms;
      fu.uMorph.value = this.fieldMorph;
      fu.uOpacity.value = this.fieldMorph * 0.85;
      fu.uTime.value = t;
      field.visible = this.fieldMorph > 0.01;
    }
    this.dust.material.uniforms.uTime.value = t;

    this.formations.forEach((f, i) => {
      const u = f.material.uniforms;
      const active = this.station === "work" && input.activeCase === i && !input.skills ? 1 : 0;
      u.uActive.value += (active - u.uActive.value) * (snap ? 1 : damp(3, dt));
      u.uOpacity.value += (formationsOpacity * this.fieldMorph - u.uOpacity.value) * (snap ? 1 : damp(3, dt));
      u.uTime.value = t;
      f.visible = u.uOpacity.value > 0.01;
    });

    // Skills constellation: each cluster sits behind its HTML lane; hovering a lane brightens it.
    this.skillsMix += (skillsTarget - this.skillsMix) * (snap ? 1 : damp(3, dt));
    this.clusters.forEach((cluster, i) => {
      const lane = input.lanes[i];
      cluster.visible = this.skillsMix > 0.01 && !!lane;
      if (!cluster.visible || !lane) return;
      const rect = this.rectAnchor(lane, cluster.position);
      if (rect) cluster.scale.setScalar(Math.max(0.6, rect.width * upp * 0.5));
      cluster.quaternion.copy(this.camera.quaternion);
      const hover = input.laneHover === i ? 1 : 0;
      const [lines, points] = cluster.children as [
        LineSegments<BufferGeometry, LineBasicMaterial>,
        Points<BufferGeometry, ShaderMaterial>,
      ];
      const u = points.material.uniforms;
      u.uActive.value += (0.35 + hover * 0.65 - u.uActive.value) * (snap ? 1 : damp(6, dt));
      u.uOpacity.value = this.skillsMix;
      u.uTime.value = t;
      lines.material.opacity = this.skillsMix * (0.18 + hover * 0.5);
    });

    // Shockwave (intro, scroll collision or a send burst).
    const s = this.shock;
    if (!conv && !this.flash?.isActive()) {
      s.ringOpacity = 0;
      s.burst = 0;
    }
    this.ring.position.copy(s.centre);
    if (!conv) this.ring.quaternion.copy(this.camera.quaternion);
    this.ring.scale.setScalar(Math.max(s.ring, 0.0001));
    this.ring.material.uniforms.uOpacity.value = s.ringOpacity;
    this.ring.visible = s.ringOpacity > 0.01;
    this.burst.position.copy(s.centre);
    this.burst.material.uniforms.uBurst.value = s.burst;
    this.burst.visible = s.burst > 0.001 && s.burst < 0.999;
  }

  private draw() {
    this.composer.render();
    this.frames++;
  }

  /** One frame with everything snapped to its target: the reduced-motion still and paused updates. */
  renderStill() {
    this.update(0, true);
    this.draw();
    this.snapNext = false;
  }

  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min((now - (this.last || now)) / 1000, 0.05);
    // Low tier: 30 fps while idle (no scroll, pointer or transition for 2.5 s), 60 otherwise.
    const idle = now - this.lastInput > 2500 && this.convMode === "off" && !this.flash?.isActive();
    const capped = this.quality.idleCap && idle;
    if (capped && now - this.last < 1000 / 30 - 2) return;
    this.last = now;
    this.time += dt;
    this.update(dt, this.snapNext);
    this.snapNext = false;
    this.draw();
    this.governor.sample(now, capped);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    this.governor.reset();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  get isRunning() {
    return this.running;
  }

  /** The WebGL context, for the quality probe. */
  get gl() {
    return this.renderer.getContext();
  }
}
