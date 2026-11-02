import { gsap } from "../eases";
import type { MomentContext } from "../types";

const INTERACTIVE = "a[href], button, summary, input, textarea, select, [tabindex]:not([tabindex='-1'])";

/**
 * Desktop pointer moments (r5, docs/MOTION.md §15). Fine pointer, full tier, wide screens only.
 * - A small orb companion follows the pointer and opens into a ring over anything interactive. The
 *   system cursor stays visible (a replacement cursor hides precision and breaks some assistive setups).
 * - Magnetic buttons: a .btn leans up to 6 px toward the pointer and springs back when it leaves.
 * Delegated listeners, so pages swapped in by the client router need no re-binding; the orb lives on
 * <html>, so the swap never removes it.
 */
export function cursor(ctx: MomentContext): (() => void) | void {
  if (ctx.tier !== "full" || !ctx.fine || !ctx.wide) return;

  const root = document.documentElement;
  let orb = document.querySelector<HTMLElement>("[data-cursor-orb]");
  if (!orb) {
    orb = document.createElement("div");
    orb.className = "cursor-orb";
    orb.dataset.cursorOrb = "";
    orb.setAttribute("aria-hidden", "true");
    root.append(orb);
  }
  gsap.set(orb, { scale: 0.25 });
  const x = gsap.quickTo(orb, "x", { duration: 0.25, ease: "ui-out" });
  let over = false;
  const y = gsap.quickTo(orb, "y", { duration: 0.25, ease: "ui-out" });
  let magnet: HTMLElement | null = null;

  const release = () => {
    if (!magnet) return;
    gsap.to(magnet, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    magnet = null;
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    root.classList.add("has-cursor");
    x(event.clientX);
    y(event.clientY);
    const target = event.target as Element | null;
    const isOver = Boolean(target?.closest(INTERACTIVE));
    if (isOver !== over) {
      over = isOver;
      orb!.classList.toggle("is-over", over);
      gsap.to(orb!, { scale: over ? 1 : 0.25, duration: 0.2, ease: "ui-out", overwrite: "auto" });
    }

    const button = target?.closest<HTMLElement>(".btn") ?? null;
    if (button !== magnet) release();
    if (button) {
      magnet = button;
      const box = button.getBoundingClientRect();
      const dx = ((event.clientX - box.left) / box.width - 0.5) * 12;
      const dy = ((event.clientY - box.top) / box.height - 0.5) * 12;
      gsap.to(button, { x: dx, y: dy, duration: 0.3, ease: "ui-out", overwrite: "auto" });
    }
  };
  const leave = () => {
    root.classList.remove("has-cursor");
    release();
  };

  // The magnet's inline transform overrides the CSS :active scale, so the press lives here too.
  const press = (event: PointerEvent) => {
    const button = (event.target as Element | null)?.closest<HTMLElement>(".btn");
    if (button) gsap.to(button, { scale: 0.97, duration: 0.1, ease: "ui-out" });
  };
  const lift = () => gsap.to(".btn", { scale: 1, duration: 0.16, ease: "ui-out", overwrite: "auto" });

  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerdown", press, { passive: true });
  document.addEventListener("pointerup", lift, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  return () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerdown", press);
    document.removeEventListener("pointerup", lift);
    document.documentElement.removeEventListener("pointerleave", leave);
    release();
  };
}
