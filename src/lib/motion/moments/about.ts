import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, ScrollTrigger } from "../eases";
import type { MomentContext } from "../types";
import { wipes } from "./wipes";

gsap.registerPlugin(DrawSVGPlugin, ScrambleTextPlugin);

/** Desktop pins the arcs only when the whole 2×2 grid fits on screen with room to spare. */
const PIN_QUERY = "(width >= 64rem) and (height >= 700px)";

const lit = (count: number) => window.dispatchEvent(new CustomEvent("ak:arc-lit", { detail: { count } }));
const progress = (value: number) =>
  window.dispatchEvent(new CustomEvent("ak:about-progress", { detail: { progress: value } }));

/**
 * About (docs/MOTION.md §15, r5; manga panels §18, r8b).
 * - Bio: the three lines rise in reading order after the H1.
 * - Origin arcs are manga panels. Desktop pins the grid at the centre of the screen and each step of
 *   scroll slams the next panel into its cell; resting between steps settles (through Lenis) with
 *   that panel's beat centred. Phones keep the plain stack and slam each panel as it scrolls in.
 * - A slam: the panel drops in while an ink blot bleeds it into view (a CSS mask whose SVG blot is
 *   roughened by feTurbulence + feDisplacementMap; phones get a smooth blot). On the hit: a 2-frame
 *   inverted flash, a halftone burst behind the stat chip, a short shake, speed lines, and the 3D
 *   world lights the panel's path node and shakes its camera on the same beat (ak:arc-lit,
 *   ak:impact).
 * - Education chips stamp in; the "Next quest" label decodes. Both sections are uncovered by a wipe.
 */
export function about(ctx: MomentContext): () => void {
  const lite = ctx.tier === "lite";
  const panels = gsap.utils.toArray<HTMLElement>("[data-arc-panel]");
  const lines = gsap.utils.toArray<HTMLElement>(".bio-line");
  const chips = gsap.utils.toArray<HTMLElement>("#education li");
  const quest = document.querySelector<HTMLElement>("#goals .label");
  const cleanups: Array<() => void> = [];

  // Bio lines: after the H1's characters have mostly landed.
  gsap.from(lines, { y: 16, opacity: 0, duration: 0.5, stagger: 0.12, delay: 0.45, ease: "ui-out" });

  // Arcs: start states set by script only, so the page is complete without JavaScript.
  let litCount = 0;
  const slammed = new Set<number>();
  const slam = (i: number) => {
    if (slammed.has(i)) return;
    slammed.add(i);
    const panel = panels[i];
    const speed = panel.querySelector("[data-speed-lines]");
    const rays = panel.querySelectorAll("[data-speed-lines] line");
    const burst = panel.querySelector("[data-chip-burst]");
    const hit = () => {
      litCount = Math.max(litCount, i + 1);
      lit(litCount);
      window.dispatchEvent(new CustomEvent("ak:impact"));
    };
    panel.classList.add("is-inking");
    gsap
      .timeline({ onComplete: () => panel.classList.remove("is-inking") })
      .set(panel, { opacity: 1, "--ink-size": "0%" })
      // The drop: accelerating into the hit, like a panel slammed onto the page, while the ink spreads.
      .to(panel, { scale: 1, y: 0, rotation: 0, duration: lite ? 0.26 : 0.32, ease: "power4.in" }, 0)
      .to(panel, { "--ink-size": "260%", duration: 0.5, ease: "power2.out" }, 0)
      // Impact: two frames inverted, then normal.
      .call(hit)
      .set(panel, { filter: "invert(1)" }, "<")
      .set(panel, { filter: "none" }, "+=0.034")
      .to(panel, { keyframes: { x: [-4, 4, -2, 0] }, duration: 0.25, ease: "none" }, "<")
      .fromTo(
        burst,
        { scale: 0.3, opacity: 0.9 },
        { scale: 1.7, opacity: 0, duration: 0.45, ease: "ui-out" },
        "<",
      )
      // Speed lines burst outward and fade.
      .set(speed, { opacity: 0.55 }, "<")
      .fromTo(rays, { drawSVG: "0% 0%" }, { drawSVG: "40% 100%", duration: 0.3, ease: "ui-out" }, "<")
      .to(speed, { opacity: 0, duration: 0.25 }, ">-0.05")
      .to(panel.querySelector("[data-arc-edge]"), { scaleX: 1, duration: 0.4, ease: "ui-out" }, "<");
  };

  panels.forEach((panel, i) => {
    const tilt = i % 2 === 0 ? -2 : 2;
    gsap.set(
      panel,
      ctx.wide ? { scale: 1.12, y: -30, rotation: tilt, opacity: 0 } : { scale: 1.06, y: -16, opacity: 0 },
    );
    gsap.set(panel.querySelector("[data-arc-edge]"), { scaleX: 0, transformOrigin: "left center" });
  });

  const list = panels[0]?.parentElement;
  const section = list?.closest("section");
  const fits = !!section && section.offsetHeight <= window.innerHeight - 40;
  if (section && panels.length && matchMedia(PIN_QUERY).matches && fits) {
    // Desktop: pinned, one step of scroll (60% of a screen) per panel.
    const n = panels.length;
    const pin = ScrollTrigger.create({
      trigger: section,
      start: "center center",
      end: `+=${n * 60}%`,
      pin: true,
      onUpdate: (self) => {
        const count = self.progress <= 0 ? 0 : Math.min(n, Math.floor(self.progress * n) + 1);
        for (let i = 0; i < count; i++) slam(i);
      },
    });
    ScrollTrigger.create({
      trigger: section,
      start: "top 75%",
      end: () => pin.end,
      onUpdate: (self) => progress(self.progress),
    });
    // Snap: resting inside the pin settles on the nearest panel's beat (or the end), so each panel
    // lands centred in its step. Same idle-snap as the Home teaser (docs/DECISIONS.md, r7).
    const beats = [...panels.map((_, i) => (i + 0.5) / n), 1];
    let timer: ReturnType<typeof setTimeout> | undefined;
    const settle = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const y = window.scrollY;
        if (y <= pin.start + 2 || y >= pin.end - 2) return;
        const len = pin.end - pin.start;
        const p = (y - pin.start) / len;
        const beat = beats.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));
        const target = pin.start + beat * len;
        if (Math.abs(target - y) < 2) return;
        const lenis = window.__akLenis;
        if (lenis) lenis.scrollTo(target, { duration: 0.6 });
        else window.scrollTo({ top: target, behavior: "smooth" });
      }, 180);
    };
    window.addEventListener("scroll", settle, { passive: true });
    cleanups.push(() => {
      clearTimeout(timer);
      window.removeEventListener("scroll", settle);
    });
  } else {
    // Phones and short screens: no pin; each panel slams as its top reaches 70% of the screen.
    panels.forEach((panel, i) =>
      ScrollTrigger.create({ trigger: panel, start: "top 70%", once: true, onEnter: () => slam(i) }),
    );
    if (list)
      ScrollTrigger.create({
        trigger: list,
        start: "top 75%",
        end: "bottom 35%",
        onUpdate: (self) => progress(self.progress),
      });
  }

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

  const unwipe = wipes(["#education", "#goals"]);
  return () => {
    cleanups.forEach((fn) => fn());
    unwipe();
  };
}
