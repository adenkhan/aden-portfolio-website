import { Observer } from "gsap/Observer";
import { gsap } from "../eases";
import type { MomentContext } from "../types";

gsap.registerPlugin(Observer);

const INTERACTIVE = "a[href], button, summary, input, textarea, select, [tabindex]:not([tabindex='-1'])";
/** What pulls the orb (r8f), and how far toward its centre (0 = the pointer, 1 = the centre). */
const MAGNETS: Array<[string, number]> = [
  [".btn, .cv-button, [data-case-open], [data-case-close]", 0.4],
  ["[data-case-card]", 0.1],
];
const TRAIL = 5;

/**
 * Desktop pointer moments (r5, docs/MOTION.md §15; r8f §22). Fine pointer, full tier, wide screens only.
 * - A small red-and-blue orb companion follows the pointer with a short trail, is pulled toward
 *   buttons and case cards, and opens into a ring over anything interactive. The system cursor stays
 *   visible (a replacement cursor hides precision and breaks some assistive setups). GSAP Observer
 *   reads pointer and touch input alike (a touchscreen laptop moves it too).
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
    // The trail: small dots, alternately red and blue, each lagging a little more than the last.
    for (let i = 0; i < TRAIL; i++) {
      const dot = document.createElement("div");
      dot.className = `cursor-trail ${i % 2 ? "is-blue" : "is-red"}`;
      dot.dataset.cursorTrail = "";
      dot.setAttribute("aria-hidden", "true");
      dot.style.setProperty("--i", String(i));
      root.append(dot);
    }
  }
  const dots = [...document.querySelectorAll<HTMLElement>("[data-cursor-trail]")];
  gsap.set(orb, { scale: 0.25 });
  const x = gsap.quickTo(orb, "x", { duration: 0.25, ease: "ui-out" });
  let over = false;
  const y = gsap.quickTo(orb, "y", { duration: 0.25, ease: "ui-out" });
  const trail = dots.map((dot, i) => ({
    x: gsap.quickTo(dot, "x", { duration: 0.32 + i * 0.07, ease: "ui-out" }),
    y: gsap.quickTo(dot, "y", { duration: 0.32 + i * 0.07, ease: "ui-out" }),
  }));
  let magnet: HTMLElement | null = null;

  const release = () => {
    if (!magnet) return;
    gsap.to(magnet, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
    magnet = null;
  };

  const move = (event: PointerEvent | TouchEvent) => {
    const point = "touches" in event ? event.touches[0] : event;
    if (!point) return;
    root.classList.add("has-cursor");
    const target = event.target as Element | null;
    // Magnetic pull: the orb leans from the pointer toward the centre of what it is over.
    let tx = point.clientX;
    let ty = point.clientY;
    for (const [selector, pull] of MAGNETS) {
      const el = target?.closest<HTMLElement>(selector);
      if (!el) continue;
      const box = el.getBoundingClientRect();
      tx += (box.left + box.width / 2 - tx) * pull;
      ty += (box.top + box.height / 2 - ty) * pull;
      break;
    }
    x(tx);
    y(ty);
    trail.forEach((t) => {
      t.x(tx);
      t.y(ty);
    });
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
      const dx = ((point.clientX - box.left) / box.width - 0.5) * 12;
      const dy = ((point.clientY - box.top) / box.height - 0.5) * 12;
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
  const lift = () => {
    const buttons = document.querySelectorAll(".btn");
    if (buttons.length) gsap.to(buttons, { scale: 1, duration: 0.16, ease: "ui-out", overwrite: "auto" });
  };

  const observer = Observer.create({
    target: window,
    type: "pointer,touch",
    onMove: (self) => move(self.event as PointerEvent | TouchEvent),
  });
  document.addEventListener("pointerdown", press, { passive: true });
  document.addEventListener("pointerup", lift, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  return () => {
    observer.kill();
    document.removeEventListener("pointerdown", press);
    document.removeEventListener("pointerup", lift);
    document.documentElement.removeEventListener("pointerleave", leave);
    release();
  };
}
