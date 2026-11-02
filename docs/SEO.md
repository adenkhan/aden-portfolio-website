# SEO Spec — Aden Khan Portfolio

Source of truth for metadata, headings, alt text and on-page copy. Implemented by the `<SEO>` component and `src/data/seo.ts` (see `docs/ENGINEERING-PLAN.md` §3–4). Section 10 records the `fixing-metadata` review of this spec and the changes it caused.

## 1. Site constants

Everything below reads from one constant in `src/data/site.ts`:

```ts
export const SITE_URL = "https://aden-khan-portfolio.netlify.app"; // prompt 21 replaces this with the live URL
```
`astro.config.mjs` imports it for `site`, so canonical, `og:url`, `og:image`, the sitemap and robots.txt all follow it. No other file hard-codes the origin.

| Field | Value |
|---|---|
| Name | Aden Khan |
| Role | Product Marketer |
| Location | Karachi, Pakistan |
| Email | aden.khan613@gmail.com |
| LinkedIn | https://www.linkedin.com/in/adenkhank/ |
| GitHub | https://github.com/adenkhan |
| `html lang` | `en` |
| Trailing slash | always (`trailingSlash: "always"`, `build.format: "directory"`) |

## 2. Keywords

- **Primary:** Aden Khan; product marketer; product marketing portfolio; tech product marketing
- **Secondary:** product marketer Karachi; SaaS product marketing; go-to-market; product analytics (Amplitude); marketing automation (HubSpot, n8n); IBA marketing student

Placement rule: a primary keyword appears in each page's title, H1 and first paragraph. Secondary keywords go where the content already talks about them (H2s, mission cards, skills). Never repeat a keyword in the same sentence, never add hidden keyword text, never list keywords in a footer block.

## 3. Pages

Limits: title ≤ 60 characters, description ≤ 155 characters, exactly one H1. Lengths were counted.

| Path | Title (chars) | Description (chars) | H1 |
|---|---|---|---|
| `/` | Aden Khan, Product Marketer \| Portfolio (39) | Aden Khan is a product marketer in Karachi blending storytelling, analytics and automation to drive adoption and growth for tech products. (138) | Aden Khan, Product Marketer |
| `/about/` | About Aden Khan, Product Marketing \| IBA Karachi (48) | IBA Karachi BBA Marketing student focused on tech product marketing, product analytics and go-to-market. Background, education and goals. (137) | The origin arc: from campaigns to products |
| `/work/` | Product Marketing Projects & Skills \| Aden Khan (47) | Product marketing case studies: 72% lower CAC at Sadiq.ai, an SEO content app at 10Pearls, automation in HubSpot and n8n, and more. (131) | Product marketing missions, completed |
| `/contact/` | Contact Aden Khan, Product Marketer (35) | Hiring for product marketing? Reach Aden Khan by email or LinkedIn. Open to internships and full-time roles from mid-2027. (122) | Open a channel |
| `/thanks/` | Message received \| Aden Khan | Thanks for getting in touch. Aden Khan will reply by email. | Message received |
| `/404` | Page not found \| Aden Khan | This page does not exist. Go to Aden Khan's product marketing work or contact page. | Page not found |

`/thanks/` and `/404` are `noindex, nofollow` and excluded from the sitemap.

**H1 subline (added by the review, §10 change 1):** the About and Contact H1s do not contain a target keyword, which breaks the non-negotiable in `CLAUDE.md`. Each H1 keeps its phrase exactly and adds a visible second line inside the same `<h1>`, styled smaller:

```html
<h1>The origin arc: from campaigns to products
  <span class="h1-sub">About Aden Khan, product marketer</span></h1>
<h1>Open a channel
  <span class="h1-sub">Contact Aden Khan, product marketer</span></h1>
```
The subline is real, visible text, not hidden keywords. Home and Work H1s already contain keywords and stay as they are.

## 4. Heading structure

No skipped levels. A heading marked *(visually hidden)* is real text with the `sr-only` utility, used only where the design has no visible heading but the structure needs one.

**Home `/`**
- H1 Aden Khan, Product Marketer
- H2 Product marketing results in numbers *(visually hidden; stats strip)*
- H2 Creative × Data = Growth *(teaser)*

