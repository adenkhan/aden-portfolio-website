import { gsap, ScrollTrigger } from "../eases";
import { introGate } from "../intro-gate";
import type { MomentContext } from "../types";

const COUNTED_KEY = "ak.counted";

/** Hero entrance after the intro's reveal beat, or straight away when no intro plays (MOTION.md §10). */
function heroEntrance(ctx: MomentContext): void {
  const lite = ctx.tier === "lite";
  const rise = gsap.utils.toArray<HTMLElement>('[data-reveal="rise"]');
  const card = document.querySelector<HTMLElement>('[data-reveal="card"]');
  const bars = gsap.utils.toArray<HTMLElement>("[data-bar]");
  const stats = gsap.utils.toArray<HTMLElement>("[data-stat]");

  const tl = gsap.timeline({ defaults: { ease: "ui-out" } });
  // The avatar is the LCP image: transform only, never opacity.
  if (card) tl.fromTo(card, { scale: 0.96 }, { scale: 1, duration: lite ? 0.45 : 0.6 }, 0);
  tl.fromTo(
    rise,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: lite ? 0.4 : 0.5, stagger: 0.07, clearProps: "transform" },
    0.15,
  )
    .fromTo(
      bars,
      { scaleX: 0 },
      { scaleX: 1, duration: lite ? 0.45 : 0.6, stagger: 0.08, transformOrigin: "left center" },
      0.35,
    )
    .fromTo(stats, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, 0.3);
}

function readCounted(): boolean {
  try {
    return sessionStorage.getItem(COUNTED_KEY) === "1";
  } catch {
    return true; // No storage: show the final numbers rather than risk replaying.
  }
}

/**
 * Number ticker on the stats strip, once per session. Screen readers and no-JS visitors read the
 * real value from a visually hidden span; only the aria-hidden copy counts (MOTION.md 5a).
 */
function countUps(ctx: MomentContext): (() => void) | void {
  if (readCounted()) return;
  const counters = gsap.utils.toArray<HTMLElement>("[data-count]");
  if (!counters.length) return;
  const format = (el: HTMLElement, n: number) =>
    `${el.dataset.prefix ?? ""}${Math.round(n).toLocaleString("en-US")}${el.dataset.suffix ?? ""}`;

  const restore = () => counters.forEach((el) => (el.textContent = format(el, Number(el.dataset.count))));
  for (const el of counters) el.textContent = format(el, 0);
  ScrollTrigger.create({
    trigger: counters[0].closest(".stats") ?? counters[0],
    start: "top 90%",
    once: true,
    onEnter: () => {
      try {
        sessionStorage.setItem(COUNTED_KEY, "1");
      } catch {}
      for (const el of counters) {
        const target = { value: 0 };
        gsap.to(target, {
          value: Number(el.dataset.count),
          duration: ctx.tier === "lite" ? 0.7 : 0.9,
          ease: "power3.out",
          onUpdate: () => (el.textContent = format(el, target.value)),
        });
      }
    },
  });
  // If motion is reverted mid-count (reduced motion switched on), show the real numbers.
  return restore;
}

/** Subtle 3D tilt on the character-select card: desktop, fine pointer, full tier only. */
function cardTilt(ctx: MomentContext): (() => void) | void {
  if (ctx.tier !== "full" || !ctx.fine || !ctx.wide) return;
  const card = document.querySelector<HTMLElement>('[data-reveal="card"]');
  if (!card) return;
  gsap.set(card, { transformPerspective: 900 });
  const toRX = gsap.quickTo(card, "rotationX", { duration: 0.4, ease: "power3.out" });
  const toRY = gsap.quickTo(card, "rotationY", { duration: 0.4, ease: "power3.out" });
  let box = card.getBoundingClientRect();

  const enter = () => (box = card.getBoundingClientRect());
  const move = (event: PointerEvent) => {
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    toRY(px * 6);
    toRX(-py * 4);
  };
  const leave = () => {
    toRX(0);
    toRY(0);
  };
  card.addEventListener("pointerenter", enter);
  card.addEventListener("pointermove", move);
  card.addEventListener("pointerleave", leave);
  return () => {
    card.removeEventListener("pointerenter", enter);
    card.removeEventListener("pointermove", move);
    card.removeEventListener("pointerleave", leave);
  };
}

/**
 * Scroll moment: red and blue converge into purple as the section scrolls through, and the three
 * words arrive with them (CREATIVE and DATA as the orbs close in, GROWTH on impact).
 */
function teaserCollision(): void {
  const stage = document.querySelector<HTMLElement>("[data-collide]");
  if (!stage) return;
  const red = stage.querySelector("[data-orb='red']");
  const blue = stage.querySelector("[data-orb='blue']");
  const purple = stage.querySelector("[data-orb='purple']");
  const [creative, data, growth] = gsap.utils.toArray<HTMLElement>("[data-teaser] [data-word]");
  // Red sits at 22% and blue at 78% of the stage; both travel to the centre (50%).
  const toCentre = () => stage.clientWidth * 0.28;
  const apart = () => stage.clientWidth * 0.12;
  gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stage,
        // The teaser is the last section, so the end must be reachable at maximum scroll.
        start: "top 95%",
        end: "bottom 85%",
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    })
    .fromTo(red, { x: () => -apart() }, { x: toCentre }, 0)
    .fromTo(blue, { x: apart }, { x: () => -toCentre() }, 0)
    .fromTo(purple, { scale: 0.4, opacity: 0 }, { scale: 1.15, opacity: 1, ease: "power2.in" }, 0.35)
    .to([red, blue], { opacity: 0.3, scale: 0.85 }, 0.6)
    .fromTo(creative, { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, 0.05)
    .fromTo(data, { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, 0.2)
    .fromTo(growth, { opacity: 0, y: 24, scale: 0.9 }, { opacity: 1, y: 0, scale: 1 }, 0.5);
}

/** Home-only motion. Sets every hidden start state synchronously after the intro gate resolves. */
export async function home(ctx: MomentContext): Promise<(() => void) | void> {
  const { instant } = await introGate();
  const cleanups: Array<() => void> = [];
  // Created after an await, so register with the matchMedia context.
  ctx.add(() => {
    if (instant) {
      try {
        sessionStorage.setItem(COUNTED_KEY, "1");
      } catch {}
    } else {
      heroEntrance(ctx);
      const restore = countUps(ctx);
      if (restore) cleanups.push(restore);
    }
    const tilt = cardTilt(ctx);
    if (tilt) cleanups.push(tilt);
    teaserCollision();
    return () => cleanups.splice(0).forEach((fn) => fn());
  });
  return () => cleanups.splice(0).forEach((fn) => fn());
}
