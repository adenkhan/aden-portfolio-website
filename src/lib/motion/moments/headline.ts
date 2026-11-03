import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { introGate } from "../intro-gate";
import type { MomentContext } from "../types";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const FONT_WAIT_MS = 600;
/**
 * Opt-in text reveals (docs/MOTION.md moment 3):
 *   data-reveal="headline"  kinetic type (r5): each character flips up in 3D from its bottom edge
 *   data-reveal="scramble"  ScrambleText decode, for short decorative labels
 * Arriving through the portal (r8c, html[data-arrival="portal"]) the headline decodes with
 * ScrambleText instead, as the orb collapses into it.
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
  const root = document.documentElement;
  const portal = root.dataset.arrival === "portal";
  delete root.dataset.arrival;
  // Created after awaits, so register with the matchMedia context (reverts SplitText too).
  ctx.add(() => {
    for (const el of heads) {
      if (portal) {
        decode(el);
        continue;
      }
      // Words stay grouped (so lines never break mid-word); characters flip in one after another.
      gsap.set(el, { perspective: 600 });
      SplitText.create(el, {
        type: "words,chars",
        aria: "auto",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            rotationX: -90,
            yPercent: 40,
            opacity: 0,
            transformOrigin: "50% 100%",
            duration: lite ? 0.5 : 0.7,
            stagger: lite ? 0.012 : 0.018,
            ease: "ui-out",
          }),
      });
    }

    for (const el of labels) {
      const text = (el.textContent ?? "").trim();
      gsap.to(el, { duration: 0.5, scrambleText: { text, chars: "01", revealDelay: 0.1 }, ease: "none" });
    }
  });
}

/**
 * Portal arrival (r8c): the headline's own text decodes from scrambled characters while the orb
 * collapses into it; the second line rises after. The accessible name stays the real text throughout.
 */
function decode(el: HTMLElement) {
  const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
  if (!node) return;
  const text = node.textContent!.trim();
  const span = document.createElement("span");
  span.textContent = text;
  node.replaceWith(span);
  el.setAttribute("aria-label", el.textContent!.replace(/s+/g, " ").trim());
  const sub = el.querySelector(".h1-sub");
  const tl = gsap.timeline({ onComplete: () => el.removeAttribute("aria-label") }).to(span, {
    duration: 0.75,
    delay: 0.25,
    scrambleText: { text, chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ01", revealDelay: 0.25, speed: 0.6 },
    ease: "none",
  });
  if (sub) tl.from(sub, { y: 12, opacity: 0, duration: 0.4, ease: "ui-out" }, "-=0.3");
}