**About `/about/`**
- H1 The origin arc: from campaigns to products / About Aden Khan, product marketer
- H2 From storytelling to product analytics
  - H3 Storyteller (2025) · H3 Growth (2025) · H3 Go-to-market (2025–26) · H3 Builder (2026)
- H2 Education: BBA Marketing at IBA Karachi
- H2 Career goals in tech product marketing

**Work `/work/`**
- H1 Product marketing missions, completed
- H2 Case studies from SaaS and tech startups
  - H3 one per mission card (nine; titles from the appendix)
- H2 Skills: go-to-market, product analytics and marketing automation
  - H3 Product marketing · H3 Growth · H3 Data and automation · H3 Creative
- H2 Creative gallery: campaigns and ad creatives

**Contact `/contact/`**
- H1 Open a channel / Contact Aden Khan, product marketer
- H2 Email, LinkedIn and GitHub *(visually hidden; terminal panel)*
- H2 Send a message *(form)*

The footer and nav have no headings.

## 5. Images and alt text

Rules:
- Every content image has alt text that says what it shows and why it is there, in about 8–15 words. No "image of" or "picture of".
- Name the tool, company and result when the image shows them. Never invent a number that is not in the image or `docs/cv-source.md`.
- Decorative visuals get `alt=""` (images) or `aria-hidden="true"` (SVG, canvas): orbs, shockwave, halftone, particles, the measuring grid, the avatar placeholder shape when it sits next to a real caption.
- Text is never baked into an image. If a screenshot contains essential numbers, the caption repeats them in HTML.
- Formats: AVIF and WebP via Astro `<Picture>`, explicit width and height, `loading="lazy"` below the fold, avatar `eager` with `fetchpriority="high"`.

Examples:

| Image | Alt |
|---|---|
| Avatar (hero, character-select card) | Illustrated anime avatar of Aden Khan, product marketer |
| Ad creative (gallery) | Meta ad creative for Sadiq.ai Blessed Friday sale, 89% off |
| Analytics screenshot (gallery or mission) | Amplitude onboarding funnel dashboard for Sadiq.ai |

Patterns for images that arrive later:
- Ad creative: `<Platform> ad creative for <company> <campaign>, <offer shown>`
- Dashboard or screenshot: `<Tool> <what it shows> for <company>`
- Campaign result: `<Channel> <metric> chart for <program or company>, <period>`

Alt strings live in `src/data/assets.ts`, one per asset slot.

## 6. Social cards

One 1200×630 OG image per page (designed in prompt 18), stored in `src/assets/og/` and emitted with `getImage()` as absolute URLs: `og/home.png`, `og/about.png`, `og/work.png`, `og/contact.png`. Until they exist, all pages use `og/default.png`. Each image shows the page H1 as large type in the brand fonts, which is allowed because the same text is in the page HTML.

Tags emitted by `<SEO>` on every page:

```html
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Aden Khan, Product Marketer">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{absolute og image URL}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{og alt}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="{absolute og image URL}">
<meta name="twitter:image:alt" content="{og alt}">
```
`og:url` is always the canonical URL. No `twitter:site` or `twitter:creator` (no X account given).

OG image alt per page:
- Home: "Aden Khan, Product Marketer: portfolio card with red and blue orbs meeting in purple"
- About: "The origin arc: Aden Khan's path from campaigns to products"
- Work: "Product marketing missions completed by Aden Khan"
- Contact: "Open a channel: contact Aden Khan, product marketer"

## 7. Structured data

One JSON-LD block per page (§10 change 4), only for content the page renders.

