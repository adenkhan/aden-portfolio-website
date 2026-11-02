import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import type { MomentContext } from "../types";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const FONT_WAIT_MS = 600;
const INTRO_WAIT_MS = 3000;

/**
 * On Home's first visit the reveal is part of the intro: wait for the intro's reveal beat.
 * Resolves `instant: true` when the intro was skipped, so the hero shows its final state at once.
 */
function introGate(): Promise<{ instant: boolean }> {
  if (!document.documentElement.classList.contains("intro")) return Promise.resolve({ instant: false });
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ instant: true }), INTRO_WAIT_MS);
    window.addEventListener(
      "ak:intro-reveal",
      (event) => {
        clearTimeout(timer);
        resolve({ instant: Boolean((event as CustomEvent<{ instant: boolean }>).detail?.instant) });
      },
      { once: true },
    );
  });
}

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

  const { instant } = await introGate();
  if (instant) return;

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
