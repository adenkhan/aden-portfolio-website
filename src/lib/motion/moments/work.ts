import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap, ScrollTrigger } from "../eases";
import type { MomentContext } from "../types";

gsap.registerPlugin(DrawSVGPlugin);
const SVG = "http://www.w3.org/2000/svg";

/**
 * Mission cards enter as a staggered group (MOTION.md §11). The thumbnail is often the LCP image, so
 * cards only move; their text fades, and the result line arrives last as the emphasis.
 */
function missions(ctx: MomentContext): void {
  const cards = gsap.utils.toArray<HTMLElement>("[data-mission]");
  if (!cards.length) return;
  const lite = ctx.tier === "lite";
  gsap.set(cards, { y: 24 });
  gsap.set(
    cards.map((c) => c.querySelector("[data-mission-body]")),
    { opacity: 0 },
  );
  gsap.set(
    cards.map((c) => c.querySelector("[data-mission-result]")),
    { opacity: 0, y: 8 },
  );

  ScrollTrigger.batch(cards, {
    start: "top 90%",
    once: true,
    onEnter: (batch) => {
      const tl = gsap.timeline({ defaults: { ease: "ui-out" } });
      tl.to(batch, { y: 0, duration: lite ? 0.45 : 0.55, stagger: 0.06 }, 0)
        .to(
          batch.map((c) => c.querySelector("[data-mission-body]")),
          { opacity: 1, duration: 0.4, stagger: 0.06 },
          0.05,
        )
        .to(
          batch.map((c) => c.querySelector("[data-mission-result]")),
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 },
          0.2,
        );
    },
  });
}

/**
 * Skills tree: SVG branches drawn over the HTML tree from its live layout, so they always fit the
 * current width (4, 2 or 1 columns). The skill chips stay real HTML text. Without JavaScript or with
 * reduced motion the CSS connectors underneath show instead.
 */
function skillsTree(ctx: MomentContext): (() => void) | void {
  const tree = document.querySelector<HTMLElement>("[data-tree]");
  if (!tree) return;
  const lanes = [...tree.querySelectorAll<HTMLElement>("[data-tree-lane]")];
  const chips = [...tree.querySelectorAll<HTMLElement>("[data-tree-chip]")];
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("class", "tree-svg");
  svg.setAttribute("aria-hidden", "true");

  let trunk: SVGPathElement;
  let branches: SVGPathElement[] = [];

  const build = () => {
    svg.replaceChildren();
    const box = tree.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const anchors = lanes.map((lane) => {
      const heading = lane.querySelector("h3")!.getBoundingClientRect();
      return {
        x: heading.left - box.left,
        y: heading.top - box.top + heading.height / 2,
        top: heading.top - box.top,
        colour: getComputedStyle(lane).getPropertyValue("--lane-colour").trim(),
      };
    });
    const oneRow = Math.max(...anchors.map((a) => a.y)) - Math.min(...anchors.map((a) => a.y)) < 8;
    const path = (d: string, colour: string) => {
      const p = document.createElementNS(SVG, "path");
      p.setAttribute("d", d);
      p.setAttribute("fill", "none");
      p.setAttribute("stroke", colour);
      p.setAttribute("stroke-width", "2");
      p.setAttribute("stroke-linecap", "round");
      svg.append(p);
      return p;
    };
    const strong = getComputedStyle(document.documentElement).getPropertyValue("--color-line-strong").trim();

    if (oneRow) {
      // Desktop: a trunk across the top; each branch drops straight to just above its heading.
      const top = Math.min(...anchors.map((a) => a.top));
      const trunkY = top - 28;
      trunk = path(`M 1 ${trunkY} H ${box.width - 1}`, strong);
      branches = anchors.map((a) => path(`M ${a.x + 1} ${trunkY} V ${a.top - 8}`, a.colour));
    } else {
      // Narrow: a trunk down the left; each branch runs straight across to its heading.
      trunk = path(`M 1 ${anchors[0].y} V ${anchors[anchors.length - 1].y}`, strong);
      branches = anchors.map((a) => path(`M 1 ${a.y} H ${a.x - 8}`, a.colour));
    }
  };

  let drawn = false;
  let observer: ResizeObserver | undefined;

  // Measure and build only when the tree comes near the viewport, so these layout reads stay off the
  // page-load path (they pushed Work's LCP to the edge of the budget when done at load).
  const prepare = () => {
    tree.prepend(svg);
    tree.classList.add("svg-ready");
    build();
    gsap.set([trunk, ...branches], { drawSVG: "0%" });
    gsap.set(chips, { opacity: 0, scale: 0.96 });

    ScrollTrigger.create({
      trigger: tree,
      start: "top 70%",
      once: true,
      onEnter: () => {
        const lite = ctx.tier === "lite";
        gsap
          .timeline({ defaults: { ease: "ui-out" }, onComplete: () => (drawn = true) })
          .to(trunk, { drawSVG: "100%", duration: lite ? 0.4 : 0.5 })
          .to(branches, { drawSVG: "100%", duration: lite ? 0.3 : 0.4, stagger: 0.1 }, ">-0.1")
          .to(chips, { opacity: 1, scale: 1, duration: 0.3, stagger: 0.025 }, ">-0.2");
      },
    });

    // Re-fit the branches to the new layout; once drawn, they stay fully drawn.
    observer = new ResizeObserver(() =>
      requestAnimationFrame(() => {
        build();
        gsap.set([trunk, ...branches], { drawSVG: drawn ? "100%" : "0%" });
      }),
    );
    observer.observe(tree);
  };

  ScrollTrigger.create({ trigger: tree, start: "top bottom+=400", once: true, onEnter: prepare });
  return () => {
    observer?.disconnect();
    svg.remove();
    tree.classList.remove("svg-ready");
  };
}

/**
 * Creative gallery: pinned horizontal scroll on desktop (fine pointer, ≥ 1024 px); phones and tablets
 * keep native swipe with scroll-snap. Arrow keys on the focused strip still move through it.
 */
function gallery(ctx: MomentContext): (() => void) | void {
  if (!ctx.fine || !window.matchMedia("(min-width: 1024px)").matches) return;
  const section = document.querySelector<HTMLElement>("[data-gallery]");
  const track = section?.querySelector<HTMLElement>("[data-gallery-track]");
  if (!section || !track) return;

  section.classList.add("pinned");
  // Pinned, the strip no longer scrolls natively, so smooth scroll must handle the wheel over it.
  track.removeAttribute("data-lenis-prevent");
  const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
  const tween = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top 12%",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.5,
      invalidateOnRefresh: true,
    },
  });

  const step = () => (track.firstElementChild as HTMLElement | null)?.offsetWidth ?? 300;
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    window.scrollBy({ top: (event.key === "ArrowRight" ? 1 : -1) * step(), behavior: "instant" });
  };
  track.addEventListener("keydown", onKey);
  return () => {
    track.removeEventListener("keydown", onKey);
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(track, { clearProps: "transform" });
    section.classList.remove("pinned");
    track.setAttribute("data-lenis-prevent", "");
  };
}

export function work(ctx: MomentContext): () => void {
  const cleanups: Array<() => void> = [];
  missions(ctx);
  for (const moment of [skillsTree, gallery]) {
    const cleanup = moment(ctx);
    if (cleanup) cleanups.push(cleanup);
  }
  return () => cleanups.splice(0).forEach((fn) => fn());
}
