import type { World } from "@/components/world/scene";
import { boneWorld } from "./look";
import type { Avatar } from "./avatar";

/**
 * How the avatar reacts to each page (r9, docs/MOTION.md §24). Rebuilt on every page load.
 * - Everywhere: a smile when the pointer finds a stat or a button.
 * - Home: she points at the main call-to-action on hover; the CV button makes her do a mini cast,
 *   and its burst comes from her hands.
 * - About: she glances at each manga panel as it slams in, with a small smile.
 * - Contact: she waves when the section enters view and smiles when the form is sent.
 */
export function avatarPageHooks(avatar: Avatar, world: World): () => void {
  avatar.attach();
  const off: Array<() => void> = [];
  const on = (target: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    off.push(() => target.removeEventListener(type, fn, opts));
  };
  const rig = avatar.rig;

  let lastSmile = 0;
  on(document, "pointerover", (e) => {
    const hit = (e.target as Element | null)?.closest(".btn, .cv-button, [data-stat], [data-count]");
    if (!hit || performance.now() - lastSmile < 1500) return;
    lastSmile = performance.now();
    rig.express("happy", 0.55, 0.9);
  });

  // Home: the CV button's mini cast; the burst leaves from between her hands.
  on(document, "click", (e) => {
    if (!(e.target as Element | null)?.closest("[data-cv-trigger]")) return;
    rig.pose("castReady", 0.25).then(() =>
      rig.pose("castRelease", 0.18).then(() => {
        const box = avatar.box;
        if (box) {
          const v = boneWorld(avatar.vrm, "rightHand").project(avatar.camera);
          world.burstAt(box.x + ((v.x + 1) / 2) * box.w, box.y + ((1 - v.y) / 2) * box.h);
        }
        rig.express("happy", 0.6, 0.8);
        setTimeout(() => rig.pose("idle", 0.6), 500);
      }),
    );
  });

  // Home: she points toward the main call-to-action while the pointer is on it.
  const cta = document.querySelector(".cta .btn");
  if (cta) {
    on(cta, "pointerenter", () => rig.pose("point", 0.4));
    on(cta, "pointerleave", () => rig.pose("idle", 0.5));
  }

  // About: a glance at each panel on its slam.
  on(window, "ak:arc-lit", (e) => {
    const count = (e as CustomEvent<{ count: number }>).detail.count;
    const panel = document.querySelectorAll<HTMLElement>("[data-arc-panel]")[count - 1];
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    avatar.glance(r.left + r.width / 2, r.top + r.height / 2, 1.1);
    rig.express("happy", 0.35, 0.5);
  });

  // Contact: wave on entry; smile on submit.
  const contact = document.querySelector("[data-avatar-anchor='contact']");
  if (contact) {
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      rig.pose("wave", 0.45);
      rig.express("happy", 0.5, 1.6);
      setTimeout(() => rig.pose("idle", 0.7), 2200);
    });
    io.observe(contact);
    off.push(() => io.disconnect());
  }
  on(document, "submit", () => rig.express("happy", 0.8, 2));

  return () => off.forEach((fn) => fn());
}
