import {
  Color,
  DirectionalLight,
  type Material,
  type Mesh,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { type VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import type { World, WorldOverlay } from "@/components/world/scene";
import { applyLook, boneWorld, frame, relaxedPose, type Shot } from "./look";
import { type ExpressionName, Rig } from "./rig";

export const AVATAR_URL = "/models/avatar.vrm";
/** The expressions the site drives; checked against the model on load (docs/ASSETS.md). */
export const USED_EXPRESSIONS: ExpressionName[] = ["happy", "surprised", "angry", "relaxed"];
/** --color-bg-surface (DESIGN.md), the Home card's colour. */
const SURFACE = new Color("#12152a");

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The owner's VRoid avatar in the persistent world (r9, docs/MOTION.md §24). One instance for the whole
 * visit: loaded once, after first paint, kept across page swaps. It draws with the world's renderer,
 * after the world, into a scissored viewport over its page's DOM anchor ([data-avatar-anchor]), with
 * the same camera framing as the poster, so the poster-to-3D swap shows no jump.
 */
export class Avatar implements WorldOverlay {
  readonly scene = new Scene();
  readonly camera = new PerspectiveCamera(20, 0.8, 0.1, 20);
  readonly rig: Rig;
  private anchor: HTMLElement | null = null;
  private clearEl: HTMLElement | null = null;
  private shot: Shot = "card";
  /** Where she is drawn this frame, in viewport pixels. */
  box: Box | null = null;
  private floatFrom: Box | null = null;
  private floatT = 1;
  private visible = false;
  private shown = false;
  private readonly rims: DirectionalLight[];
  private readonly pointer = new Vector2();
  private pointerActive = false;
  private lookOverride: { at: Vector3; until: number } | null = null;
  private lastConvTime = -1;
  private readonly size = new Vector2();
  private readonly tmp = new Vector3();
  private readonly listeners: Array<() => void> = [];

  constructor(
    readonly vrm: VRM,
    private readonly lite: boolean,
  ) {
    this.scene.add(vrm.scene);
    applyLook(this.scene);
    // Red and blue rims, only during a cast and only from behind, so her skin keeps its colour.
    this.rims = [new DirectionalLight(0xff4d6a, 0), new DirectionalLight(0x3db0ff, 0)];
    this.rims[0].position.set(-2, 0.6, -1.6);
    this.rims[1].position.set(2, 0.6, -1.6);
    this.scene.add(...this.rims);
    relaxedPose(vrm);
    this.rig = new Rig(vrm);
    // Phones and low tier: no MToon outlines (an extra pass per mesh).
    if (lite)
      vrm.scene.traverse((o) => {
        const mats = (o as Mesh).material as Material | Material[] | undefined;
        for (const m of Array.isArray(mats) ? mats : mats ? [mats] : [])
          if ((m as Material & { isOutline?: boolean }).isOutline) m.visible = false;
      });
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      this.pointer.set(e.clientX, e.clientY);
      this.pointerActive = true;
    };
    addEventListener("pointermove", move, { passive: true });
    this.listeners.push(() => removeEventListener("pointermove", move));
  }

  /** Finds this page's anchor. Called on every page load; a new anchor makes her float there. */
  attach(): void {
    const next = document.querySelector<HTMLElement>("[data-avatar-anchor]");
    if (this.box && next !== this.anchor) {
      this.floatFrom = { ...this.box };
      this.floatT = 0;
    }
    this.anchor = next;
    this.shot = next?.dataset.avatarAnchor === "face" ? "face" : "card";
    this.clearEl = next?.closest<HTMLElement>("[data-avatar-clear]") ?? null;
    this.shown = false;
  }

  /** Looks at a point on the page (viewport px) for a while, e.g. a panel slamming in. */
  glance(x: number, y: number, seconds = 1.2): void {
    this.lookOverride = { at: this.screenToLook(x, y), until: performance.now() + seconds * 1000 };
  }

  private screenToLook(x: number, y: number): Vector3 {
    const b = this.box;
    if (!b) return new Vector3(0, 0, 1.2);
    const nx = (x - (b.x + b.w / 2)) / Math.max(innerWidth / 2, 1);
    const ny = (y - (b.y + b.h * 0.2)) / Math.max(innerHeight / 2, 1);
    return new Vector3(nx * 0.9, -ny * 0.5, 1.2);
  }

  private targetBox(world: World): Box | null {
    const conv = world.convergence;
    if (conv && world.currentStation === "home") {
      // The cast: she stands behind the vortex, her chest at its centre.
      const h = Math.min(innerHeight * 0.95, conv.size * 1.5);
      const w = h * 0.8;
      return { x: conv.x - w / 2, y: conv.y - h * 0.42, w, h };
    }
    if (!this.anchor) return null;
    const r = this.anchor.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return null;
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }

  update(dt: number, world: World): void {
    const target = this.targetBox(world);
    const conv = world.convergence;
    if (!target) {
      this.visible = false;
      world.hands.red = world.hands.blue = null;
      return;
    }
    // Floating between stations after a page change (0.9 s); otherwise she tracks her anchor exactly.
    if (this.floatT < 1 && this.floatFrom) {
      this.floatT = Math.min(1, this.floatT + dt / 0.9);
      const k = smooth(0, 1, this.floatT);
      const f = this.floatFrom;
      this.box = {
        x: f.x + (target.x - f.x) * k,
        y: f.y + (target.y - f.y) * k,
        w: f.w + (target.w - f.w) * k,
        h: f.h + (target.h - f.h) * k,
      };
    } else this.box = target;
    const b = this.box;
    this.visible = b.y < innerHeight && b.y + b.h > 0 && b.x < innerWidth && b.x + b.w > 0;
    // Off screen: no updates at all (pause), and no hands for the orbs.
    if (!this.visible) {
      world.hands.red = world.hands.blue = null;
      return;
    }

    // The cast (Convergence): poses by timeline time, so scrolling back reverses her motion.
    let wind = 0;
    if (conv) {
      const t = conv.time;
      const ready = smooth(0, 0.5, t);
      const charge = smooth(1.2, 2.2, t);
      const release = smooth(2.75, 3.05, t);
      this.rig.scrub = {
        castReady: ready * (1 - charge),
        castCharge: charge * (1 - release),
        castRelease: release * (1 - smooth(3.3, 3.5, t)),
        idle: smooth(3.3, 3.5, t),
      };
      const focus = smooth(1.2, 2.4, t) * (1 - release);
      this.rig.drive.angry = focus * 0.25;
      this.rig.drive.relaxed = focus * 0.35;
      wind = smooth(0.8, 1.6, t) * (1 - smooth(2.9, 3.3, t)) * 1.4;
      // The collision flash: surprised, once per pass.
      if (this.lastConvTime < 2.95 && t >= 2.95) this.rig.express("surprised", 0.7, 0.35);
      this.lastConvTime = t;
      // Subtle red and blue rims while charging; a brief purple at the release, then her normal light.
      const rim = smooth(1.2, 2.0, t) * (1 - smooth(3.0, 3.4, t));
      this.rims[0].intensity = rim * 1.1;
      this.rims[1].intensity = rim * 1.1;
      const purple = smooth(2.9, 3.05, t) * (1 - smooth(3.15, 3.45, t));
      if (purple > 0) {
        this.rims[0].color.set(0xa77cff);
        this.rims[1].color.set(0xa77cff);
        this.rims[0].intensity = this.rims[1].intensity = purple * 1.4;
      } else {
        this.rims[0].color.set(0xff4d6a);
        this.rims[1].color.set(0x3db0ff);
      }
      // The camera dollies toward her face as the charge peaks.
      this.camDolly = smooth(1.4, 2.6, t) * (1 - release);
    } else {
      this.rig.scrub = null;
      this.rig.drive.angry = this.rig.drive.relaxed = 0;
      this.rims[0].intensity = this.rims[1].intensity = 0;
      this.camDolly = 0;
      this.lastConvTime = -1;
    }

    // Eyes and head: a glance, the cursor (desktop), or a gentle drift (touch).
    let look: Vector3 | null = null;
    if (this.lookOverride && performance.now() < this.lookOverride.until) look = this.lookOverride.at;
    else if (this.pointerActive && !conv) look = this.screenToLook(this.pointer.x, this.pointer.y);
    else if (conv) look = new Vector3(0, -0.05, 1.2);
    const lenis = (window as unknown as { __akLenis?: { velocity: number } }).__akLenis;
    this.rig.update(dt, { scroll: lenis?.velocity ?? 0, wind, look });

    this.frameCamera(conv ? "card" : this.shot);
    // Her hands, in viewport pixels, for the orbs to ignite in (raw bones: the real hand positions).
    if (conv) {
      world.hands.red = this.toScreen(boneWorld(this.vrm, "rightHand", this.tmp));
      world.hands.blue = this.toScreen(boneWorld(this.vrm, "leftHand", this.tmp));
    } else world.hands.red = world.hands.blue = null;
  }

  private camDolly = 0;

  private frameCamera(shot: Shot): void {
    const b = this.box!;
    this.camera.aspect = b.w / b.h;
    // Every station uses the poster framing (head to hips); only its size on the page changes.
    frame(this.camera, this.vrm, shot === "face" ? "face" : "card");
    if (this.camDolly > 0) {
      const head = boneWorld(this.vrm, "head", this.tmp);
      const aim = new Vector3(head.x, head.y - 0.05, head.z);
      this.camera.position.lerp(aim.clone().setZ(head.z + 1.2), this.camDolly * 0.45);
      this.camera.lookAt(aim.lerp(new Vector3(head.x, head.y - 0.28, head.z), 1 - this.camDolly));
    }
    this.camera.updateProjectionMatrix();
  }

  private toScreen(p: Vector3): { x: number; y: number } {
    const b = this.box!;
    const v = p.clone().project(this.camera);
    return { x: b.x + ((v.x + 1) / 2) * b.w, y: b.y + ((1 - v.y) / 2) * b.h };
  }

  render(renderer: WebGLRenderer): void {
    const b = this.box;
    if (!this.visible || !b) return;
    renderer.getSize(this.size);
    const H = this.size.y;
    const tone = renderer.toneMapping;
    const auto = renderer.autoClear;
    renderer.toneMapping = NoToneMapping;
    renderer.autoClear = false;
    renderer.setScissorTest(true);
    // The card behind her (Home): painted in the card's colour, so the card can let the canvas through.
    if (this.clearEl && this.floatT >= 1) {
      const c = this.clearEl.getBoundingClientRect();
      renderer.setScissor(c.left, H - c.bottom, c.width, c.height);
      renderer.setViewport(c.left, H - c.bottom, c.width, c.height);
      renderer.setClearColor(SURFACE, 1);
      renderer.clear(true, true, false);
    }
    renderer.setScissor(b.x, H - b.y - b.h, b.w, b.h);
    renderer.setViewport(b.x, H - b.y - b.h, b.w, b.h);
    renderer.clearDepth();
    renderer.render(this.scene, this.camera);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, this.size.x, this.size.y);
    renderer.toneMapping = tone;
    renderer.autoClear = auto;
    if (!this.shown) {
      this.shown = true;
      // The poster fades out over her once she has drawn (same framing: no jump).
      requestAnimationFrame(() => this.clearEl?.classList.add("is-live"));
    }
  }

  dispose(): void {
    this.listeners.forEach((fn) => fn());
  }
}

