import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap } from "../eases";
import type { MomentContext } from "../types";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * Terminal "typing" on Contact (MOTION.md §12): the prompt, then each channel decodes from 0/1 into
 * its text, top to bottom. Only the aria-hidden copies animate; the links and their real text are in
 * the HTML from the start, so screen readers, keyboard users and no-JS visitors are never kept waiting.
 */
export function contact(ctx: MomentContext): void {
  const lines = gsap.utils.toArray<HTMLElement>("[data-type]");
  if (!lines.length) return;
  const lite = ctx.tier === "lite";
  const tl = gsap.timeline({ delay: 0.15 });
  lines.forEach((line, i) => {
    const text = (line.textContent ?? "").trim();
    tl.to(
      line,
      {
        duration: lite ? 0.35 : 0.45,
        scrambleText: { text, chars: "01", revealDelay: lite ? 0.08 : 0.12, speed: 0.6 },
        ease: "none",
      },
      i * (lite ? 0.1 : 0.12),
    );
  });
}
