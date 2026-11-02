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

Placement rule (r2): the copy is visual first (`CLAUDE.md` §4a), so keywords live in the titles, meta descriptions, **H1s**, the **case-study company names** (Sadiq.ai, 10Pearls, Leasap, Invest2Innovate), the **About chips** (IBA Karachi · BBA Marketing; Google Data Analytics certified) and **image alt text**. Section H2s are short structural labels, mostly visually hidden. (Before r2: title, H1 and first paragraph, plus descriptive visible H2s.) Never repeat a keyword in the same sentence, never add hidden keyword text, never list keywords in a footer block.

## 3. Pages

Limits: title ≤ 60 characters, description ≤ 155 characters, exactly one H1. Lengths were counted.

| Path | Title (chars) | Description (chars) | H1 |
|---|---|---|---|
| `/` | Aden Khan, Product Marketer \| Portfolio (39) | Aden Khan is a product marketer in Karachi blending storytelling, analytics and automation to drive adoption and growth for tech products. (138) | Aden Khan, Product Marketer |
| `/about/` | About Aden Khan, Product Marketing \| IBA Karachi (48) | IBA Karachi BBA Marketing student focused on tech product marketing, product analytics and go-to-market. Background, education and goals. (137) | Origin arc of a product marketer |
| `/work/` | Product Marketing Projects & Skills \| Aden Khan (47) | Product marketing case studies: 72% lower CAC at Sadiq.ai, an SEO content app at 10Pearls, automation in HubSpot and n8n, and more. (131) | Product marketing missions |
| `/contact/` | Contact Aden Khan, Product Marketer (35) | Hiring for product marketing? Reach Aden Khan by email or LinkedIn. Open to internships and full-time roles from mid-2027. (122) | Open a channel |
| `/thanks/` | Message received \| Aden Khan | Thanks for getting in touch. Aden Khan will reply by email. | Message received |
| `/404` | Page not found \| Aden Khan | This page does not exist. Go to Aden Khan's product marketing work or contact page. | Page not found |

`/thanks/` and `/404` are `noindex, nofollow` and excluded from the sitemap.

**H1 subline (r2):** the Contact H1 "Open a channel" has no target keyword, which would break the non-negotiable in `CLAUDE.md`. It keeps a visible second line inside the same `<h1>`, styled smaller (the owner chose this in r2):

```html
<h1>Open a channel
  <span class="h1-sub">Contact Aden Khan, product marketer</span></h1>
```
The subline is real, visible text, not hidden keywords. Home ("Aden Khan, Product Marketer"), About ("Origin arc of a product marketer") and Work ("Product marketing missions") contain a keyword in the H1 itself; the About subline was dropped in r2.

## 4. Heading structure

No skipped levels. A heading marked *(visually hidden)* is real text with the `sr-only` utility, used only where the design has no visible heading but the structure needs one.

**Home `/`**
- H1 Aden Khan, Product Marketer
- H2 Product marketing results in numbers *(visually hidden; stat counters)*
- H2 CREATIVE · DATA · GROWTH *(the scroll moment; the three words are the heading)*

**About `/about/`**
- H1 Origin arc of a product marketer
- H2 Origin arc, 2025 to 2026 *(visually hidden)*
  - H3 2025 · Invest2Innovate · H3 2025 · Sadiq.ai · H3 2025–26 · Leasap · H3 2026 · 10Pearls
- H2 Education and certification *(visually hidden; the two chips)*
- H2 Next quest *(visible label)*

**Work `/work/`**
- H1 Product marketing missions
- H2 Case studies *(visually hidden)*
  - H3 one per case study (six; titles from the appendix). Company, problem, move and result form a `<dl>` with visually hidden terms.
- H2 Skills *(visually hidden)*
  - H3 Product marketing · H3 Growth · H3 Data & automation · H3 Creative
- H2 Creative drops

**Contact `/contact/`**
- H1 Open a channel / Contact Aden Khan, product marketer
- H2 Email, LinkedIn, GitHub and CV *(visually hidden; terminal panel)*
- H2 Send a message *(visually hidden; form)*

Visually hidden headings are short, plain labels for screen-reader navigation, never keyword lists.

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

