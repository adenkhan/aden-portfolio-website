export type MotionTier = "full" | "lite" | "reduced";

interface NavigatorHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/** Capability tier from docs/MOTION.md §1. Written to <html data-motion>. */
export function getTier(): MotionTier {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return "reduced";
  const nav = navigator as NavigatorHints;
  const touch = !matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;
  const saveData = nav.connection?.saveData === true;
  return touch || lowCpu || lowMemory || saveData ? "lite" : "full";
}
