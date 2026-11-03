import type { PageId } from "@/data/types";
import { gsap, registerCore } from "./eases";
import { startLenis } from "./lenis";
import { cursor } from "./moments/cursor";
import { speedLines } from "./moments/speed";
import { headlines } from "./moments/headline";
import { pointerGlow } from "./moments/pointer-glow";
import { getTier, type MotionTier } from "./tier";
import type { MomentContext } from "./types";

export interface MotionHandle {
  tier: MotionTier;
  destroy(): void;
}

/**
 * Boots motion for one page (docs/ENGINEERING-PLAN.md §5). Since r3 the client router can swap pages
 * in without a reload, so BaseLayout calls this per page and calls destroy() before each swap.
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
      const loaders: Partial<Record<PageId, () => Promise<(() => void) | void>>> = {
        home: () => import("./moments/home").then((m) => m.home(ctx)),
        about: () => import("./moments/about").then((m) => ctx.add(() => m.about(ctx))),
        work: () => import("./moments/work").then((m) => ctx.add(() => m.work(ctx))),
        contact: () => import("./moments/contact").then((m) => ctx.add(() => m.contact(ctx))),
      };
      // Start page moments after the first frame, so their setup never delays the first paint
      // (the LCP image on Work). Their hidden start states come from html.motion-pending meanwhile.
      const afterFirstFrame = new Promise<void>((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve)),
      );
      const pageMoments = afterFirstFrame
        .then(() => loaders[page]?.())
        .then((cleanup) => {
          if (typeof cleanup === "function") cleanups.push(cleanup);
        });

      // Every hidden start state is set before html.motion-pending is removed.
      Promise.allSettled([
        headlines(ctx).catch((error) => console.warn("[motion] headline reveal skipped", error)),
        pageMoments.catch((error) => console.warn("[motion] page moments skipped", error)),
      ]).finally(() => root.classList.remove("motion-pending"));

      // Ambient particles now live on the GPU in the persistent world (r3), not in tsParticles.
      for (const moment of [pointerGlow, cursor, speedLines]) {
        const cleanup = moment(ctx);
        if (cleanup) cleanups.push(cleanup);
      }

      return () => cleanups.forEach((fn) => fn());
    },
  );

  if (import.meta.env.DEV && !document.querySelector("[data-dev-hud]"))
    import("./dev-hud").then((m) => m.startDevHud(tier));

  return { tier, destroy: () => mm.revert() };
}
