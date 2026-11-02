import type { Stat } from "./types";

// Home stat counters (r2): number large, label small. Meters (r5) draw the same real numbers:
// rings to 72% and 40%, seven ticks for $7K (one per $1,000), four dots for four companies.
export const stats: [Stat, Stat, Stat, Stat] = [
  {
    value: 72,
    prefix: "−",
    suffix: "%",
    display: "−72%",
    label: "acquisition cost",
    lane: "both",
    meter: { kind: "ring", percent: 72 },
  },
  {
    value: 40,
    prefix: "+",
    suffix: "%",
    display: "+40%",
    label: "program reach",
    lane: "creative",
    meter: { kind: "ring", percent: 40 },
  },
  {
    value: 7,
    prefix: "$",
    suffix: "K+",
    display: "$7K+",
    label: "sponsorships raised",
    lane: "creative",
    meter: { kind: "ticks", count: 7 },
  },
  { value: 4, display: "4", label: "companies shipped for", lane: "data", meter: { kind: "dots", count: 4 } },
];
