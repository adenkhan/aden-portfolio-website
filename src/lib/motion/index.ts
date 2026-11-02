import type { PageId } from "@/data/types";
import { gsap, registerCore } from "./eases";
import { startLenis } from "./lenis";
import { headlines } from "./moments/headline";
import { particles } from "./moments/particles";
import { pointerGlow } from "./moments/pointer-glow";
import { getTier, type MotionTier } from "./tier";
import type { MomentContext } from "./types";

export interface MotionHandle {
  tier: MotionTier;
  destroy(): void;
}

/**
 * Boots motion for one page (docs/ENGINEERING-PLAN.md §5). Pages are separate documents
 * (no client router, ADR-001), so this runs once per load and needs no swap handling.
 * All hidden start states are set here, after the inline gate in <head> added html.motion-pending.
 */
export function initMotion(page: PageId): MotionHandle {
  const root = document.documentElement;
  const tier = getTier();
  root.dataset.motion = tier;
  root.dataset.page = page;

  if (tier === "reduced") {
    root.classList.remove("motion-pending");
    return { tier, destroy: () => {} };
  }

  registerCore();
  const mm = gsap.matchMedia();

  mm.add(
    {
      ok: "(prefers-reduced-motion: no-preference)",
      fine: "(hover: hover) and (pointer: fine)",
      wide: "(min-width: 768px)",
    },
    (context) => {
      const { ok, fine, wide } = context.conditions as Record<string, boolean>;
      if (!ok) {
        root.classList.remove("motion-pending");
        root.dataset.motion = "reduced";
        return;
      }

      const ctx: MomentContext = { tier, fine, wide, add: (fn) => context.add(fn) };
      const cleanups: Array<() => void> = [];
      const scroll = startLenis();
      cleanups.push(scroll.stop);
      // The CV dialog locks background scroll while it is open.
      const lock = () => scroll.lenis.stop();
      const unlock = () => scroll.lenis.start();
      window.addEventListener("ak:scroll-lock", lock);
      window.addEventListener("ak:scroll-unlock", unlock);
      cleanups.push(() => {
        window.removeEventListener("ak:scroll-lock", lock);
        window.removeEventListener("ak:scroll-unlock", unlock);
      });
      // The Home intro owns the screen while it plays; smooth scroll resumes when it ends.
      if (root.classList.contains("intro")) {
        scroll.lenis.stop();
        window.addEventListener("ak:intro-end", () => scroll.lenis.start(), { once: true });
      }

      // Page-specific moments load only on their page.
      const pageMoments =
        page === "home"
          ? import("./moments/home").then(async (m) => {
              const cleanup = await m.home(ctx);
              if (cleanup) cleanups.push(cleanup);
            })
          : Promise.resolve();

      // Every hidden start state is set before html.motion-pending is removed.
      Promise.allSettled([
        headlines(ctx).catch((error) => console.warn("[motion] headline reveal skipped", error)),
        pageMoments.catch((error) => console.warn("[motion] page moments skipped", error)),
      ]).finally(() => root.classList.remove("motion-pending"));

      for (const moment of [pointerGlow, particles]) {
        const cleanup = moment(ctx);
        if (cleanup) cleanups.push(cleanup);
      }

      return () => cleanups.forEach((fn) => fn());
    },
  );

  if (import.meta.env.DEV) import("./dev-hud").then((m) => m.startDevHud(tier));

  const destroy = () => mm.revert();
  // A normal unload tears everything down; a bfcache restore keeps the running state.
  window.addEventListener("pagehide", (event) => {
    if (!event.persisted) destroy();
  });
  return { tier, destroy };
}
