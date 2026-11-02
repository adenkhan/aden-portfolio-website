import { gsap } from "gsap";
import type { MomentContext } from "../types";

/**
 * Soft light that follows the pointer inside the character-select card (docs/MOTION.md 7b).
 * Fine pointer, wide screens, full tier only. Writes transform on the glow element itself.
 */
export function pointerGlow(ctx: MomentContext): (() => void) | void {
  if (ctx.tier !== "full" || !ctx.fine || !ctx.wide) return;
  const host = document.querySelector<HTMLElement>("[data-pointer-glow-host]");
  const glow = host?.querySelector<HTMLElement>("[data-pointer-glow]");
  if (!host || !glow) return;

  const toX = gsap.quickTo(glow, "x", { duration: 0.5, ease: "power3.out" });
  const toY = gsap.quickTo(glow, "y", { duration: 0.5, ease: "power3.out" });

  // Read the card's position once per hover, not on every move, so pointermove never forces layout.
  let box = host.getBoundingClientRect();
  const measure = () => (box = host.getBoundingClientRect());

  const move = (event: PointerEvent) => {
    toX(event.clientX - box.left);
    toY(event.clientY - box.top);
  };
  const enter = () => {
    measure();
    gsap.to(glow, { opacity: 1, duration: 0.22, ease: "ui-out" });
  };
  const leave = () => gsap.to(glow, { opacity: 0, duration: 0.18, ease: "ui-out" });

  host.addEventListener("pointermove", move);
  host.addEventListener("pointerenter", enter);
  host.addEventListener("pointerleave", leave);
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);
  return () => {
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerenter", enter);
    host.removeEventListener("pointerleave", leave);
    window.removeEventListener("scroll", measure);
    window.removeEventListener("resize", measure);
  };
}
