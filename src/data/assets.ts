// Plain data so Node scripts (scripts/*.mjs) can import it; image loading lives in src/lib/images.ts.
import type { AssetKey, AssetSlot } from "./types";
import { campaigns } from "./campaigns.ts";

/** The SEO tool (case study 3), captured from its public pages at 1440×900 (r10). */
export const seoToolShots = [
  {
    file: "seo-tool-01-create.webp",
    alt: "SEO Tool create screen: three modes (Generate Article, Optimize Existing, Import Brief) above three playbooks, SEO Blog Post, Pillar Page and Quick Update, each with its steps",
  },
  {
    file: "seo-tool-02-articles.webp",
    alt: "SEO Tool articles list: six draft articles with their status and last-updated dates, and a New Article button",
  },
  {
    file: "seo-tool-03-research.webp",
    alt: "SEO Tool research screen: keyword research reports with competitor analysis, one completed report",
  },
  {
    file: "seo-tool-04-dashboard.webp",
    alt: "SEO Tool performance dashboard: ranking positions for published articles, next actions and a share of voice panel",
  },
  {
    file: "seo-tool-05-ai-visibility.webp",
    alt: "SEO Tool AI visibility screen: tracked queries, total checks, visibility and citation rates, and prompt performance by platform",
  },
];

/**
 * Every replaceable asset. To swap a placeholder for the real file, overwrite the file at
 * `path` with one of the same name, format and aspect ratio. Nothing else needs to change.
 * `npm run assets:check` lists the slots that still hold the generated placeholder.
 */
export const assetSlots: AssetSlot[] = [
  {
    // Rendered from the owner's VRoid model by scripts/render-avatar.mjs (r9), never hand-edited.
    id: "avatar",
    path: "src/assets/avatar/avatar.webp",
    width: 1200,
    height: 1500,
    format: "webp",
    alt: "3D anime avatar of Aden Khan, product marketer",
    usedOn: ["/ (hero poster: the LCP image under the live 3D model)"],
  },
  {
    id: "ogDefault",
    path: "src/assets/og/default.png",
    width: 1200,
    height: 630,
    format: "png",
    alt: "Aden Khan, Product Marketer: portfolio card with red and blue orbs meeting in purple",
    usedOn: ["og:image on /thanks/ and the 404"],
  },
  // Per-page social cards rendered from the VRoid model (r9, scripts/render-avatar.mjs og). No text.
  ...(["home", "about", "contact"] as const).map((page): AssetSlot => ({
    id: `og-${page}`,
    path: `src/assets/og/${page}.png`,
    width: 1200,
    height: 630,
    format: "png",
    alt: "Aden Khan's 3D anime avatar beside red and blue orbs meeting on a navy background",
    usedOn: [`og:image on /${page === "home" ? "" : `${page}/`}`],
  })),
  {
    // A collage of the owner's creatives with the page title (r10, scripts/render-og-work.mjs).
    id: "og-work",
    path: "src/assets/og/work.png",
    width: 1200,
    height: 630,
    format: "png",
    alt: "Product marketing missions: a collage of Aden Khan's Instagram carousels and seller campaign posts",
    usedOn: ["og:image on /work/"],
  },
  // The owner's creative work, one slot per image, alt text from src/data/campaigns.ts (r10).
  ...campaigns.flatMap((c) =>
    c.slides.map((slide): AssetSlot => ({
      id: `creative-${slide.file.replace(/\.webp$/, "")}`,
      path: `src/assets/work/creative/${slide.file}`,
      width: slide.width,
      height: slide.height,
      format: "webp",
      alt: slide.alt,
      usedOn: [`/work/ (campaign shelf: ${c.title})`],
    })),
  ),
  ...seoToolShots.map((shot): AssetSlot => ({
    id: `seo-tool-${shot.file.replace(/^seo-tool-|\.webp$/g, "")}`,
    path: `src/assets/work/seo-tool/${shot.file}`,
    width: 1440,
    height: 900,
    format: "webp",
    alt: shot.alt,
    usedOn: ["/work/ (case study 3, SEO tool)"],
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
