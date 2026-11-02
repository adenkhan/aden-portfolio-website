import type { MomentContext } from "../types";

/**
 * Ambient particles behind the character-select card (docs/MOTION.md 7a).
 * Full tier only (never touch or reduced motion), loaded when the browser is idle, like client:idle.
 * tsParticles pauses itself when the hero leaves the viewport or the tab loses focus.
 */
export function particles(ctx: MomentContext): (() => void) | void {
  if (ctx.tier !== "full" || !ctx.wide) return;
  const host = document.querySelector<HTMLElement>("[data-ambient-particles]");
  if (!host) return;

  let destroy: (() => void) | undefined;
  let cancelled = false;
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));

  idle(async () => {
    const [{ tsParticles }, { loadSlim }] = await Promise.all([
      import("@tsparticles/engine"),
      import("@tsparticles/slim"),
    ]);
    if (cancelled) return;
    await loadSlim(tsParticles);
    const container = await tsParticles.load({
      element: host,
      options: {
        fullScreen: { enable: false },
        background: { color: "transparent" },
        fpsLimit: 30,
        pauseOnBlur: true,
        pauseOnOutsideViewport: true,
        detectRetina: false,
        particles: {
          number: { value: 28 },
          color: { value: ["#ff4d6a", "#3db0ff", "#a77cff"] },
          opacity: { value: { min: 0.25, max: 0.5 } },
          size: { value: { min: 1, max: 3 } },
          move: { enable: true, speed: 0.2, direction: "none", random: true, outModes: { default: "out" } },
          links: { enable: false },
        },
        interactivity: { events: { onHover: { enable: false }, onClick: { enable: false } } },
      },
    });
    destroy = () => container?.destroy();
    if (cancelled) destroy();
  });

  return () => {
    cancelled = true;
    destroy?.();
  };
}
