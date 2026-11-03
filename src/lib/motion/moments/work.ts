import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { gsap, ScrollTrigger } from "../eases";
import type { MomentContext } from "../types";
import { buildCase, type CaseMotion } from "./case-visuals";
import { skillsMarquee } from "./marquee";
import { wipes } from "./wipes";

gsap.registerPlugin(DrawSVGPlugin, InertiaPlugin);
const SVG = "http://www.w3.org/2000/svg";

const caseActive = (index: number) =>
  window.dispatchEvent(new CustomEvent("ak:case-active", { detail: { index } }));

/**
 * Case studies as visual stories (r4, docs/MOTION.md §14). Each case has three beats (problem, move,
 * result) and a subtle loop that starts once the beats have played and runs only while it is in view.
 * Desktop (≥ 1024 px wide, ≥ 600 px tall): the section pins and the cases move sideways, one per
 * screen, each case's beats scrubbed by scroll. Phones and tablets: a vertical stack; each case plays
 * once as it enters view. Either way the active case is reported to the 3D world (ak:case-active).
 */
function cases(ctx: MomentContext): (() => void) | void {
  const section = document.querySelector<HTMLElement>("[data-cases]");
  const viewport = section?.querySelector<HTMLElement>("[data-cases-viewport]");
  const track = section?.querySelector<HTMLElement>("[data-cases-track]");
  if (!section || !viewport || !track) return;
  const panels = gsap.utils.toArray<HTMLElement>(track.querySelectorAll("[data-case-study]"));
  const motions: CaseMotion[] = panels.map((panel) => buildCase(panel));
  const triggers: ScrollTrigger[] = [];
  const cleanups: Array<() => void> = [];
  let active = -1;

  const setActive = (index: number) => {
    if (index === active) return;
    active = index;
    caseActive(index);
    // Loops run only for the case in view, and only after its beats have played once.
    motions.forEach((m, i) => (i === index && m.beats.progress() === 1 ? m.loop.play() : m.loop.pause()));
  };

  const sequence = window.matchMedia("(min-width: 1024px) and (min-height: 600px)").matches;
  if (sequence) {
    section.classList.add("is-sequence");
    const setPanel = () => section.style.setProperty("--panel", `${document.documentElement.clientWidth}px`);
    setPanel();
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    const last = panels.length - 1;
    const slide = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefreshInit: setPanel,
        onUpdate: (self) => setActive(Math.round(self.progress * last)),
        onToggle: (self) => setActive(self.isActive ? Math.round(self.progress * last) : -1),
      },
    });
    triggers.push(slide.scrollTrigger!);

    // Beats: case 1 plays as the section scrolls up to the pin; the rest as each slides into view.
    motions.forEach((m, i) => {
      const st = ScrollTrigger.create(
        i === 0
          ? { trigger: section, start: "top 85%", end: "top top", scrub: 0.5, animation: m.beats }
          : {
              trigger: panels[i],
              containerAnimation: slide,
              start: "left 85%",
              end: "left 10%",
              scrub: 0.5,
              animation: m.beats,
            },
      );
      triggers.push(st);
      m.beats.eventCallback("onComplete", () => i === active && m.loop.play());
    });

    // Keyboard: focusing a case scrolls the pinned sequence to it (the strip itself never scrolls).
    panels.forEach((panel, i) => {
      const onFocus = () => {
        const st = slide.scrollTrigger!;
        const top = st.start + (st.end - st.start) * (last ? i / last : 0);
        // Through Lenis when it runs, so smooth scroll never pulls the page back from the jump.
        if (window.__akLenis) window.__akLenis.scrollTo(top, { immediate: true });
        else window.scrollTo({ top, behavior: "instant" });
      };
      panel.addEventListener("focus", onFocus);
      cleanups.push(() => panel.removeEventListener("focus", onFocus));
    });

    cleanups.push(() => {
      gsap.set(track, { clearProps: "transform" });
      section.classList.remove("is-sequence");
      section.style.removeProperty("--panel");
    });
  } else {
    panels.forEach((panel, i) => {
      const m = motions[i];
      triggers.push(
        ScrollTrigger.create({
          trigger: panel,
          start: "top 75%",
          once: true,
          onEnter: () => m.beats.play(),
        }),
        ScrollTrigger.create({
          trigger: panel,
          start: "top 62%",
          end: "bottom 38%",
          onToggle: (self) => setActive(self.isActive ? i : active === i ? -1 : active),
        }),
      );
      m.beats.eventCallback("onComplete", () => i === active && m.loop.play());
    });
  }

  // The pin changes the page height: re-measure every trigger (including the world's) once settled.
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    triggers.forEach((t) => t.kill());
    motions.forEach((m) => {
      m.beats.kill();
      m.loop.kill();
    });
    cleanups.forEach((fn) => fn());
    caseActive(-1);
  };
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
 * Creative gallery (r4): a mouse-draggable strip with momentum, and cards that tilt in 3D toward a
 * fine pointer. Dragging moves the strip's native scroll position and InertiaPlugin carries the
 * release velocity, so the scrollbar, arrow keys and touch swipe keep working. (Draggable's
 * scrollLeft mode wraps the list items in a div, which breaks the list; see docs/DECISIONS.md, r4.)
 * Touch devices keep native swipe; their momentum is the browser's own.
 */
