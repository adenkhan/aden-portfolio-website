import { gsap, ScrollTrigger } from "../eases";
import type { MomentContext } from "../types";

/**
 * About (docs/MOTION.md moment 4 and §11). The origin-arc panels are laid down like manga panels:
 * each slides in from its own side with a slight rotation and settles, in reading order. Desktop
 * only travels sideways; phones reveal in place (no pin anywhere, no sideways overflow).
 */
export function about(ctx: MomentContext): void {
  const panels = gsap.utils.toArray<HTMLElement>("[data-arc-panel]");
  const sections = gsap.utils.toArray<HTMLElement>('[data-reveal="section"]');
  const lite = ctx.tier === "lite";

  // Start states (set by script only, so the page is fully visible without JavaScript).
  panels.forEach((panel, i) => {
    const fromLeft = i % 2 === 0;
    gsap.set(
      panel,
      ctx.wide
        ? { x: fromLeft ? -24 : 24, y: 16, rotation: fromLeft ? -1.5 : 1.5, opacity: 0 }
        : { y: 16, opacity: 0 },
    );
    const edge = panel.querySelector("[data-arc-edge]");
    if (edge) gsap.set(edge, { scaleX: 0, transformOrigin: "left center" });
  });
  gsap.set(sections, { y: 16, opacity: 0 });

  ScrollTrigger.batch(panels, {
    start: "top 85%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: lite ? 0.45 : 0.6,
        stagger: 0.09,
        ease: "ui-out",
      });
      gsap.to(
        batch.map((panel) => panel.querySelector("[data-arc-edge]")),
        { scaleX: 1, duration: 0.5, stagger: 0.09, delay: 0.15, ease: "ui-out" },
      );
    },
  });

  ScrollTrigger.batch(sections, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { y: 0, opacity: 1, duration: lite ? 0.4 : 0.5, stagger: 0.08, ease: "ui-out" }),
  });
}
