import { gsap, ScrollTrigger } from "../eases";
import type { MomentContext } from "../types";

const laneHover = (index: number) =>
  window.dispatchEvent(new CustomEvent("ak:lane-hover", { detail: { index } }));

/**
 * Velocity marquee of skills (r8e, docs/MOTION.md §21). Built from the skills tree's own chips, which
 * stay in the HTML for screen readers, no JavaScript and reduced motion but are hidden on screen while
 * the marquee shows them (each skill is shown once). Two rows drift in opposite directions; scrolling
 * the page flips both with the scroll direction and speeds them up with its velocity. The band has a
 * slight 3D tilt. Hovering a word pauses its row and lights its lane's cluster in the 3D world.
 * Runs only while on screen (gsap.ticker, toggled by ScrollTrigger).
 */
export function skillsMarquee(ctx: MomentContext): (() => void) | void {
  const tree = document.querySelector<HTMLElement>("[data-tree]");
  const lanes = [...(tree?.querySelectorAll<HTMLElement>("[data-tree-lane]") ?? [])];
  if (!tree || !lanes.length) return;
  const mobile = !ctx.wide;

  // Two rows: the first half of the lanes, then the second half, each word in its lane colour.
  const half = Math.ceil(lanes.length / 2);
  const groups = [lanes.slice(0, half), lanes.slice(half)].filter((g) => g.length);
  const band = document.createElement("div");
  band.className = "marquee";
  band.dataset.marquee = "";
  band.setAttribute("aria-hidden", "true");
  const rows = groups.map((group, r) => {
    const row = document.createElement("div");
    row.className = "marquee-row";
    row.dataset.row = String(r);
    const track = document.createElement("div");
    track.className = "marquee-track";
    const words = group.flatMap((lane) =>
      [...lane.querySelectorAll("[data-tree-chip]")].map((chip) => ({
        text: chip.textContent?.trim() ?? "",
        lane: lane.dataset.lane ?? "",
        index: lanes.indexOf(lane),
      })),
    );
    // Two copies make a seamless loop; the track moves by one copy's width.
    for (let copy = 0; copy < 2; copy++)
      for (const word of words) {
        const span = document.createElement("span");
        span.className = "marquee-word";
        span.dataset.lane = word.lane;
        span.dataset.laneIndex = String(word.index);
        span.textContent = word.text;
        track.append(span);
      }
    row.append(track);
    band.append(row);
    return { row, track, x: 0, speed: 1, paused: false, base: r % 2 === 0 ? -1 : 1 };
  });
  tree.before(band);
  tree.classList.add("has-marquee");

  const setters = rows.map((r) => gsap.quickSetter(r.track, "x", "px") as (v: number) => void);
  const base = mobile ? 28 : 46; // px per second at rest
  let direction = 1;
  let lastY = window.scrollY;
  let v = 0;
  const tick = (_t: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 64) / 1000;
    // Velocity from the page itself (Lenis or native touch scrolling alike), smoothed.
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    if (dy !== 0) direction = window.__akLenis?.direction || Math.sign(dy) || direction;
    v += (Math.abs(dy) / Math.max(dt, 0.001) - v) * 0.12;
    const boost = Math.min(v * 0.9, mobile ? 600 : 1100);
    rows.forEach((r, i) => {
      r.speed += ((r.paused ? 0 : 1) - r.speed) * Math.min(1, dt * 8);
      const width = r.track.scrollWidth / 2;
      if (!width) return;
      r.x += r.base * direction * (base + boost) * r.speed * dt;
      r.x = gsap.utils.wrap(-width, 0, r.x);
      setters[i](r.x);
    });
  };
  const trigger = ScrollTrigger.create({
    trigger: band,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      if (self.isActive) {
        lastY = window.scrollY;
        gsap.ticker.add(tick);
      } else gsap.ticker.remove(tick);
    },
  });

  // Hover (fine pointers): pause that row, light that lane's cluster.
  const over = (event: PointerEvent) => {
    const word = (event.target as Element).closest<HTMLElement>(".marquee-word");
    if (!word) return;
    const r = rows.find((row) => row.row.contains(word));
    rows.forEach((row) => (row.paused = row === r));
    band.querySelectorAll(".is-lit").forEach((w) => w.classList.remove("is-lit"));
    band
      .querySelectorAll(`[data-lane-index="${word.dataset.laneIndex}"]`)
      .forEach((w) => w.classList.add("is-lit"));
    laneHover(Number(word.dataset.laneIndex));
  };
  const out = () => {
    rows.forEach((row) => (row.paused = false));
    band.querySelectorAll(".is-lit").forEach((w) => w.classList.remove("is-lit"));
    laneHover(-1);
  };
  if (ctx.fine) {
    band.addEventListener("pointerover", over);
    band.addEventListener("pointerleave", out);
  }

  return () => {
    trigger.kill();
    gsap.ticker.remove(tick);
    band.remove();
    tree.classList.remove("has-marquee");
  };
}
