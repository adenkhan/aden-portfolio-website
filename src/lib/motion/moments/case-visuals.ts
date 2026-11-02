import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { gsap } from "../eases";

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/** Beat positions on each case's timeline: problem, move, result (docs/MOTION.md §14). */
const B1 = 0;
const B2 = 0.45;
const B3 = 0.95;

export interface CaseMotion {
  /** The three beats. Paused; scrubbed by scroll on desktop, played once on phones. */
  beats: gsap.core.Timeline;
  /** A subtle repeating motion for after the beats have played. Paused until started. */
  loop: gsap.core.Timeline;
}

const num = (el: Element, key: string) => Number((el as HTMLElement | SVGElement).dataset[key] ?? 0);
const format = (el: Element, value: number) => {
  const d = (el as HTMLElement | SVGElement).dataset;
  return `${d.prefix ?? ""}${Math.round(value).toLocaleString("en-US")}${d.suffix ?? ""}`;
};

/** Counts an element's text from 0 to its data-count / data-viz-count value. */
function countUp(tl: gsap.core.Timeline, el: Element, key: "count" | "vizCount", at: number, duration = 0.5) {
  const target = num(el, key);
  const state = { v: 0 };
  tl.fromTo(
    state,
    { v: 0 },
    {
      v: target,
      duration,
      ease: "ui-out",
      immediateRender: true,
      onUpdate: () => (el.textContent = format(el, state.v)),
    },
    at,
  );
}

function captions(tl: gsap.core.Timeline, root: HTMLElement) {
  [1, 2, 3].forEach((beat, i) => {
    const row = root.querySelector(`[data-beat="${beat}"]`);
    if (row) tl.from(row, { opacity: 0, y: 12, duration: 0.3, ease: "ui-out" }, [B1, B2, B3][i]);
  });
  const ticker = root.querySelector("[data-count]");
  if (ticker) countUp(tl, ticker, "count", B3 + 0.05, 0.55);
}

const surface = () =>
  getComputedStyle(document.documentElement).getPropertyValue("--color-bg-surface").trim();

const builders: Record<
  string,
  (svg: SVGSVGElement, tl: gsap.core.Timeline, loop: gsap.core.Timeline) => void