const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/** Optional .vrma clips (docs/ASSETS.md): file names map to poses, e.g. cast-ready.vrma → castReady. */
async function loadClips(avatar: Avatar): Promise<void> {
  const host = document.querySelector<HTMLElement>("[data-world]");
  const urls = JSON.parse(host?.dataset.vrma || "{}") as Record<string, string>;
  if (!Object.keys(urls).length) return;
  try {
    const { VRMAnimationLoaderPlugin, createVRMAnimationClip } = await import("@pixiv/three-vrm-animation");
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMAnimationLoaderPlugin(parser));
    const clips: Record<string, ReturnType<typeof createVRMAnimationClip>> = {};
    for (const [file, url] of Object.entries(urls)) {
      const gltf = await loader.loadAsync(url);
      const animation = gltf.userData.vrmAnimations?.[0];
      if (!animation) continue;
      const pose = file.replace(/-(w)/g, (_, c: string) => c.toUpperCase());
      clips[pose] = createVRMAnimationClip(animation, avatar.vrm);
    }
    avatar.rig.useClips(clips);
  } catch (error) {
    console.warn("[avatar] animation clips skipped; procedural poses stay", error);
  }
}

/**
 * Loads the model (after first paint), with progress, and attaches it to the world. Resolves to null
 * when it cannot load; the poster stays.
 */
export async function loadAvatar(
  world: World,
  lite: boolean,
  onProgress: (share: number) => void,
): Promise<Avatar | null> {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  try {
    const gltf = await loader.loadAsync(AVATAR_URL, (e) => e.total && onProgress(e.loaded / e.total));
    const vrm = gltf.userData.vrm as VRM;
    // Long tasks split with yields, so input is answered between them.
    await yieldToMain();
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    await yieldToMain();
    VRMUtils.combineSkeletons(gltf.scene);
    vrm.scene.traverse((o) => (o.frustumCulled = false));
    await yieldToMain();
    const avatar = new Avatar(vrm, lite);
    // Compile her shaders without blocking (KHR_parallel_shader_compile where available).
    await world.compileOverlay(avatar.scene, avatar.camera);
    const missing = USED_EXPRESSIONS.filter((n) => !avatar.rig.expressions.includes(n));
    if (missing.length) console.warn("[avatar] expressions missing from the model:", missing.join(", "));
    await loadClips(avatar);
    avatar.attach();
    world.overlay = avatar;
    onProgress(1);
    return avatar;
  } catch (error) {
    console.warn("[avatar] staying on the poster", error);
    return null;
  }
}
