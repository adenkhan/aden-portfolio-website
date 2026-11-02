import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Registers the plugins every page uses and the two DESIGN.md curves, once per document. */
export function registerCore(): void {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("ui-out", "0.23,1,0.32,1");
  CustomEase.create("ui-in-out", "0.77,0,0.175,1");
  registered = true;
}

export { gsap, ScrollTrigger };
