import { LANE, orbSizeFor, type IntroStage, type IntroState, type StageGeometry } from "./stage";

/**
 * The 2D intro (docs/MOTION.md moment 1, "Build order"): radial-gradient orbs and a ring.
 * Writes transform and opacity only, so it composites without layout or paint work per frame.
 */
export function create2dStage(host: HTMLElement, g: StageGeometry): IntroStage {
  const orbSize = orbSizeFor(g);
  const ringSize = Math.max(g.width, g.height) * 0.35;

  const make = (className: string, size: number, background: string) => {
    const el = document.createElement("div");
    el.className = `intro-2d ${className}`;
    el.style.cssText = `width:${size}px;height:${size}px;background:${background};opacity:0`;
    host.append(el);
    return { el, size };
  };
  const glow = (colour: string) =>
    `radial-gradient(circle, ${colour} 0%, ${colour}aa 22%, ${colour}33 46%, transparent 70%)`;

  const red = make("intro-red", orbSize, glow(LANE.creative));
  const blue = make("intro-blue", orbSize, glow(LANE.data));
  const core = make("intro-core", orbSize * 1.6, glow(LANE.growth));
  const ring = make("intro-ring", ringSize, "transparent");
  ring.el.style.boxShadow = `inset 0 0 0 2px ${LANE.growth}`;
  ring.el.style.borderRadius = "50%";

  const place = (
    item: { el: HTMLElement; size: number },
    x: number,
    y: number,
    scale: number,
    opacity: number,
  ) => {
    item.el.style.transform = `translate3d(${x - item.size / 2}px, ${y - item.size / 2}px, 0) scale(${scale})`;
    item.el.style.opacity = String(opacity);
  };

  return {
    mode: "2d",
    orbSize,
    render(s: IntroState) {
      place(red, s.redX, s.redY, s.orbScale, s.orbOpacity);
      place(blue, s.blueX, s.blueY, s.orbScale, s.orbOpacity);
      place(core, g.x, g.y, s.coreScale, s.coreOpacity);
      place(ring, g.x, g.y, s.ringScale, s.ringOpacity);
    },
    dispose() {
      for (const item of [red, blue, core, ring]) item.el.remove();
    },
  };
}
