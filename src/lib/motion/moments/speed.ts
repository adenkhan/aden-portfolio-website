import { gsap } from "../eases";
import type { MomentContext } from "../types";

const THRESHOLD = 8;
const FULL = 40;

/**
 * Speed lines on fast scroll (r8a, docs/MOTION.md §17). Every frame (gsap.ticker) Lenis velocity is
 * smoothed into --v on the overlay (not on <html>: an inherited variable there would restyle the
 * whole page each frame). Past a threshold, manga speed lines fade in around the viewport edges,
 * headings skew slightly in the scroll direction (clamped ±4°, ±2° on phones), and the 3D world
 * stretches its particles into streaks (it reads the same velocity). All of it settles when
 * scrolling stops. Never for reduced motion (this module only runs inside the motion context).
 */
export function speedLines(ctx: MomentContext): () => void {
  const root = document.documentElement;
  const mobile = !ctx.wide;
  let overlay = document.querySelector<HTMLElement>("[data-speed-overlay]");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "speed-overlay";
    overlay.dataset.speedOverlay = "";
    overlay.setAttribute("aria-hidden", "true");
    // Radial streaks that only cover the outer ring of the screen, never the reading area.
    const count = mobile ? 20 : 40;
    const lines = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * Math.PI * 2 + (i % 2) * 0.07;
      const r1 = 0.62 + (i % 3) * 0.06;
      const r2 = 1.1;
      return `<line x1="${50 + Math.cos(a) * r1 * 50}" y1="${50 + Math.sin(a) * r1 * 50}" x2="${50 + Math.cos(a) * r2 * 50}" y2="${50 + Math.sin(a) * r2 * 50}" />`;
    }).join("");
    overlay.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>`;
    root.append(overlay);
  }
  const host = overlay;
  let v = 0;
  let last = -1;
  const headings = () => gsap.utils.toArray<HTMLElement>("main h1, main h2:not(.sr-only)");
  let skewTargets = headings();
  const maxSkew = mobile ? 2 : 4;

  const tick = () => {
    const raw = window.__akLenis?.velocity ?? 0;
    v += (raw - v) * 0.15;
    if (Math.abs(v) < 0.05) v = 0;
    const amount = Math.min(1, Math.max(0, (Math.abs(v) - THRESHOLD) / (FULL - THRESHOLD)));
    const rounded = Math.round(amount * 100) / 100;
    if (rounded === last) return;
    last = rounded;
    host.style.setProperty("--v", String(rounded));
    host.style.opacity = String(rounded * 0.9);
    host.style.transform = `scale(${1 + rounded * 0.06})`;
    const skew = Math.max(-maxSkew, Math.min(maxSkew, -v * 0.08)) * (rounded > 0 ? 1 : 0);
    gsap.set(skewTargets, { skewY: skew, transformOrigin: "0% 50%" });
  };
  gsap.ticker.add(tick);
  const refresh = () => (skewTargets = headings());
  document.addEventListener("astro:page-load", refresh);

  return () => {
    gsap.ticker.remove(tick);
    document.removeEventListener("astro:page-load", refresh);
    host.style.opacity = "0";
    gsap.set(skewTargets, { clearProps: "skewY" });
  };
}