> = {
  // 1. The acquisition-cost bar starts full, the onboarding funnel fills stage by stage, then the bar
  //    shrinks by 72% (its real value) as the result lands.
  cac(svg, tl, loop) {
    const bar = svg.querySelector<SVGRectElement>("[data-cac-bar]")!;
    const fills = svg.querySelectorAll("[data-funnel-fill]");
    tl.from(
      bar,
      { attr: { y: num(bar, "fullY"), height: num(bar, "fullH") }, duration: 0.5, ease: "ui-in-out" },
      B3,
    )
      .from(svg.querySelector("[data-cac-delta]"), { opacity: 0, y: -10, duration: 0.3 }, B3 + 0.35)
      .from(fills, { opacity: 0, duration: 0.25, stagger: 0.12 }, B2);
    loop.to(fills, { opacity: 0.65, duration: 0.9, stagger: 0.2, yoyo: true, repeat: 1, ease: "sine.inOut" });
  },

  // 2. Nodes appear, edges draw, then data packets travel capture → enrich → email → CRM; each node
  //    pulses as a packet arrives.
  workflow(svg, tl, loop) {
    const nodes = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll("[data-node]"));
    const edges = gsap.utils.toArray<SVGPathElement>(svg.querySelectorAll("[data-edge]"));
    const packets = gsap.utils.toArray<SVGCircleElement>(svg.querySelectorAll("[data-packet]"));
    tl.from(
      nodes,
      { scale: 0, transformOrigin: "50% 50%", duration: 0.3, stagger: 0.08, ease: "back.out(2)" },
      B1,
    )
      .from(edges, { drawSVG: "0%", duration: 0.35, stagger: 0.1 }, B2)
      .from(packets, { opacity: 0, duration: 0.2 }, B3);
    const travel = (packet: SVGCircleElement, offset: number) => {
      edges.forEach((edge, i) => {
        const at = offset + i * 0.7;
        loop
          .to(
            packet,
            { motionPath: { path: edge, align: edge, alignOrigin: [0.5, 0.5] }, duration: 0.7, ease: "none" },
            at,
          )
          .to(
            nodes[i + 1],
            { scale: 1.15, transformOrigin: "50% 50%", duration: 0.15, yoyo: true, repeat: 1 },
            at + 0.62,
          );
      });
    };
    packets.forEach((packet, k) => travel(packet, k * 0.7));
  },

  // 3. Keyword chips appear in the research column, fly into the draft; two that overlap in meaning
  //    collide, flash red and get flagged.
  cockpit(svg, tl, loop) {
    const chips = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll("[data-chip]"));
    const clash = svg.querySelectorAll("[data-clash]");
    tl.from(chips, { opacity: 0, duration: 0.25, stagger: 0.05 }, B1)
      .from(
        chips,
        {
          x: (_, el) => num(el, "dx"),
          y: (_, el) => num(el, "dy"),
          duration: 0.45,
          stagger: 0.07,
          ease: "ui-in-out",
        },
        B2,
      )
      .from(clash, { opacity: 0, duration: 0.12, repeat: 3, yoyo: true }, B3)
      .from(svg.querySelector("[data-flag]"), { opacity: 0, x: 10, duration: 0.3 }, B3 + 0.2);
    loop.to(clash, { opacity: 0.35, duration: 0.7, yoyo: true, repeat: 1, ease: "sine.inOut" });
  },

  // 4. Dots move through the pipeline board; the weekly ticker lights week by week.
  pipeline(svg, tl, loop) {
    const dots = svg.querySelectorAll("[data-dot]");
    const ticks = svg.querySelectorAll("[data-tick]");
    tl.from(dots, { opacity: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.25, stagger: 0.03 }, B1)
      .from(
        dots,
        {
          x: (_, el) => num(el, "dx"),
          y: (_, el) => num(el, "dy"),
          duration: 0.45,
          stagger: 0.05,
          ease: "ui-in-out",
        },
        B2,
      )
      .from(ticks, { fill: surface(), duration: 0.2, stagger: 0.06 }, B3);
    loop.to(ticks, { opacity: 0.4, duration: 0.25, stagger: 0.12, yoyo: true, repeat: 1 });
  },

  // 5. Reel and carousel cards fan out like a hand of cards; the awareness bar rises 40%.
  reach(svg, tl, loop) {
    const cards = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll("[data-card]"));
    const bar = svg.querySelector<SVGRectElement>("[data-reach-bar]")!;
    tl.from(cards, { opacity: 0, y: 30, duration: 0.3, stagger: 0.05 }, B1)
      .from(
        cards,
        {
          rotation: (_, el) => -num(el, "angle"),
          svgOrigin: "240 330",
          duration: 0.45,
          stagger: 0.04,
          ease: "ui-out",
        },
        B2,
      )
      .from(
        bar,
        { attr: { y: num(bar, "baseY"), height: num(bar, "baseH") }, duration: 0.5, ease: "ui-out" },
        B3,
      )
      .from(svg.querySelector("[data-reach-delta]"), { opacity: 0, y: 12, duration: 0.3 }, B3 + 0.3);
    loop.to(cards, {
      rotation: "+=2",
      svgOrigin: "240 330",
      duration: 1.2,
      stagger: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    });
  },

  // 6. Proposal envelopes fly out (15+), coins stack, and the raised and follower counters tick up.
  club(svg, tl, loop) {
    const envelopes = svg.querySelectorAll("[data-envelope]");
    const coins = gsap.utils.toArray<SVGGElement>(svg.querySelectorAll("[data-coin]"));
    const [proposals, raised, followers] = svg.querySelectorAll("[data-viz-count]");
    tl.from(
      envelopes,
      {
        x: (_, el) => num(el, "dx"),
        y: (_, el) => num(el, "dy"),
        opacity: 0,
        duration: 0.4,
        stagger: 0.025,
        ease: "ui-out",
      },
      B1,
    );
    countUp(tl, proposals, "vizCount", B1, 0.6);
    tl.from(coins, { y: -70, opacity: 0, duration: 0.25, stagger: 0.06, ease: "bounce.out" }, B2);
    countUp(tl, raised, "vizCount", B2, 0.7);
    countUp(tl, followers, "vizCount", B3, 0.6);
    tl.from(svg.querySelector("[data-follow-ring]"), { drawSVG: "0%", duration: 0.6 }, B3);
    loop.to(coins.at(-1)!, { y: -6, duration: 0.6, yoyo: true, repeat: 1, ease: "sine.inOut" });
  },
};

/**
 * Builds one case's beats and loop. Start states apply at once (from tweens render immediately), so
 * call this inside the motion context, after html.motion-pending has hidden the captions.
 */
export function buildCase(root: HTMLElement): CaseMotion {
  const beats = gsap.timeline({ paused: true, defaults: { ease: "ui-out" } });
  const loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 });
  const stage = root.querySelector<HTMLElement>("[data-case-visual]");
  const svg = stage?.querySelector("svg");
  if (stage && svg) builders[stage.dataset.caseVisual ?? ""]?.(svg, beats, loop);
  captions(beats, root);
  return { beats, loop };
}
