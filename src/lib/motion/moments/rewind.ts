import { gsap } from "../eases";
import type { MomentContext } from "../types";

const DURATION = 1.6;
const rewinding = (on: boolean) => window.dispatchEvent(new CustomEvent("ak:rewind", { detail: { on } }));

/**
 * Rewind to top (r8g, docs/MOTION.md §23). The footer's "Back to top" link is a plain #top link; with
 * motion it rewinds instead: Lenis scrolls to 0 over 1.6 s with input locked, under a VHS-rewind
 * overlay (scanlines, a tracking band, a "◀◀ REW" mark). The tracking jitter and, on desktop, an RGB
 * split on the page scale with the scroll speed. The 3D world runs its clock backwards meanwhile, and
 * the page's scroll-driven 3D states unwind with the scroll. Delegated, so it needs no re-binding.
 */
export function rewind(ctx: MomentContext): () => void {
  const root = document.documentElement;
  const mobile = !ctx.wide;
  let running = false;

  const overlay = () => {
    let el = document.querySelector<HTMLElement>("[data-vhs]");
    if (!el) {
      el = document.createElement("div");
      el.className = "vhs";
      el.dataset.vhs = "";
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = `<div class="vhs-lines"></div><div class="vhs-band"></div><p class="vhs-osd">◀◀ REW</p>`;
      root.append(el);
    }
    return el;
  };

  const play = () => {
    const lenis = window.__akLenis;
    if (!lenis || running) return false;
    running = true;
    const vhs = overlay();
    const main = document.querySelector<HTMLElement>("main");
    const band = vhs.querySelector(".vhs-band");
    vhs.classList.add("is-on");
    rewinding(true);
    const roll = gsap.fromTo(
      band,
      { yPercent: -100 },
      { yPercent: 900, duration: 0.7, ease: "none", repeat: -1 },
    );
    // The RGB split is a red/blue text-shadow on the headings and numbers in view. A filter on the
    // page or its sections was tried: past the GPU's texture size (and around pinned, fixed content)
    // it blanks parts of the screen.
    let split = 0;
    let filtered: HTMLElement[] = [];
    const inView = () =>
      [...(main?.querySelectorAll<HTMLElement>("h1, h2:not(.sr-only), h3, .chip, .lead") ?? [])].filter(
        (el) => {
          const box = el.getBoundingClientRect();
          return box.bottom > 0 && box.top < innerHeight;
        },
      );
    const setSplit = (px: number) => {
      filtered.forEach((el) => (el.style.textShadow = ""));
      filtered = px ? inView() : [];
      const value = `${-px}px 0 rgb(255 77 109 / 0.7), ${px}px 0 rgb(56 182 255 / 0.7)`;
      filtered.forEach((el) => (el.style.textShadow = value));
    };
    // Jitter and split follow the scroll speed, read every frame from Lenis.
    const tick = () => {
      const speed = Math.min(1, Math.abs(lenis.velocity) / 60);
      const jitter = (Math.random() - 0.5) * 6 * speed;
      gsap.set(vhs, { x: jitter, skewX: (Math.random() - 0.5) * 2 * speed });
      const next = mobile ? 0 : Math.round(speed * 6);
      if (next !== split) setSplit((split = next));
    };
    gsap.ticker.add(tick);
    const done = () => {
      gsap.ticker.remove(tick);
      roll.kill();
      vhs.classList.remove("is-on");
      gsap.set(vhs, { x: 0, skewX: 0 });
      setSplit((split = 0));
      rewinding(false);
      running = false;
      // Arrive where the link leads: focus the page's start, without a jump.
      document.querySelector<HTMLElement>("#main")?.focus({ preventScroll: true });
    };
    lenis.scrollTo(0, {
      duration: DURATION,
      lock: true,
      force: true,
      easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
      onComplete: done,
    });
    // A rewind from the very top completes at once without onComplete in some cases: guard it.
    if (window.scrollY === 0) setTimeout(() => running && done(), 50);
    return true;
  };

  const click = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>("[data-rewind]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (!play()) return;
    event.preventDefault();
    // Lenis (anchors: true) and the router would otherwise handle this #top link too.
    event.stopPropagation();
  };
  window.addEventListener("click", click, { capture: true });
  return () => {
    window.removeEventListener("click", click, { capture: true });
    if (running) rewinding(false);
  };
}
