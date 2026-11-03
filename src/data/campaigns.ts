// The owner's real creative work (r10), shown on /work as the campaign shelf. Copy, order and alt text
// are the owner's, word for word; nothing here adds results, dates or roles. Images live in
// src/assets/work/creative/ (docs/ASSETS.md). Never use franchise names in alt text, file names,
// headings or meta tags (docs/DECISIONS.md, r10).

export type CampaignFormat = "carousel" | "campaign" | "single" | "concept";

export interface CampaignSlide {
  /** File name in src/assets/work/creative/. */
  file: string;
  width: number;
  height: number;
  alt: string;
  /** The slide's own number when only some slides are shown (01, 02, 03, 08). */
  number?: string;
}

export interface Campaign {
  id: string;
  title: string;
  client: string;
  format: CampaignFormat;
  caption: string;
  /** Shown as a visible label (concept and spec work). */
  disclaimer?: string;
  /** Only some of the carousel's slides are shown. */
  selected?: boolean;
  /** Soft placeholder colour while images load: the cover's average colour. */
  tint: string;
  slides: CampaignSlide[];
}

const square = (file: string, alt: string, number?: string): CampaignSlide => ({
  file,
  width: 1200,
  height: 1200,
  alt,
  number,
});
const poster = (file: string, alt: string): CampaignSlide => ({ file, width: 1024, height: 1536, alt });

export const campaigns: Campaign[] = [
  {
    id: "shopping-psychology",
    title: "Shopping psychology",
    client: "Sadiq.ai",
    format: "carousel",
    caption: "An Instagram carousel on why we add to cart and why we abandon it.",
    tint: "#e3e1e1",
    slides: [
      square(
        "sadiq-psychology-01-add-to-cart-syndrome.webp",
        "Carousel cover: The Science of Add to Cart Syndrome, Your Brain vs. Your Wallet",
      ),
      square(
        "sadiq-psychology-02-dopamine-hit.webp",
        "Slide: The Dopamine Hit, adding to cart feels like a reward even without checking out",
      ),
      square(
        "sadiq-psychology-03-scarcity-trap.webp",
        "Slide: The Scarcity Trap, how 'only 2 left in stock' triggers panic buying",
      ),
      square(
        "sadiq-psychology-04-decision-paralysis.webp",
        "Slide: Decision Paralysis, too many choices lead shoppers to abandon their cart",
      ),
    ],
  },
  {
    id: "what-is-social-commerce",
    title: "What is social commerce?",
    client: "Sadiq.ai",
    format: "carousel",
    caption: "An explainer carousel positioning Sadiq.ai in social commerce.",
    selected: true,
    tint: "#738bb1",
    slides: [
      square(
        "sadiq-social-commerce-01-what-is-social-commerce.webp",
        "Carousel cover: What is social commerce? Why Sadiq.ai leads the way",
        "01",
      ),
      square(
        "sadiq-social-commerce-02-definition.webp",
        "Slide defining social commerce as shopping blended with social interaction and trust",
        "02",
      ),
      square(
        "sadiq-social-commerce-03-how-sadiq-leads.webp",
        "Slide: how Sadiq.ai helps Gen Z and Gen Alpha create, sell and connect in communities",
        "03",
      ),
      square(
        "sadiq-social-commerce-08-future-is-now.webp",
        "Closing slide: The future is now, Sadiq.ai is building the future of shopping",
        "08",
      ),
    ],
  },
  {
    id: "skincare-bundle-deals",
    title: "Skincare bundle deals",
    client: "Sadiq.ai × Blysmo Pakistan",
    format: "campaign",
    caption: "Bundle offers for a Sadiq.ai seller, each with a 10% bundle discount and free shipping.",
    tint: "#c1d2aa",
    slides: [
      square(
        "sadiq-blysmo-bundles-01-skincare-bundle-deals.webp",
        "Campaign cover: Blysmo skincare bundle deals on Sadiq.ai",
      ),
      square(
        "sadiq-blysmo-bundles-02-bb-night-cream-set.webp",
        "Blysmo bundle ad: BB night cream, whitening face wash and body wash, 10% off",
      ),
      square(
        "sadiq-blysmo-bundles-03-moisturizing-lotion-set.webp",
        "Blysmo bundle ad: moisturizing lotion, sunscreen and whitening face wash, 10% off",
      ),
      square(
        "sadiq-blysmo-bundles-04-tea-tree-set.webp",
        "Blysmo bundle ad: tea tree cream, serum and cleanser, 10% off",
      ),
    ],
  },
  {
    id: "eid-sale",
    title: "Eid sale",
    client: "Sadiq.ai sellers",
    format: "campaign",
    caption: "A teaser-then-offer Eid campaign for small sellers on Sadiq.ai.",
    tint: "#caa693",
    slides: [
      square(
        "sadiq-eid-01-reminder-teaser.webp",
        "Phone lock-screen reminder teasing an Eid surprise from Sadiq",
      ),
      square(
        "sadiq-eid-02-totes-and-knots-10-off.webp",
        "Eid sale ad for Totes and Knots: tote bag and trays, flat 10% off",
      ),
      square(
        "sadiq-eid-03-elixir-cosmetics-bogo.webp",
        "Eid sale ad for Elixir Cosmetics keratin hair therapy oil, buy 1 get 1",
      ),
    ],
  },
  {
    id: "coming-soon",
    title: "Coming soon",
    client: "Sadiq.ai",
    format: "single",
    caption: "A launch teaser post.",
    tint: "#1a1a1a",
    slides: [
      square(
        "sadiq-teaser-coming-soon.webp",
        "Dark teaser post with a hidden-eye icon: Coming soon, stay tuned",
      ),
    ],
  },
  {
    id: "good-liar",
    title: "Good Liar",
    client: "Concept campaign",
    format: "concept",
    caption: "Concept ads for a non-alcoholic IPA, built on pop-culture parody.",
    disclaimer: "Concept / spec work, not affiliated with any brand or franchise",
    tint: "#b85c4f",
    slides: [
      poster(
        "good-liar-01-name-in-the-notebook.webp",
        "Concept poster: an anime-style character holds a Good Liar can, 'your name won't be added to the notebook'",
      ),
      poster(
        "good-liar-02-blend-in.webp",
        "Concept poster: a game-style crewmate beside a Good Liar can, 'wanna blend in without being sus?'",
      ),
      poster(
        "good-liar-03-watch-me-lie.webp",
        "Concept poster: a hand holds a Good Liar can in front of a burning house, 'just gonna stand there and watch me lie'",
      ),
    ],
  },
];

/** "Carousel · 4 slides", "Campaign · 3 posts", "Concept", "Single post". */
export function formatChip(c: Campaign): string {
  const n = c.slides.length;
  if (c.format === "carousel") return `Carousel · ${n} ${c.selected ? "selected slides" : "slides"}`;
  if (c.format === "campaign") return `Campaign · ${n} posts`;
  if (c.format === "single") return "Single post";
  return "Concept";
}