function gallery(ctx: MomentContext): (() => void) | void {
  const track = document.querySelector<HTMLElement>("[data-gallery] [data-gallery-track]");
  if (!track) return;
  const cleanups: Array<() => void> = [];

  if (ctx.fine) {
    track.classList.add("is-draggable");
    InertiaPlugin.track(track, "scrollLeft");
    let startX = 0;
    let startScroll = 0;
    let dragging = false;
    const max = () => track.scrollWidth - track.clientWidth;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      gsap.killTweensOf(track);
      track.setPointerCapture(event.pointerId);
      track.classList.add("is-dragging");
    };
    const move = (event: PointerEvent) => {
      if (dragging) track.scrollLeft = startScroll - (event.clientX - startX);
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      gsap.to(track, { inertia: { scrollLeft: { velocity: "auto", min: 0, max: max() } } });
    };
    track.addEventListener("pointerdown", down);
    track.addEventListener("pointermove", move);
    track.addEventListener("pointerup", up);
    track.addEventListener("pointercancel", up);
    cleanups.push(() => {
      track.removeEventListener("pointerdown", down);
      track.removeEventListener("pointermove", move);
      track.removeEventListener("pointerup", up);
      track.removeEventListener("pointercancel", up);
      InertiaPlugin.untrack(track);
      gsap.killTweensOf(track);
      track.classList.remove("is-draggable", "is-dragging");
    });

    // Tilt: each card leans toward the pointer (rotateX/Y, at most 8°), and settles back on leave.
    for (const figure of track.querySelectorAll<HTMLElement>("figure")) {
      const rx = gsap.quickTo(figure, "rotationX", { duration: 0.4, ease: "ui-out" });
      const ry = gsap.quickTo(figure, "rotationY", { duration: 0.4, ease: "ui-out" });
      gsap.set(figure, { transformPerspective: 700 });
      const move = (event: PointerEvent) => {
        const box = figure.getBoundingClientRect();
        ry(((event.clientX - box.left) / box.width - 0.5) * 16);
        rx(-((event.clientY - box.top) / box.height - 0.5) * 12);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      figure.addEventListener("pointermove", move);
      figure.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        figure.removeEventListener("pointermove", move);
        figure.removeEventListener("pointerleave", leave);
        gsap.set(figure, { clearProps: "transform" });
      });
    }
  }
  return () => cleanups.forEach((fn) => fn());
}

export function work(ctx: MomentContext): () => void {
  const cleanups: Array<() => void> = [];
  cleanups.push(wipes(["#skills", "#gallery"]));
  // The marquee goes first: it hides the chips, which changes the tree's layout the SVG is drawn from.
  for (const moment of [cases, skillsMarquee, skillsTree, gallery]) {
    const cleanup = moment(ctx);
    if (cleanup) cleanups.push(cleanup);
  }
  return () => cleanups.splice(0).forEach((fn) => fn());
}
