import { gsap, ScrollTrigger } from "../eases";

/**
 * Section-to-section panel wipe with a halftone edge (r5, docs/MOTION.md §15). A cover in the page
 * colour sits over the section and slides off to the right as the section enters, its leading edge a
 * fading dot pattern, so each section is uncovered like a turned manga page. Transform only; created
 * by script only (no JavaScript, no cover). Never used on a page's first screen (LCP).
 */
export function wipes(selectors: string[]): () => void {
  const covers: HTMLElement[] = [];
  const triggers: ScrollTrigger[] = [];
  for (const selector of selectors) {
    const section = document.querySelector<HTMLElement>(selector);
    if (!section) continue;
    // Already on screen at load: no cover, so nothing the reader can already see is hidden.
    if (section.getBoundingClientRect().top < innerHeight * 0.85) continue;
    section.classList.add("wipe-host");
    const cover = document.createElement("div");
    cover.className = "wipe";
    cover.setAttribute("aria-hidden", "true");
    section.append(cover);
    covers.push(cover);
    triggers.push(
      ScrollTrigger.create({
        trigger: section,
        start: "top 85%",
        once: true,
        onEnter: () =>
          gsap.to(cover, {
            xPercent: 101,
            duration: 0.6,
            ease: "ui-in-out",
            onComplete: () => cover.remove(),
          }),
      }),
    );
  }
  return () => {
    triggers.forEach((t) => t.kill());
    covers.forEach((c) => c.remove());
    document.querySelectorAll(".wipe-host").forEach((el) => el.classList.remove("wipe-host"));
  };
}
