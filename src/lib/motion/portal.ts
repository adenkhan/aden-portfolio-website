import { gsap } from "gsap";

/**
 * Portal page transitions (r8c, docs/MOTION.md §19). Installed once (the module outlives page swaps):
 * - On a router navigation a purple orb grows from the click point (a clip-path circle) to cover the
 *   screen. The router's loader waits for it, so the page is fetched while the orb grows; the 3D
 *   camera starts its flight to the next station on the same event (world controller).
 * - Behind the orb the page swaps with no view-transition animation (html[data-portal]).
 * - On arrival the page sits at the top, smooth scroll stays stopped, and the orb collapses into the
 *   new page's H1, which decodes with ScrambleText (headline.ts reads html[data-arrival]).
 * Reduced motion keeps the plain router swap.
 */
const GROW = 0.5;
const COLLAPSE = 0.6;

const reduced = () =>
  matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.documentElement.dataset.motion === "reduced";

export function installPortal(): void {
  const root = document.documentElement;
  const state = { x: innerWidth / 2, y: innerHeight / 2, r: 0 };
  let orb: HTMLElement | null = null;
  let active = false;
  let lastPointer = { x: 0, y: 0, t: -Infinity };

  const apply = () => {
    orb?.style.setProperty("--x", `${state.x}px`);
    orb?.style.setProperty("--y", `${state.y}px`);
    orb?.style.setProperty("--r", `${state.r}px`);
  };
  const ensureOrb = () => {
    if (orb?.isConnected) return orb;
    orb = document.createElement("div");
    orb.className = "portal";
    orb.dataset.portal = "";
    orb.setAttribute("aria-hidden", "true");
    root.append(orb);
    return orb;
  };

  // Where the navigation came from: the pointer if it just went down, else the link's centre.
  addEventListener(
    "pointerdown",
    (e) => (lastPointer = { x: e.clientX, y: e.clientY, t: performance.now() }),
    { capture: true, passive: true },
  );
  const origin = (source?: Element) => {
    if (performance.now() - lastPointer.t < 1500) return { x: lastPointer.x, y: lastPointer.y };
    const box = source?.getBoundingClientRect();
    return box
      ? { x: box.left + box.width / 2, y: box.top + box.height / 2 }
      : { x: innerWidth / 2, y: innerHeight / 2 };
  };

  document.addEventListener("astro:before-preparation", (event) => {
    if (reduced()) return;
    const ev = event as Event & { sourceElement?: Element; loader: () => Promise<void> };
    const from = origin(ev.sourceElement);
    window.__akLenis?.stop();
    active = true;
    root.dataset.portal = "";
    ensureOrb().classList.add("is-open");
    Object.assign(state, from, { r: 0 });
    apply();
    const cover = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y));
    const grown = new Promise<void>((resolve) =>
      gsap.to(state, {
        r: cover * 1.05,
        duration: innerWidth < 768 ? GROW * 0.8 : GROW,
        ease: "power2.in",
        overwrite: true,
        onUpdate: apply,
        onComplete: resolve,
      }),
    );
    const load = ev.loader;
    ev.loader = async () => {
      await Promise.all([load(), grown]);
    };
  });

  // The swap replaces <html>'s attributes: put the portal state back before the transition runs.
  document.addEventListener("astro:after-swap", () => {
    if (!active) return;
    root.dataset.portal = "";
    root.dataset.arrival = "portal";
  });

  document.addEventListener("astro:page-load", () => {
    if (!active) return;
    active = false;
    // The new page's smooth scroll exists now (motion boots on astro:page-load first).
    const lenis = window.__akLenis;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    lenis?.stop();
    const h1 = document.querySelector("main h1");
    const box = h1?.getBoundingClientRect();
    const to = box
      ? { x: box.left + Math.min(box.width, 320) / 2, y: box.top + Math.min(box.height, 80) / 2 }
      : { x: innerWidth / 2, y: innerHeight / 2 };
    gsap.to(state, {
      ...to,
      r: 0,
      duration: innerWidth < 768 ? COLLAPSE * 0.8 : COLLAPSE,
      delay: 0.05,
      ease: "power3.inOut",
      overwrite: true,
      onUpdate: apply,
      onComplete: () => {
        orb?.classList.remove("is-open");
        delete root.dataset.portal;
        window.__akLenis?.start();
      },
    });
  });
}
