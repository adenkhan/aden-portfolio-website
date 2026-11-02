import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, ScrollTrigger } from "../eases";
import type { MomentContext } from "../types";
import { wipes } from "./wipes";

gsap.registerPlugin(DrawSVGPlugin, ScrambleTextPlugin);

/**
 * About (docs/MOTION.md §15, r5).
 * - Bio: the three lines rise in reading order after the H1.
 * - Origin arcs: each panel SLAMS in like a manga panel (drops from scale 1.12 with a tilt, hits in
 *   0.32 s), then an impact flash, a short shake and speed lines drawing outward. It fires on the same
 *   trigger (top at 70%) that lights the panel's node on the 3D path.
 * - Education chips stamp in; the "Next quest" label decodes. Both sections are uncovered by a wipe.
 * No pin anywhere, no sideways overflow; phones get a smaller slam without the tilt.
 */
export function about(ctx: MomentContext): () => void {
  const lite = ctx.tier === "lite";
  const panels = gsap.utils.toArray<HTMLElement>("[data-arc-panel]");
  const lines = gsap.utils.toArray<HTMLElement>(".bio-line");
  const chips = gsap.utils.toArray<HTMLElement>("#education li");
  const quest = document.querySelector<HTMLElement>("#goals .label");

  // Bio lines: after the H1's characters have mostly landed.
  gsap.from(lines, { y: 16, opacity: 0, duration: 0.5, stagger: 0.12, delay: 0.45, ease: "ui-out" });

  // Arcs: start states set by script only, so the page is complete without JavaScript.
  panels.forEach((panel, i) => {
    const tilt = i % 2 === 0 ? -2 : 2;
    gsap.set(
      panel,
      ctx.wide ? { scale: 1.12, y: -30, rotation: tilt, opacity: 0 } : { scale: 1.06, y: -16, opacity: 0 },
    );
    gsap.set(panel.querySelector("[data-arc-edge]"), { scaleX: 0, transformOrigin: "left center" });
    const rays = panel.querySelectorAll("[data-speed-lines] line");
    const flash = panel.querySelector("[data-impact-flash]");

    ScrollTrigger.create({
      trigger: panel,
      start: "top 70%",
      once: true,
      onEnter: () => {
        // Panels side by side never slam at the same instant: the right one hits a beat later.
        gsap
          .timeline({ delay: ctx.wide && i % 2 ? 0.14 : 0 })
          // The drop: accelerating into the hit, like a panel slammed onto the page.
          .to(panel, {
            scale: 1,
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: lite ? 0.26 : 0.32,
            ease: "power4.in",
          })
          // Impact frame: a one-beat flash, then the panel shakes once.
          .fromTo(flash, { opacity: 0.45 }, { opacity: 0, duration: 0.18, ease: "power2.out" })
          .to(panel, { keyframes: { x: [-4, 4, -2, 0] }, duration: 0.25, ease: "none" }, "<")
          // Speed lines burst outward and fade.
          .set(panel.querySelector("[data-speed-lines]"), { opacity: 0.55 }, "<")
          .fromTo(rays, { drawSVG: "0% 0%" }, { drawSVG: "40% 100%", duration: 0.3, ease: "ui-out" }, "<")
          .to(panel.querySelector("[data-speed-lines]"), { opacity: 0, duration: 0.25 }, ">-0.05")
          .to(panel.querySelector("[data-arc-edge]"), { scaleX: 1, duration: 0.4, ease: "ui-out" }, "<");
      },
    });
  });

  // Education: the chips stamp in as the wipe uncovers them.
  gsap.set(chips, { scale: 1.25, rotation: -4, opacity: 0 });
  ScrollTrigger.create({
    trigger: "#education",
    start: "top 85%",
    once: true,
    onEnter: () =>
      gsap.to(chips, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 0.35,
        stagger: 0.1,
        delay: 0.35,
        ease: "back.out(2)",
      }),
  });

  // Next quest: the label decodes like a level loading.
  if (quest) {
    const text = (quest.textContent ?? "").trim();
    ScrollTrigger.create({
      trigger: "#goals",
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(quest, {
          duration: 0.6,
          delay: 0.35,
          scrambleText: { text, chars: "01", revealDelay: 0.15 },
          ease: "none",
        }),
    });
  }

  return wipes(["#education", "#goals"]);
}
