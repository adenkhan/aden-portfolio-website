import { gsap } from "gsap";
import { LANE } from "@/components/three/stage";
import { registerCore } from "./eases";

const SPARKS = 12;

/**
 * Small echo of the intro collision at the CV button (docs/MOTION.md moment 2): a purple core,
 * a ring and a few sparks in the creative, data and growth colours. Transform and opacity only.
 * Loaded on first hover or focus of a CV button, never on page load.
 */
export function playBurst(trigger: HTMLElement): void {
  registerCore();
  const box = trigger.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;

  // Optional Lottie version, registered only when src/assets/lottie/cv-burst.json exists.
  const lottieBurst = (window as Window & { akLottieBurst?: (x: number, y: number) => void }).akLottieBurst;
  if (lottieBurst) return lottieBurst(x, y);
  const size = Math.max(box.width, 72);

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;z-index:var(--z-toast);pointer-events:none`;

  const dot = (diameter: number, background: string, extra = "") => {
    const el = document.createElement("div");
    el.style.cssText =
      `position:absolute;left:${-diameter / 2}px;top:${-diameter / 2}px;width:${diameter}px;height:${diameter}px;` +
      `border-radius:50%;background:${background};opacity:0;${extra}`;
    layer.append(el);
    return el;
  };

  const core = dot(size, `radial-gradient(circle, ${LANE.growth} 0%, ${LANE.growth}88 30%, transparent 70%)`);
  const ring = dot(size * 0.9, "transparent", `box-shadow: inset 0 0 0 2px ${LANE.growth}`);
  const colours = [LANE.creative, LANE.data, LANE.growth];
  const sparks = Array.from({ length: SPARKS }, (_, i) => dot(6, colours[i % 3]));
  document.body.append(layer);

  const tl = gsap.timeline({ defaults: { ease: "ui-out" }, onComplete: () => layer.remove() });
  tl.fromTo(core, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.16 }, 0)
    .to(core, { scale: 1.3, opacity: 0, duration: 0.44 }, 0.16)
    .fromTo(ring, { scale: 0.1, opacity: 1 }, { scale: 1.6, opacity: 0, duration: 0.6 }, 0);
  sparks.forEach((spark, i) => {
    const angle = (i / SPARKS) * Math.PI * 2 + Math.random() * 0.4;
    const distance = size * (0.7 + Math.random() * 0.5);
    tl.fromTo(
      spark,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, opacity: 0, scale: 0.4, duration: 0.6 },
      0,
    );
  });
}
