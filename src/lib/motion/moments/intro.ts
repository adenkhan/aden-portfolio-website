import { isLowPower, isMobileViewport } from "@/components/three/capability";
import { create2dStage } from "@/components/three/orbs-2d";
import type { IntroStage, IntroState, StageGeometry } from "@/components/three/stage";
import { worldReady } from "@/components/world/ready";
import { gsap, registerCore } from "../eases";

export const INTRO_REVEAL = "ak:intro-reveal";
export const INTRO_END = "ak:intro-end";
/** How long the intro waits for the persistent world before playing the 2D version. */
const WORLD_TIMEOUT_MS = 600;

/** Collision point: the avatar card's centre, kept inside the first screen on phones. */
function geometry(host: HTMLElement): StageGeometry {
  // The overlay excludes the reserved scrollbar gutter, so size the stage to it, not the window.
  const width = host.clientWidth || window.innerWidth;
  const height = host.clientHeight || window.innerHeight;
  const card = document.querySelector("[data-pointer-glow-host]")?.getBoundingClientRect();
  const x = card ? card.left + card.width / 2 : width / 2;
  const y = card ? Math.min(card.top + card.height / 2, height * 0.62) : height / 2;
  return { x, y, width, height, mobile: isMobileViewport() };
}

/** Round 2 (r3): every tier gets the 3D intro through the world; ?intro=2d forces the 2D version. */
function wants3d(): boolean {
  return new URLSearchParams(location.search).get("intro") !== "2d";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}

/**
 * Home intro (docs/MOTION.md moment 1). The inline IntroGate in <head> decides whether it plays
 * (once per session, never for reduced motion) and shows the overlay from the first frame.
 * The hero underneath is ordinary server-rendered HTML; this only animates an overlay above it.
 */
