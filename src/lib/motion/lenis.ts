import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "./eases";

/** Smooth scroll driven by GSAP's ticker and synced to ScrollTrigger (docs/MOTION.md §1). */
declare global {
  interface Window {
    /** The page's smooth-scroll instance, for programmatic jumps that must not fight it (r5). */
    __akLenis?: Lenis;
  }
}

export function startLenis(): { lenis: Lenis; stop: () => void } {
  const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  window.__akLenis = lenis;

  return {
    lenis,
    stop: () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (window.__akLenis === lenis) window.__akLenis = undefined;
    },
  };
}
