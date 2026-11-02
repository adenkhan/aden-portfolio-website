import type { Stat } from "./types";

// Home stat counters (r2): number large, label small.
export const stats: [Stat, Stat, Stat, Stat] = [
  { value: 72, prefix: "−", suffix: "%", display: "−72%", label: "acquisition cost", lane: "both" },
  { value: 40, prefix: "+", suffix: "%", display: "+40%", label: "program reach", lane: "creative" },
  { value: 7, prefix: "$", suffix: "K+", display: "$7K+", label: "sponsorships raised", lane: "creative" },
  { value: 4, display: "4", label: "companies shipped for", lane: "data" },
];
