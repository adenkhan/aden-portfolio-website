import { gsap, ScrollTrigger } from "./eases";
import type { MotionTier } from "./tier";

/** Dev-only overlay: FPS, active ScrollTriggers and motion tier. Imported only under import.meta.env.DEV. */
export function startDevHud(tier: MotionTier): void {
  const box = document.createElement("div");
  box.setAttribute("aria-hidden", "true");
  box.dataset.devHud = "";
  box.style.cssText =
    "position:fixed;right:8px;bottom:56px;z-index:2147483646;padding:4px 8px;border-radius:4px;" +
    "background:#07080fcc;color:#b4b9d6;font:12px/1.4 ui-monospace,monospace;pointer-events:none";
  // On <html>, so client-side page swaps keep it (r3).
  document.documentElement.append(box);

  let frames = 0;
  let last = performance.now();
  gsap.ticker.add(() => {
    frames += 1;
    const now = performance.now();
    if (now - last < 500) return;
    const fps = Math.round((frames * 1000) / (now - last));
    box.textContent = `${fps} fps · ${ScrollTrigger.getAll().length} triggers · ${tier}`;
    frames = 0;
    last = now;
  });
}