export async function runIntro(): Promise<void> {
  const root = document.documentElement;
  const overlay = document.querySelector<HTMLElement>("[data-intro]");
  const stageHost = overlay?.querySelector<HTMLElement>("[data-intro-stage]");
  if (!root.classList.contains("intro") || !overlay || !stageHost) return;
  root.classList.add("intro-running");

  let stage: IntroStage | null = null;
  let timeline: gsap.core.Timeline | null = null;
  // The persistent world's host: in 3D mode the intro plays on its canvas, raised above the page.
  const worldHost = document.querySelector<HTMLElement>("[data-world]");
  let worldMode = false;
  let revealed = false;
  let finished = false;

  const reveal = (instant: boolean) => {
    if (revealed) return;
    revealed = true;
    window.dispatchEvent(new CustomEvent(INTRO_REVEAL, { detail: { instant } }));
  };

  const cleanUp = () => {
    gsap.ticker.remove(draw);
    const done = stage;
    stage = null;
    const focusInside = overlay.contains(document.activeElement);
    overlay.remove();
    root.classList.remove("intro", "intro-running", "intro-skipped", "intro-world");
    if (worldMode && worldHost) {
      // The world drops back behind the page and fades in there, now as the ambient scene.
      done?.dispose();
      gsap.fromTo(
        worldHost,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "ui-out", clearProps: "opacity" },
      );
      if (focusInside) document.getElementById("main")?.focus({ preventScroll: true });
      window.dispatchEvent(new Event(INTRO_END));
      return;
    }
    if (focusInside) document.getElementById("main")?.focus({ preventScroll: true });
    window.dispatchEvent(new Event(INTRO_END));

    // Free GPU memory once the page is idle, so disposal never competes with the hero reveal.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(() => {
      performance.mark("intro-dispose-start");
      done?.dispose();
      performance.measure("intro-dispose", "intro-dispose-start");
    });
  };

  const finish = (skipped: boolean) => {
    if (finished) return;
    finished = true;
    timeline?.kill();
    reveal(skipped);
    if (skipped) {
      overlay.style.pointerEvents = "none";
      if (worldMode && worldHost) gsap.to(worldHost, { opacity: 0, duration: 0.15, ease: "ui-out" });
      gsap.to(overlay, { opacity: 0, duration: 0.15, ease: "ui-out", onComplete: cleanUp });
    } else {
      cleanUp();
    }
  };

  const onKey = (event: KeyboardEvent) => event.key === "Escape" && finish(true);
  overlay.querySelector("[data-intro-skip]")?.addEventListener("click", () => finish(true));
  window.addEventListener("keydown", onKey);
  window.addEventListener(INTRO_END, () => window.removeEventListener("keydown", onKey), { once: true });

  // Esc pressed before this bundle loaded (handled by the inline gate).
  if (root.classList.contains("intro-skipped")) return finish(true);

  const state: IntroState = {
    redX: 0,
    redY: 0,
    blueX: 0,
    blueY: 0,
    orbScale: 0.3,
    orbOpacity: 0,
    coreScale: 0.4,
    coreOpacity: 0,
    ringScale: 0.1,
    ringOpacity: 0,
    burst: 0,
    bloom: 0.3,
    aberration: 0,
  };
  function draw() {
    stage?.render(state);
  }

  try {
    registerCore();
    const g = geometry(stageHost);
    if (wants3d()) {
      const world = await withTimeout(worldReady, WORLD_TIMEOUT_MS).catch(() => null);
      if (world && !finished && worldHost) {
        stage = world.introStage(g);
        worldMode = true;
        root.classList.add("intro-world");
      }
    }
    if (finished) {
      stage?.dispose();
      return;
    }
    stage ??= create2dStage(stageHost, g);
    root.dataset.introMode = stage.mode;

    // Phones and low-power devices get the shorter cut (MOTION.md: 2.0 s vs 2.6 s budget).
    const s = g.mobile || isLowPower() ? 0.77 : 1;
    const spread = stage.orbSize * 0.85;
    const lift = g.height * 0.04;
    Object.assign(state, {
      redX: g.x - spread,
      redY: g.y - lift,
      blueX: g.x + spread,
      blueY: g.y - lift,
    });

    gsap.ticker.add(draw);
    performance.mark("intro-timeline-start");
    timeline = gsap.timeline({
      defaults: { ease: "ui-out" },
      onComplete: () => {
        performance.measure("intro-timeline", "intro-timeline-start");
        finish(false);
      },
    });
    timeline
      // Charge: both orbs gather light where the avatar stands.
      .to(state, { orbOpacity: 1, orbScale: 1, bloom: 0.6, duration: 0.45 * s }, 0)
      // Anticipation: a 24 px pull apart before the strike.
      .to(state, { redX: `-=24`, blueX: `+=24`, duration: 0.12 * s }, 0.45 * s)
      // Converge on the collision point.
      .to(
        state,
        {
          redX: g.x,
          redY: g.y,
          blueX: g.x,
          blueY: g.y,
          orbScale: 0.8,
          duration: 0.43 * s,
          ease: "ui-in-out",
        },
        0.57 * s,
      )
      // Collision: orbs merge into the purple core, bloom spikes, the shockwave and burst go out.
      .to(state, { orbOpacity: 0, duration: 0.12 * s }, 1.0 * s)
      // fromTo tweens later in the timeline must not apply their start values when it is built.
      .fromTo(
        state,
        { coreOpacity: 0, coreScale: 0.4 },
        { coreOpacity: 1, coreScale: 1, duration: 0.16 * s, immediateRender: false },
        1.0 * s,
      )
      .to(state, { bloom: 1, duration: 0.16 * s }, 1.0 * s)
      .to(state, { bloom: 0.4, duration: 0.4 * s }, 1.16 * s)
      .fromTo(
        state,
        { ringScale: 0.1, ringOpacity: 1 },
        { ringScale: 3.2, duration: 0.7 * s, immediateRender: false },
        1.0 * s,
      )
      .to(state, { ringOpacity: 0, duration: 0.3 * s }, 1.4 * s)
      .fromTo(state, { burst: 0 }, { burst: 1, duration: 0.7 * s, immediateRender: false }, 1.0 * s)
      .fromTo(
        state,
        { aberration: g.mobile ? 0 : 0.004 },
        { aberration: 0, duration: 0.4 * s, immediateRender: false },
        1.0 * s,
      )
      // Reveal: the overlay (2D) or the raised world canvas (3D) fades, the hero underneath assembles.
      .call(() => (overlay.style.pointerEvents = "none"), [], 1.15 * s)
      .to(
        worldMode && worldHost ? [overlay, worldHost] : overlay,
        { opacity: 0, duration: 0.45 * s },
        1.15 * s,
      )
      .call(() => reveal(false), [], 1.3 * s);
  } catch (error) {
    console.warn("[intro] skipped", error);
    finish(true);
  }
}
