import type { MotionTier } from "./tier";

export interface MomentContext {
  tier: MotionTier;
  /** (hover: hover) and (pointer: fine) */
  fine: boolean;
  /** min-width: 768px */
  wide: boolean;
}