Alt strings live in `src/data/assets.ts`, one per asset slot. Since r2 the six case-study images carry the company and tool names (Sadiq.ai, Meta, Amplitude, 10Pearls, HubSpot, n8n, Ahrefs, Leasap, Sales Navigator, Invest2Innovate), which the visible copy now keeps short.

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
- Every page links to Work and Contact in the nav; Home and About also link to them in the body.
  - Home: "See the missions" button → `/work/`. (r2 removed the teaser's contact link; Contact is in the nav.)
  - About: "Next quest" buttons → `/work/` ("See the missions") and `/contact/` ("Open a channel").
  - Work and Contact: r2 removed the closing and intro links to keep to the word budgets; the nav carries them.
- Link text describes the destination. No "click here".
- Case studies no longer link to About arcs (r2: each arc is one line, so there is no longer story to link to). Stable ids: case studies `/work/#mission-<id>`; arcs `/about/#arc-invest2innovate`, `#arc-sadiq`, `#arc-leasap`, `#arc-10pearls`.

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
- [ ] Each page has one H1 that contains a target keyword (Contact through its subline). Checked by `tests/e2e/smoke.spec.ts`.
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
- [ ] Home and About link to `/work/` and `/contact/` in the body as well as the nav (r2 dropped the Work and Contact body links for the word budgets).
- [ ] Mobile: viewport meta present, body text ≥ 16px, tap targets ≥ 44px, no horizontal scroll at 360px.
- [ ] Lighthouse mobile SEO ≥ 95 (aim 100) and Accessibility ≥ 95 on every route.
- [ ] The phone number from `docs/cv-source.md` appears nowhere in the built site.
- [ ] Google Search Console: property added and sitemap submitted (needs the owner's sign-in).

---

## Appendix: site copy (r2, word for word from the owner)

Replaces the design-plan copy (p06). Visible text on the four pages is only this, plus nav, buttons, form labels, alt text and the footer. The CV dialog previews the PDF and is exempt.

### Home
- HUD label: PLAYER 01 · PRODUCT MARKETING
- H1: Aden Khan, Product Marketer
- Line: I find where users drop off, then build the fix.
- Buttons: See the missions · Get my CV
- Stat counters (number large, label small): −72% | acquisition cost · +40% | program reach · $7K+ | sponsorships raised · 4 | companies shipped for
- Scroll moment: three words only, revealed as the orbs collide: CREATIVE · DATA · GROWTH

### About
- H1: Origin arc of a product marketer
- Bio (3 short lines): Started making memes that sold. Got curious about why they worked. Now I work where product, data and marketing meet.
- Arcs (one line each, plus a stat chip):
  - 2025 · Invest2Innovate: Campaigns that got founders to notice an accelerator. [+40% reach]
  - 2025 · Sadiq.ai: Onboarding, adoption and paid growth for a social commerce app. [−72% CAC]
  - 2025–26 · Leasap: Go-to-market research and outreach for a U.S. proptech startup. [Pipeline built]
  - 2026 · 10Pearls: Shipped an SEO app and automated the marketing funnel. [2 tools shipped]
- Chips: IBA Karachi · BBA Marketing · Class of 2027 | Google Data Analytics certified
- Next quest: Product marketing at a tech company. Internships now, full-time from mid-2027.

### Work
- H1: Product marketing missions
- Case studies (title / company / problem / move / result), each line one line on desktop:
  1. Cut the cost of growth / Sadiq.ai / Paid acquisition was eating the budget. / Performance-led Meta campaigns, with Amplitude tracking onboarding and feature adoption. / −72% customer acquisition cost
  2. Let the robots do the busywork / 10Pearls / Leads moved between tools by hand. / HubSpot + n8n workflows: capture → enrich → lifecycle email → CRM handoff. / Manual handoffs automated
  3. An SEO writer’s cockpit / 10Pearls / Writers juggled keyword tools, competitor tabs and drafts. / One app combining Ahrefs keyword ideas, competitor research and drafting, plus a cannibalization checker. / Overlaps caught before publishing
  4. Open doors in U.S. proptech / Leasap / An early startup needed partners, customers and funding. / Sales Navigator pipelines and a funding tracker. / 1–2 funding applications a week
  5. Make founders notice / Invest2Innovate / An accelerator program needed founders and LPs to pay attention. / Reels, carousels and story-led LinkedIn and Instagram campaigns across 3 initiatives. / +40% program awareness
  6. Fund the club / IBA Animation & Pop Culture Society / A student society needed money and an audience. / 15+ tailored sponsor proposals and $300/month campaigns. / $7,000+ raised · +1,500 followers in 6 months
- Skills (a visual, no paragraphs), four clusters: Product marketing (positioning, GTM, sales enablement, user research) · Growth (Meta, Google, LinkedIn, TikTok Ads, CRO) · Data & automation (Amplitude, GA4, GTM, Looker Studio, SQL, HubSpot, n8n, Zapier) · Creative (Canva, Photoshop, CapCut, Figma)
- Gallery heading: Creative drops

### Contact
- H1: Open a channel (with the visible subline "Contact Aden Khan, product marketer", see §3)
- Line: Hiring a product marketer? Say hi.
- Links: email, LinkedIn, GitHub, CV

### Kept outside the owner's list
- Footer: © 2026 Aden Khan · Product Marketer · Karachi, Pakistan
- `/thanks/` and `/404` copy (system pages), titles, descriptions and OG alt text in §3 and §6
- Visually hidden H2s listed in §4
