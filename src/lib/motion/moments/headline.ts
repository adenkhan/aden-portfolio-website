import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import type { MomentContext } from "../types";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const FONT_WAIT_MS = 600;

/**
 * Opt-in text reveals (docs/MOTION.md moment 3):
 *   data-reveal="headline"  masked word rise
 *   data-reveal="scramble"  ScrambleText decode, for short decorative labels
 * The hidden start state comes only from html.motion-pending, which the inline gate script adds,
 * so the text is fully visible if JavaScript is off or fails.
 */
export async function headlines(ctx: MomentContext): Promise<void> {
  const heads = gsap.utils.toArray<HTMLElement>('[data-reveal="headline"]');
  const labels = gsap.utils.toArray<HTMLElement>('[data-reveal="scramble"]');
  if (!heads.length && !labels.length) return;

  // Split after the display font arrives so line breaks are final; never wait long.
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONT_WAIT_MS))]);

  const lite = ctx.tier === "lite";
  for (const el of heads) {
    SplitText.create(el, {
      type: "lines,words",
      mask: "lines",
      aria: "auto",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.words, {
          yPercent: 110,
          duration: lite ? 0.45 : 0.7,
          stagger: lite ? 0.04 : 0.05,
          ease: "ui-out",
        }),
    });
  }

  for (const el of labels) {
    const text = (el.textContent ?? "").trim();
    gsap.to(el, { duration: 0.5, scrambleText: { text, chars: "01", revealDelay: 0.1 }, ease: "none" });
  }
}
