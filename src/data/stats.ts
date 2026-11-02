import type { Stat } from "./types";

// Home stats strip, word for word from docs/SEO.md (appendix, Home).
export const stats: [Stat, Stat, Stat, Stat] = [
  { value: 72, prefix: "−", suffix: "%", display: "−72%", label: "customer acquisition cost", lane: "both" },
  { value: 40, prefix: "+", suffix: "%", display: "+40%", label: "program awareness", lane: "creative" },
  {
    value: 7000,
    prefix: "$",
    suffix: "+",
    display: "$7,000+",
    label: "sponsorships secured",
    lane: "creative",
  },
  { value: 4, display: "4", label: "marketing roles since 2025", lane: "data" },
];
