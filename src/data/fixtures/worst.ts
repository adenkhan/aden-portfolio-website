/**
 * Worst-case data for the break-ui check (dev only, `?data=worst`). Realistic extremes, never random:
 * long titles and organisation names, one-word titles, unbreakable strings, a long email, empty tags,
 * missing images. Shaped exactly like the real data so it enters through the same boundary.
 */
import { about } from "../timeline";
import { caseStudies } from "../missions";
import { skillLanes } from "../skills";
import { campaigns } from "../campaigns";
import type { Campaign } from "../campaigns";
import type { Arc, CaseStudy, SkillLane } from "../types";

export const worstCaseStudies: CaseStudy[] = [
  {
    ...caseStudies[0],
    title: "Rebuild the partner onboarding and activation funnel for enterprise sellers",
    company: "Invest2Innovate (i2i) Accelerator for Emerging Markets",
    move: "Lifecycle automation across HubSpot Operations Hub Enterprise, Google Analytics 4 and LinkedIn Sales Navigator Advanced Plus, with weekly cohort reviews.",
    result: "Cut cost per activated seller from $1,284.50 to $359.66 across 12 markets in 6 weeks",
    resultLead: "Cut cost per activated seller",
    resultRest: "from $1,284.50 to $359.66 across 12 markets in 6 weeks",
    count: undefined,
  },
  {
    ...caseStudies[1],
    title: "Grow",
    company: "i2i",
    result: "+1%",
    resultLead: "+1%",
    resultRest: "",
    count: undefined,
  },
  {
    ...caseStudies[2],
    title: "Internationalisation-and-localisation-readiness audit",
    company: "northwind-industries-holdings.example.com",
    result: "Owner: bartholomew.fitzgerald@northwind-industries-holdings.example.com",
    resultLead: "Owner: bartholomew.fitzgerald@northwind-industries-holdings.example.com",
    resultRest: "",
  },
  ...caseStudies.slice(3),
];

export const worstArcs: [Arc, Arc, Arc, Arc] = [
  {
    ...about.arcs[0],
    org: "Invest2Innovate (i2i) Accelerator for Emerging Markets",
    period: "Feb 2025 – present (part-time, remote)",
  },
  { ...about.arcs[1], org: "Q", chip: "−72% customer acquisition cost across web and mobile" },
  {
    ...about.arcs[2],
    line: "Researched 140+ partners and investors across U.S. MLS organisations, proptech founders, real estate operators and data vendors.",
  },
  about.arcs[3],
];

export const worstSkillLanes: SkillLane[] = [
  { ...skillLanes[0], label: "Product marketing, positioning and go-to-market strategy" },
  { ...skillLanes[1], skills: ["LinkedIn Sales Navigator Advanced Plus for enterprise prospecting", "CRO"] },
  { ...skillLanes[2], skills: [] },
  skillLanes[3],
];

/** Campaign shelf extremes: a long title and client, a one-slide carousel, a missing image (r10). */
export const worstCampaigns: Campaign[] = [
  {
    ...campaigns[0],
    id: "worst-long",
    title: "Why shoppers add to cart and then abandon it at the very last step of checkout",
    client: "Sadiq.ai × Blysmo Pakistan Skincare and Personal Care Private Limited",
    caption: campaigns[0].caption.repeat(3),
  },
  { ...campaigns[1], id: "worst-one", slides: campaigns[1].slides.slice(0, 1) },
  {
    ...campaigns[2],
    id: "worst-missing",
    slides: [{ ...campaigns[2].slides[0], file: "missing-file.webp" }, ...campaigns[2].slides.slice(1, 2)],
  },
  campaigns[5],
];
