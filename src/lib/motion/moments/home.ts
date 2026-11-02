import { SplitText } from "gsap/SplitText";
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

  // Meters (r5): rings draw to their real percentage, units (ticks, dots) light one by one.
  const rings = gsap.utils.toArray<SVGCircleElement>("[data-meter-value]");
  const units = gsap.utils.toArray<SVGElement>("[data-meter-unit]");

  const restore = () => {
    counters.forEach((el) => (el.textContent = format(el, Number(el.dataset.count))));
    gsap.set([...rings, ...units], { clearProps: "strokeDasharray,opacity" });
  };
  for (const el of counters) el.textContent = format(el, 0);
  gsap.set(rings, { strokeDasharray: "0 100" });
  gsap.set(units, { opacity: 0.15 });
  ScrollTrigger.create({
    trigger: counters[0].closest(".stats") ?? counters[0],
    start: "top 90%",
    once: true,
    onEnter: () => {
      try {
        sessionStorage.setItem(COUNTED_KEY, "1");
      } catch {}
      // Hierarchy (r5): on the first screen the H1 is the hero; the meters and counts follow it.
      const delay = window.scrollY < 10 ? 0.75 : 0;
      for (const el of counters) {
        const target = { value: 0 };
        gsap.to(target, {
          value: Number(el.dataset.count),
          duration: ctx.tier === "lite" ? 0.7 : 0.9,
          ease: "power3.out",
          delay,
          onUpdate: () => (el.textContent = format(el, target.value)),
        });
      }
      const duration = ctx.tier === "lite" ? 0.7 : 0.9;
      for (const ring of rings) {
        const percent = (ring.closest("[data-percent]") as SVGElement | null)?.dataset.percent ?? "0";
        gsap.to(ring, { strokeDasharray: `${percent} 100`, duration, delay, ease: "power3.out" });
      }
      gsap.to(units, { opacity: 1, duration: 0.2, stagger: duration / 9, delay, ease: "ui-out" });
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

const flipFrom = { rotationX: -90, yPercent: 30, opacity: 0, transformOrigin: "50% 100%" };
const flipTo = { rotationX: 0, yPercent: 0, opacity: 1 };

/**
 * CREATIVE · DATA · GROWTH (r7, docs/MOTION.md §16). The section pins and scrubs Convergence in the
 * 3D world (scrub 1): its progress goes to the world as ak:convergence-progress. The words flip in on
 * the beats: CREATIVE as the orbs ignite, DATA mid-spiral, GROWTH on the collapse. Without a world
 * (no WebGL) the DOM orbs below play the same beats in 2D. When scrolling stops inside the pin, it
 * snaps to its start or end through Lenis, so it never rests half-collided.
 */
function teaserCollision(): (() => void) | void {
  const section = document.querySelector<HTMLElement>("[data-teaser]");
  const stage = section?.querySelector<HTMLElement>("[data-collide]");
  if (!section || !stage) return;
  const red = stage.querySelector("[data-orb='red']");
  const blue = stage.querySelector("[data-orb='blue']");
  const purple = stage.querySelector("[data-orb='purple']");
  const words = gsap.utils.toArray<HTMLElement>("[data-teaser] [data-word]");
  gsap.registerPlugin(SplitText);
  // Kinetic type (r5): each word's characters flip up in 3D. The heading keeps its accessible name
  // from aria-label, so the split characters are never read one by one.
  gsap.set(words, { perspective: 500 });
  const [creative, data, growth] = words.map(
    (word) => SplitText.create(word, { type: "chars", aria: "none" }).chars,
  );
  // A full screen tall while pinned, so the end of the pin is always reachable (it is the last section).
  section.classList.add("is-converging");
  const report = (progress: number) =>
    window.dispatchEvent(new CustomEvent("ak:convergence-progress", { detail: { progress } }));

  // Positions on a 0–1 scale that matches the world's Convergence (merge at 0.86 of the scrub).
  const toCentre = () => stage.clientWidth * 0.28;
  const apart = () => stage.clientWidth * 0.12;
  const tl = gsap
    .timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => report(self.progress),
        onLeaveBack: () => report(0),
      },
    })
    .fromTo(red, { x: () => -apart() }, { x: toCentre, duration: 0.7 }, 0.15)
    .fromTo(blue, { x: apart }, { x: () => -toCentre(), duration: 0.7 }, 0.15)
    .fromTo(
      purple,
      { scale: 0.4, opacity: 0 },
      { scale: 1.15, opacity: 1, duration: 0.1, ease: "power2.in" },
      0.84,
    )
    .to([red, blue], { opacity: 0.3, scale: 0.85, duration: 0.1 }, 0.84)
    .fromTo(creative, flipFrom, { ...flipTo, duration: 0.12, stagger: 0.01 }, 0.04)
    .fromTo(data, flipFrom, { ...flipTo, duration: 0.12, stagger: 0.01 }, 0.4)
    .fromTo(growth, flipFrom, { ...flipTo, duration: 0.1, stagger: 0.008 }, 0.84)
    // Impact: GROWTH swells once as red and blue merge into purple.
    .to(words[2], { scale: 1.08, duration: 0.04, yoyo: true, repeat: 1, transformOrigin: "50% 60%" }, 0.92)
    .to({}, { duration: 0.01 }, 0.99);

  // Snap: when scrolling stops inside the pin, settle at its start or end (never half-collided).
  // lenis/snap was not used: its "mandatory" mode snaps the whole page and its "proximity" mode can
  // leave the section resting mid-pin (docs/DECISIONS.md, r7).
  const st = tl.scrollTrigger!;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const settle = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const y = window.scrollY;
      if (y <= st.start + 2 || y >= st.end - 2) return;
      const target = st.progress < 0.5 ? st.start : st.end;
      const lenis = window.__akLenis;
      if (lenis) lenis.scrollTo(target, { duration: 0.8 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    }, 180);
  };
  window.addEventListener("scroll", settle, { passive: true });
  return () => {
    clearTimeout(timer);
    window.removeEventListener("scroll", settle);
    section.classList.remove("is-converging");
    report(0);
  };
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
    const convergence = teaserCollision();
    if (convergence) cleanups.push(convergence);
    return () => cleanups.splice(0).forEach((fn) => fn());
  });
  return () => cleanups.splice(0).forEach((fn) => fn());
}