**Home `/`**: a single `@graph` with `WebSite` and `Person`.
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://aden-khan-portfolio.netlify.app/#website",
      "url": "https://aden-khan-portfolio.netlify.app/",
      "name": "Aden Khan, Product Marketer",
      "inLanguage": "en",
      "publisher": { "@id": "https://aden-khan-portfolio.netlify.app/#person" }
    },
    {
      "@type": "Person",
      "@id": "https://aden-khan-portfolio.netlify.app/#person",
      "name": "Aden Khan",
      "jobTitle": "Product Marketer",
      "url": "https://aden-khan-portfolio.netlify.app/",
      "email": "mailto:aden.khan613@gmail.com",
      "address": { "@type": "PostalAddress", "addressLocality": "Karachi", "addressCountry": "PK" },
      "alumniOf": { "@type": "CollegeOrUniversity", "name": "Institute of Business Administration, Karachi" },
      "sameAs": ["https://www.linkedin.com/in/adenkhank/", "https://github.com/adenkhan"]
    }
  ]
}
```
All URLs are built from `SITE_URL`, never typed out in code.

**About `/about/`**: `ProfilePage` whose `mainEntity` is `{ "@id": "<SITE_URL>/#person" }`, with `url` set to the About canonical. The About page renders the bio and education, so it is the natural profile page.

Work and Contact have no JSON-LD. Nothing invents ratings, employers' details or dates.

`alumniOf` note: Aden is a current student (graduating June 2027). Schema.org uses `alumniOf` for current and former students alike, so this is accurate.

## 8. Canonical, indexing, sitemap, robots, icons

- **Canonical:** absolute, built from `SITE_URL` + the path with a trailing slash (`/`, `/about/`, `/work/`, `/contact/`). One `<link rel="canonical">` per page, emitted only by `<SEO>`.
- **Deploy previews and branch deploys:** `noindex, nofollow` unless Netlify's build `CONTEXT` is `production` (§10 change 3). Canonical still points to production.
- **GitHub Pages backup:** if ever used, its pages keep the Netlify canonical, so the two hosts never compete.
- **Sitemap:** `@astrojs/sitemap` emits `sitemap-index.xml` with `/`, `/about/`, `/work/`, `/contact/` only.
- **robots.txt:** generated from `SITE_URL`:
```
User-agent: *
Allow: /
Sitemap: https://aden-khan-portfolio.netlify.app/sitemap-index.xml
```
- **Icons:** `favicon.ico` (32×32), `favicon.svg` (scales, works in dark tabs), `apple-touch-icon.png` (180×180). No web manifest: the site is not installable, and a half-filled manifest is worse than none.
- **Theme:** `<meta name="theme-color" content="#0B0D1A">` and `<meta name="color-scheme" content="dark">` (dark-only design).

## 9. Internal linking and readability

**Internal linking**
- Every page links to Work and Contact twice: once in the nav, once in the body.
  - Home: "See my missions" button → `/work/`; teaser ends with a link to `/contact/`.
  - About: career goals paragraph links to `/work/` ("see the missions") and `/contact/`.
  - Work: closing line links to `/contact/`; the page itself is Work.
  - Contact: the intro line links to `/work/` ("the missions behind this").
- Link text describes the destination. No "click here".
- Mission cards link to the section that tells the longer story (§10 change 5). Anchors are stable ids:

| Mission | Links to |
|---|---|
| 1–3 (Sadiq.ai) | `/about/#arc-growth` |
| 4–6 (10Pearls) | `/about/#arc-builder` |
| 7 (Leasap.com) | `/about/#arc-go-to-market` |
| 8 (Invest2Innovate) | `/about/#arc-storyteller` |
| 9 (IBA Animation and Pop Culture Society) | `/work/#skills-creative` |

Other anchors: `/work/#missions`, `/work/#skills`, `/work/#gallery`, `/about/#education`, `/about/#goals`, `/contact/#message`.

**Mobile and readability**
- `<meta name="viewport" content="width=device-width, initial-scale=1">`. Never disable zoom.
- Body text ≥ 16px; captions ≥ 14px; nothing essential below 13px.
- Tap targets ≥ 44×44px, with at least 8px between them.
- Line length 60–75 characters for body text (set `max-width: 65ch`); hero subhead 36ch.
- Contrast meets WCAG AA (ratios in `DESIGN.md`).
- No horizontal scroll at 360px.

## 10. fixing-metadata review of this spec

Reviewed against the `fixing-metadata` priorities before any code exists. Changes made:

1. **H1s without a keyword (correctness).** `CLAUDE.md` requires one H1 per page containing a target keyword. About ("The origin arc: from campaigns to products") and Contact ("Open a channel") had none. Added a visible subline inside each H1 ("About Aden Khan, product marketer"; "Contact Aden Khan, product marketer") and kept the given phrase word for word. Hidden keywords were rejected.
2. **Trailing slash consistency (canonical).** Astro's default directory output serves `/about/`, and Netlify redirects `/about` to it. Without a fixed rule, canonical and `og:url` could disagree with the served URL. Set `trailingSlash: "always"` and build every canonical with the slash.
3. **Preview indexing (indexing).** Netlify deploy previews are public URLs with the same content. Added `noindex, nofollow` for any build whose `CONTEXT` is not `production`.
4. **One structured-data block per page (structured data).** The engineering plan had separate `Person` and `WebSite` blocks on Home. Merged into one `@graph` and gave `Person` an `@id` so About's `ProfilePage` can reference it instead of repeating it.
5. **Mission card links (internal linking).** The spec asked for links but named no targets. Defined stable anchors and a mission-to-arc map.
6. **Missing defaults (correctness).** `/thanks/` and `/404` had no title or description. Added them, both `noindex`.
7. **OG completeness (social cards).** Added `og:image:alt`, `twitter:image:alt`, `og:site_name`, `og:locale` and image dimensions, and required absolute image URLs.
8. **One origin constant (correctness).** `SITE_URL` in `src/data/site.ts` feeds `astro.config.mjs`, so prompt 21 changes one line.

Reviewed and left unchanged:
- **Title format.** The four titles use three patterns (`| Portfolio`, `| IBA Karachi`, `| Aden Khan`, none). The rule prefers one format, but the titles were given as exact values, so they stay. A consistent alternative would end each with `| Aden Khan`.
- **Web manifest.** Not added; the site is not an app.

## 11. Pre-launch SEO checklist

