import { ScrollTrigger } from "@/lib/motion/eases";
import { detectTier } from "./quality";
import { resolveWorld } from "./ready";
import { World, type Station } from "./scene";

const STATIONS: Record<string, Station> = { home: "home", about: "about", work: "work", contact: "contact" };

declare global {
  interface Window {
    __akWorld?: { world: World; readonly debug: World["debug"] };
  }
}

/** Reads the GPU once on a throwaway context, then releases it, so the world starts at the right tier. */
function probeTier() {
  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGL2RenderingContext | null;
  if (!gl) return "low" as const;
  const tier = detectTier(gl);
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return tier;
}

/**
 * Starts the persistent world in its host (mounted once by BaseLayout with transition:persist) and
 * wires each page to it: the route picks the station, ScrollTrigger feeds scroll progress, DOM
 * elements are the anchors. Page wiring is rebuilt on every astro:page-load and torn down on
 * astro:before-swap; the world itself is never rebuilt.
 */
export function startWorld(host: HTMLElement, reduced: boolean): World | null {
  let world: World;
  try {
    world = new World(host, probeTier());
  } catch (error) {
    console.warn("[world] fallback to the CSS orbs", error);
    host.dataset.state = "fallback";
    resolveWorld(null);
    return null;
  }
  host.dataset.state = reduced ? "static" : "ready";
  world.stillMode = reduced;
  host.dataset.quality = world.debug.tier;
  window.__akWorld = {
    world,
    get debug() {
      return world.debug;
    },
  };

  let teardown: (() => void) | null = null;
  const setupPage = () => {
    teardown?.();
    teardown = wirePage(world, reduced);
  };
  setupPage();
  document.addEventListener("astro:page-load", setupPage);
  document.addEventListener("astro:before-swap", () => {
    teardown?.();
    teardown = null;
  });
  // Hand-off (r5): the camera starts flying to the destination's station on click, while the router
  // fetches the page, so the 3D move and the page transition happen together.
  document.addEventListener("astro:before-preparation", (event) => {
    const to = (event as Event & { to?: URL }).to;
    if (!to || to.origin !== location.origin) return;
    const page = to.pathname.replace(/^\/|\/$/g, "") || "home";
    world.setStation(STATIONS[page] ?? "rest");
  });

  // Pause when the tab is hidden or the canvas is not on screen; reduced motion never runs a loop.
  const sync = () => {
    if (reduced) return;
    const visible = document.visibilityState === "visible" && onScreen;
    if (visible) world.start();
    else world.stop();
  };
  let onScreen = true;
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  }).observe(host);
  document.addEventListener("visibilitychange", sync);
  new ResizeObserver(() => world.resize()).observe(host);

  if (reduced) requestAnimationFrame(() => world.renderStill());
  else sync();
  // The canvas fades in over the CSS orbs once it has drawn a frame.
  requestAnimationFrame(() => host.classList.add("world-live"));
  resolveWorld(world);
  return world;
}

function wirePage(world: World, reduced: boolean): () => void {
  const page = document.body.dataset.page ?? "";
  const station = STATIONS[page] ?? "rest";
  const input = world.input;
  const cleanups: Array<() => void> = [];
  const triggers: ScrollTrigger[] = [];

  Object.assign(input, {
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
  });

  const on = <K extends keyof WindowEventMap>(
    target: Window | Element,
    type: K | string,
    fn: (e: Event) => void,
  ) => {
    target.addEventListener(type, fn, { passive: true });
    cleanups.push(() => target.removeEventListener(type, fn));
  };

  if (station === "home") {
    input.hero = document.querySelector("[data-pointer-glow-host]");
    input.teaser = document.querySelector("[data-teaser] [data-collide]");
    // Convergence scrub (r7): the Home motion pins CREATIVE · DATA · GROWTH and reports its progress.
    on(window, "ak:convergence-progress", (event) => {
      input.teaserProgress = (event as CustomEvent<{ progress: number }>).detail.progress;
      world.notifyInput();
    });
  }

  if (station === "about") {
    const panels = document.querySelector("[data-arc-panel]")?.parentElement;
    if (panels && !reduced)
      triggers.push(
        ScrollTrigger.create({
          trigger: panels,
          start: "top 75%",
          end: "bottom 35%",
          onUpdate: (self) => (input.aboutProgress = self.progress),
        }),
      );
    document.querySelectorAll("[data-arc-panel]").forEach((panel, i) => {
      if (reduced) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: panel,
          start: "top 70%",
          onEnter: () => (input.arcsLit = Math.max(input.arcsLit, i + 1)),
          onLeaveBack: () => (input.arcsLit = i),
        }),
      );
    });
    // Still frame: every node lit, framed on the early path (clear of the H1).
    if (reduced) {
      input.aboutProgress = 0.35;
      input.arcsLit = 4;
    }
  }

  if (station === "work") {
    // The Work motion layer reports the case in view (pinned sideways sequence on desktop, vertical
    // stack on phones) with ak:case-active; the camera pulls to that case's formation (r4).
    on(window, "ak:case-active", (event) => {
      input.activeCase = (event as CustomEvent<{ index: number }>).detail.index;
      world.notifyInput();
    });
    const tree = document.querySelector("[data-tree]");
    input.lanes = [...document.querySelectorAll("[data-tree-lane]")];
    if (tree && !reduced)
      triggers.push(
        ScrollTrigger.create({
          trigger: tree,
          start: "top 75%",
          end: "bottom 25%",
          onToggle: (self) => {
            input.skills = self.isActive;
            world.notifyInput();
          },
        }),
      );
    input.lanes.forEach((lane, i) => {
      const enter = () => {
        input.laneHover = i;
        world.notifyInput();
      };
      const leave = () => {
        if (input.laneHover === i) input.laneHover = -1;
      };
      on(lane, "pointerenter", enter);
      on(lane, "pointerleave", leave);
      on(lane, "focusin", enter);
      on(lane, "focusout", leave);
    });
  }

  if (station === "contact") {
    input.contact = document.querySelector(".terminal");
    const burst = (event: Event) => {
      const { x, y } = (event as CustomEvent<{ x: number; y: number }>).detail;
      world.burstAt(x, y);
    };
    on(window, "ak:burst", burst);
  }

  // The orbs lean toward a fine pointer; any input keeps the low tier at full frame rate.
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  on(window, "pointermove", (event) => {
    const e = event as PointerEvent;
    if (fine) {
      input.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      input.pointer.y = -((e.clientY / innerHeight) * 2 - 1);
      input.pointer.active = station === "home";
    }
    world.notifyInput();
  });
  on(window, "scroll", () => world.notifyInput());
  input.pointer.active = false;

  // First visit of the session lands without a flight; navigation flies between stations.
  world.setStation(station, !world.isRunning && world.frames === 0);
  if (reduced) requestAnimationFrame(() => world.renderStill());

  return () => {
    triggers.forEach((t) => t.kill());
    cleanups.forEach((fn) => fn());
  };
}
