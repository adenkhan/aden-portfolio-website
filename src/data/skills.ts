import type { SkillLane } from "./types";

export const skillLanes: SkillLane[] = [
  {
    id: "product",
    label: "Product marketing",
    lane: "both",
    skills: [
      "positioning",
      "go-to-market",
      "sales enablement",
      "pitch decks",
      "whitepapers",
      "case studies",
      "user research",
    ],
  },
  {
    id: "growth",
    label: "Growth",
    lane: "creative",
    skills: [
      "Meta, Google, LinkedIn and TikTok Ads",
      "B2B and B2C lead generation",
      "CRO",
      "social strategy",
    ],
  },
  {
    id: "data",
    label: "Data and automation",
    lane: "data",
    skills: [
      "Amplitude",
      "Google Analytics 4",
      "Google Tag Manager",
      "Looker Studio",
      "SQL",
      "R",
      "Tableau",
      "HubSpot",
      "n8n",
      "Zapier",
      "Apollo.io",
    ],
  },
  {
    id: "creative",
    label: "Creative",
    lane: "creative",
    skills: ["Canva", "Photoshop", "CapCut", "Premiere Pro", "Figma"],
  },
];
