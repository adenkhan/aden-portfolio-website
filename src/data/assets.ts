// Plain data so Node scripts (scripts/*.mjs) can import it; image loading lives in src/lib/images.ts.
import type { AssetKey, AssetSlot } from "./types";

/**
 * Every replaceable asset. To swap a placeholder for the real file, overwrite the file at
 * `path` with one of the same name, format and aspect ratio. Nothing else needs to change.
 * `npm run assets:check` lists the slots that still hold the generated placeholder.
 */
// One per Work case study (r2), in case-study order. Alt text carries the company and tool names.
const missionAlt = [
  "Meta ads and Amplitude results for Sadiq.ai showing lower customer acquisition cost",
  "HubSpot and n8n workflow automating lead capture and CRM handoff at 10Pearls",
  "SEO writing app with Ahrefs keyword ideas and a cannibalization checker, built at 10Pearls",
  "LinkedIn Sales Navigator pipeline and funding tracker built for Leasap",
  "LinkedIn and Instagram campaign creative for the Invest2Innovate i2iScale accelerator",
  "Sponsorship proposal and social post for the IBA Animation & Pop Culture Society",
];

const galleryAlt = [
  "Meta ad creative for Sadiq.ai Blessed Friday sale, 89% off",
  "Amplitude onboarding funnel dashboard for Sadiq.ai",
  "LinkedIn carousel for the i2iScale accelerator program",
  "Instagram reel cover for the i2iScale accelerator program",
  "Meta ad creative for Sadiq.ai online sellers",
  "HubSpot lifecycle email workflow built at 10Pearls",
  "n8n lead enrichment workflow built at 10Pearls",
  "Social post for the IBA Animation and Pop Culture Society",
];

const pad = (n: number) => String(n).padStart(2, "0");

export const assetSlots: AssetSlot[] = [
  {
    id: "avatar",
    path: "src/assets/avatar/avatar.png",
    width: 1200,
    height: 1500,
    format: "png",
    alt: "Illustrated anime avatar of Aden Khan, product marketer",
    usedOn: ["/ (hero, character-select card)"],
  },
  {
    id: "ogDefault",
    path: "src/assets/og/default.png",
    width: 1200,
    height: 630,
    format: "png",
    alt: "Aden Khan, Product Marketer: portfolio card with red and blue orbs meeting in purple",
    usedOn: ["og:image on every page until per-page images exist (prompt 18)"],
  },
  ...missionAlt.map((alt, i): AssetSlot => ({
    id: `mission-${pad(i + 1)}`,
    path: `src/assets/work/mission-${pad(i + 1)}.webp`,
    width: 1200,
    height: 800,
    format: "webp",
    alt,
    usedOn: [`/work/ (case study ${i + 1})`],
  })),
  ...galleryAlt.map((alt, i): AssetSlot => ({
    id: `gallery-${pad(i + 1)}`,
    path: `src/assets/work/gallery-${pad(i + 1)}.webp`,
    width: 1080,
    height: 1350,
    format: "webp",
    alt,
    usedOn: ["/work/ (creative gallery)"],
  })),
  {
    id: "cvPdf",
    path: "public/cv/aden-khan-cv.pdf",
    width: 0,
    height: 0,
    format: "pdf",
    alt: "Aden Khan CV (PDF)",
    usedOn: ["CV buttons in the nav, Home hero and Contact"],
  },
];

export function getSlot(id: AssetKey): AssetSlot {
  const slot = assetSlots.find((s) => s.id === id);
  if (!slot) throw new Error(`Unknown asset slot: ${id}`);
  return slot;
}
