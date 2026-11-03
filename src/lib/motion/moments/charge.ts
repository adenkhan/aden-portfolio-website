import { gsap } from "../eases";
import type { MomentContext } from "../types";

const SVG = "http://www.w3.org/2000/svg";
const STEP = 12; // px between lightning vertices along the border
const JITTER = 2.6; // px, perpendicular to the border
const CRACKLE_MS = 55; // how often the bolt's shape is re-rolled

/** A closed path around a w×h box (inset 3 px for the stroke), each vertex nudged off the border. */
function bolt(w: number, h: number): string {
  const x0 = 3;
  const y0 = 3;
  const x1 = w + 3;
  const y1 = h + 3;
  const pts: string[] = [];
  const edge = (ax: number, ay: number, bx: number, by: number, nx: number, ny: number) => {
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(1, Math.round(len / STEP));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const j = (Math.random() * 2 - 1) * JITTER;
      pts.push(`${(ax + (bx - ax) * t + nx * j).toFixed(1)},${(ay + (by - ay) * t + ny * j).toFixed(1)}`);
    }
  };
  edge(x0, y0, x1, y0, 0, -1);
  edge(x1, y0, x1, y1, 1, 0);
  edge(x1, y1, x0, y1, 0, 1);
  edge(x0, y1, x0, y0, -1, 0);
  return `M${pts.join("L")}Z`;
}

/**
 * Charged case cards (r8f, docs/MOTION.md §22). Desktop fine pointer, full tier only. Hovering a case
 * card sends lightning crawling along its border: a red bolt one way and a blue bolt the other, each a
 * short dash of a noise-jittered outline whose shape is re-rolled every 55 ms so it crackles. The first
 * hover of each card also glitches its result number once (a CSS-only RGB split and slice, so the
 * scroll-scrubbed count is never touched). Delegated, so it needs no re-binding per page.
 */
export function charge(ctx: MomentContext): (() => void) | void {
  if (ctx.tier !== "full" || !ctx.fine || !ctx.wide) return;
  let active: {
    card: HTMLElement;
    svg: SVGSVGElement;
    paths: SVGPathElement[];
    tweens: gsap.core.Tween[];
  } | null = null;
  let last = 0;

  const crackle = (time: number) => {
    if (!active || time * 1000 - last < CRACKLE_MS) return;
    last = time * 1000;
    const { card, svg, paths } = active;
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    svg.setAttribute("viewBox", `0 0 ${w + 6} ${h + 6}`);
    paths.forEach((p) => p.setAttribute("d", bolt(w, h)));
  };

  const glitch = (card: HTMLElement) => {
    const lead = card.querySelector<HTMLElement>("[data-mission-result] .lead");
    if (!lead || card.dataset.glitched) return;
    card.dataset.glitched = "";
    lead.classList.add("is-glitch");
    lead.addEventListener("animationend", () => lead.classList.remove("is-glitch"), { once: true });
  };

  const enter = (card: HTMLElement) => {
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "charge");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("preserveAspectRatio", "none");
    const paths = ["bolt-red", "bolt-blue"].map((name) => {
      const path = document.createElementNS(SVG, "path");
      path.setAttribute("class", name);
      // A normalised length, so the dash is the same share of the border on any card.
      path.setAttribute("pathLength", "100");
      path.setAttribute("stroke-dasharray", "16 84");
      svg.append(path);
      return path;
    });
    card.append(svg);
    active = { card, svg, paths, tweens: [] };
    last = -Infinity;
    crackle(gsap.ticker.time);
    requestAnimationFrame(() => svg.classList.add("is-on"));
    // Red crawls clockwise, blue the other way round.
    active.tweens = paths.map((path, i) =>
      gsap.fromTo(
        path,
        { strokeDashoffset: i ? 50 : 0 },
        { strokeDashoffset: i ? 150 : -100, duration: 1.1, ease: "none", repeat: -1 },
      ),
    );
    glitch(card);
  };

  const leave = () => {
    if (!active) return;
    const { svg, tweens } = active;
    active = null;
    svg.classList.remove("is-on");
    setTimeout(() => {
      tweens.forEach((t) => t.kill());
      svg.remove();
    }, 220);
  };

  const over = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const card = (event.target as Element | null)?.closest<HTMLElement>("[data-case-card]") ?? null;
    if (card === active?.card) return;
    leave();
    if (card) enter(card);
  };

  gsap.ticker.add(crackle);
  document.addEventListener("pointerover", over, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  return () => {
    gsap.ticker.remove(crackle);
    document.removeEventListener("pointerover", over);
    document.documentElement.removeEventListener("pointerleave", leave);
    leave();
  };
}
