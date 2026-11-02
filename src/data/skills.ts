import type { SkillLane } from "./types";

// Four clusters (r2), shown as a visual: the cluster names and items are the only text.
export const skillLanes: SkillLane[] = [
  {
    id: "product",
    label: "Product marketing",
    lane: "both",
    skills: ["positioning", "GTM", "sales enablement", "user research"],
  },
  {
    id: "growth",
    label: "Growth",
    lane: "creative",
    skills: ["Meta", "Google", "LinkedIn", "TikTok Ads", "CRO"],
  },
  {
    id: "data",
    label: "Data & automation",
    lane: "data",
    skills: ["Amplitude", "GA4", "GTM", "Looker Studio", "SQL", "HubSpot", "n8n", "Zapier"],
  },
  {
    id: "creative",
    label: "Creative",
    lane: "creative",
    skills: ["Canva", "Photoshop", "CapCut", "Figma"],
  },
];
