import type { MotionTier } from "./tier";

export interface MomentContext {
  tier: MotionTier;
  /** (hover: hover) and (pointer: fine) */
  fine: boolean;
  /** min-width: 768px */
  wide: boolean;
  /**
   * Runs `fn` inside the page's gsap.matchMedia context. Use it for animations created after an
   * await, so they still revert when the media conditions change (for example reduced motion).
   */
  add: (fn: () => void | (() => void)) => void;
}
