/**
 * Worst-case data for the break-ui check (dev only, `?data=worst`). Realistic extremes, never random:
 * long titles and organisation names, one-word titles, unbreakable strings, a long email, empty tags,
 * missing images. Shaped exactly like the real data so it enters through the same boundary.
 */
import { about } from "../timeline";
import { missions } from "../missions";
import { skillLanes } from "../skills";
import type { Arc, AssetKey, Mission, SkillLane } from "../types";

export const worstMissions: Mission[] = [
  {
    ...missions[0],
    title: "Rebuild the partner onboarding and activation funnel for enterprise sellers",
    org: "Invest2Innovate (i2i) Accelerator for Emerging Markets",
    role: "Senior Product Marketing and Lifecycle Automation Associate (Contract)",
    result:
      "Cut cost per activated seller from $1,284.50 to $359.66 across 12 markets in 6 weeks; 3,847 sellers onboarded",
    tags: [
      "LinkedIn Sales Navigator Advanced Plus",
      "Google Analytics 4",
      "HubSpot Operations Hub Enterprise",
    ],
    evidence: "mission-missing",
  },
  {
    ...missions[1],
    title: "Grow",
    org: "i2i",
    role: undefined,
    result: "+1%",
    tags: [],
    evidence: undefined,
  },
  {
    ...missions[2],
    title: "Internationalisation-and-localisation-readiness audit",
    org: "northwind-industries-holdings.example.com",
    result: "Owner: bartholomew.fitzgerald@northwind-industries-holdings.example.com",
  },
  ...missions.slice(3),
];

export const worstArcs: [Arc, Arc, Arc, Arc] = [
  {
    ...about.arcs[0],
    title: "Go-to-market and partnerships",
    period: "Feb 2025 – present (part-time, remote)",
  },
  { ...about.arcs[1], title: "Q" },
  {
    ...about.arcs[2],
    text: "Researched 140+ partners and investors across U.S. MLS organisations, proptech founders, real estate operators and data vendors, built outreach pipelines in LinkedIn Sales Navigator, and tracked 60+ accelerator, incubator and investor programmes in one funding sheet.",
  },
  about.arcs[3],
];

export const worstSkillLanes: SkillLane[] = [
  { ...skillLanes[0], label: "Product marketing, positioning and go-to-market strategy" },
  { ...skillLanes[1], skills: ["LinkedIn Sales Navigator Advanced Plus for enterprise prospecting", "CRO"] },
  { ...skillLanes[2], skills: [] },
  skillLanes[3],
];

export const worstGallery: AssetKey[] = ["gallery-01", "gallery-missing", "gallery-02"];
