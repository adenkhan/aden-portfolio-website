import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { gsap, ScrollTrigger } from "../eases";
import type { MomentContext } from "../types";
import { wipes } from "./wipes";

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * Terminal "typing" on Contact (MOTION.md §12): the prompt, then each channel decodes from 0/1 into
 * its text, top to bottom. Only the aria-hidden copies animate; the links and their real text are in
 * the HTML from the start, so screen readers, keyboard users and no-JS visitors are never kept waiting.
 */
export function contact(ctx: MomentContext): () => void {
  // "Say hi.": the last word waves once after the H1 settles (r5).
  const wave = document.querySelector("[data-wave]");
  if (wave)
    gsap.to(wave, {
      keyframes: { rotation: [0, 14, -8, 0] },
      duration: 0.6,
      delay: 0.9,
      transformOrigin: "30% 90%",
      ease: "none",
    });

  // The form arrives as the wipe uncovers it: fields one after another.
  const fields = gsap.utils.toArray<HTMLElement>("#message .field, #message button[type=submit]");
  const cleanup = wipes(["#message"]);
  if (document.querySelector(".wipe-host#message")) {
    gsap.set(fields, { y: 12, opacity: 0 });
    ScrollTrigger.create({
      trigger: "#message",
      start: "top 85%",
      once: true,
      onEnter: () =>
        gsap.to(fields, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.3, ease: "ui-out" }),
    });
  }

  const lines = gsap.utils.toArray<HTMLElement>("[data-type]");
  if (!lines.length) return cleanup;
  const lite = ctx.tier === "lite";
  // Hierarchy (r5): the H1 lands first; the terminal decodes after it.
  const tl = gsap.timeline({ delay: 0.6 });
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
  return cleanup;
}
