import type { HomeCopy } from "./types";

export const home: HomeCopy = {
  h1: "Aden Khan, Product Marketer",
  subhead: "I connect what customers feel with what the data shows, then build the systems that scale it.",
  availability:
    "BBA Marketing student at IBA Karachi. Open to internships now and full-time roles from mid-2027.",
  ctaPrimary: "Download CV",
  ctaSecondary: "See my missions",
  statBars: ["Positioning", "Analytics", "Automation", "Paid growth"],
  stats: [
    {
      value: 72,
      prefix: "−",
      suffix: "%",
      display: "−72%",
      label: "customer acquisition cost",
      lane: "both",
    },
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
  ],
  teaserHeading: "Creative × Data = Growth",
  // The design plan's teaser starts with "Creative × Data = Growth."; that sentence is the H2 here.
  teaser: "Red is storytelling. Blue is analytics and automation. Purple is what happens when they collide.",
  teaserLink: { label: "Open a channel", href: "/contact/" },
};