- [ ] `SITE_URL` is the live production origin (prompt 21).
- [ ] Each page has exactly one `<title>`, one meta description, one canonical and one robots tag, all from `<SEO>`.
- [ ] Titles and descriptions match §3 character for character.
- [ ] Each page has one H1 that contains a target keyword (including the About and Contact sublines).
- [ ] Heading levels follow §4 with no skips.
- [ ] Every image has alt text per §5 or is marked decorative.
- [ ] Canonical, `og:url` and the served URL agree, with trailing slashes.
- [ ] OG and Twitter images load from absolute URLs at 1200×630; previews checked with a real URL in a card validator (not localhost).
- [ ] JSON-LD validates in Google's Rich Results Test and Schema.org validator; Home has one `@graph`, About one `ProfilePage`.
- [ ] `sitemap-index.xml` lists exactly `/`, `/about/`, `/work/`, `/contact/`.
- [ ] `robots.txt` allows all and points to the sitemap.
- [ ] Deploy previews carry `noindex`; production does not.
- [ ] `/thanks/` and `/404` are `noindex` and absent from the sitemap.
- [ ] Favicon, SVG favicon and apple-touch-icon load; theme-color is `#0B0D1A`.
- [ ] Every page links to `/work/` and `/contact/` in the body as well as the nav; mission card links resolve to existing ids.
- [ ] Mobile: viewport meta present, body text ≥ 16px, tap targets ≥ 44px, no horizontal scroll at 360px.
- [ ] Lighthouse mobile SEO ≥ 95 (aim 100) and Accessibility ≥ 95 on every route.
- [ ] The phone number from `docs/cv-source.md` appears nowhere in the built site.
- [ ] Google Search Console: property added and sitemap submitted (needs the owner's sign-in).

---

## Appendix: site copy (from `docs/00-design-plan.md` §6, word for word)

### Home
- HUD label: // PLAYER 01 · PRODUCT MARKETER · KARACHI
- H1: Aden Khan, Product Marketer
- Subhead: I connect what customers feel with what the data shows, then build the systems that scale it.
- Buttons: Download CV (triggers the purple burst) · See my missions
- Hero image: high-resolution illustrated avatar in a "character select" frame with stat bars: Positioning · Analytics · Automation · Paid growth
- Stats strip: −72% customer acquisition cost · +40% program awareness · $7,000+ sponsorships secured · 4 marketing roles since 2025
- Teaser: Creative × Data = Growth. Red is storytelling. Blue is analytics and automation. Purple is what happens when they collide.
### About
- H1: The origin arc: from campaigns to products
- Bio: I'm a BBA Marketing student at IBA Karachi who fell for the product side of marketing. I started with social campaigns and memes that converted, then moved into analytics, automation and go-to-market work for tech startups. Today I care about one question: why do people adopt a product, and how do we help more of them get there?
- Arc 1, Storyteller (2025): Ran LinkedIn and Instagram campaigns for the i2iScale accelerator program, raising awareness 40%.
- Arc 2, Growth (2025): At Sadiq.ai, used Amplitude to improve onboarding, retention and feature adoption, and ran Meta campaigns that cut acquisition cost 72%.
- Arc 3, Go-to-market (2025–26): Researched partners and investors for Leasap, a U.S. proptech startup, and built its outreach pipelines.
- Arc 4, Builder (2026): At 10Pearls, shipped an SEO content app and automated marketing workflows in HubSpot and n8n.
- Education: Institute of Business Administration (IBA), Karachi · BBA, Marketing · 2023–2027. Relevant courses: Tech Product Marketing, Tech Product Development, Marketing Analytics, Product Analytics, Machine Learning. Certified: Google Data Analytics Specialization.
- Career goals: Join a tech or SaaS company as a product marketer, owning positioning, launches and adoption. Open to internships now and full-time roles from mid-2027.
### Work
- H1: Product marketing missions, completed
- Mission cards (mission | where | result):
  1. Lower the cost of growth | Sadiq.ai, Product Marketing Associate | Performance-driven Meta campaigns cut customer acquisition cost by 72%
  2. Drive feature adoption | Sadiq.ai | Amplitude analysis guided onboarding, retention and adoption fixes across web and mobile
  3. Arm the sales team | Sadiq.ai | Pitch decks, sales enablement assets, whitepapers and case studies for online sellers
  4. Ship an SEO writing tool | 10Pearls, Marketing Automation Associate | Internal app combining Ahrefs keyword data and competitor research in one drafting flow
  5. Stop keyword cannibalization | 10Pearls | Checker that flags overlapping search intent before publishing
  6. Automate the funnel | 10Pearls | HubSpot and n8n workflows for lead capture, enrichment, lifecycle email and CRM handoff
  7. Build a GTM pipeline | Leasap.com, Business Development Intern | Outreach pipelines in LinkedIn Sales Navigator; a funding tracker targeting 1–2 applications a week
  8. Grow a program's reach | Invest2Innovate, Marketing Associate | +40% awareness for i2iScale across 3 concurrent initiatives
  9. Fund a society | IBA Animation and Pop Culture Society | $7,000+ in sponsorships from 15+ proposals; 1,500+ new followers in six months
- Skills tree:
  - Product marketing: positioning, go-to-market, sales enablement, pitch decks, whitepapers, case studies, user research
  - Growth: Meta, Google, LinkedIn and TikTok Ads, B2B and B2C lead generation, CRO, social strategy
  - Data and automation: Amplitude, Google Analytics 4, Google Tag Manager, Looker Studio, SQL, R, Tableau, HubSpot, n8n, Zapier, Apollo.io
  - Creative: Canva, Photoshop, CapCut, Premiere Pro, Figma
- Creative gallery: horizontal strip of ad creatives and campaign results (real screenshots added later by the owner).
### Contact
- H1: Open a channel
- Line: Hiring a product marketer, or need help with a launch? My inbox is open.
- Email: aden.khan613@gmail.com · LinkedIn: https://www.linkedin.com/in/adenkhank/ · GitHub: https://github.com/adenkhan · Download CV
- Footer: © 2026 Aden Khan · Product Marketer · Karachi, Pakistan

### Copy added by this spec (not in the design plan)
- Home availability line, under the subhead (added in p07 so the brief's 30-second recruiter test can pass on Home; both sentences are reused from the About education and career-goals copy): BBA Marketing student at IBA Karachi. Open to internships now and full-time roles from mid-2027.
- About H1 subline: About Aden Khan, product marketer
- Contact H1 subline: Contact Aden Khan, product marketer
- H2s listed in §4
- `/thanks/` and `/404` titles, descriptions and H1s in §3
- OG image alt text in §6
