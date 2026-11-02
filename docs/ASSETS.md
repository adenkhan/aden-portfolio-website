# Assets

Every image and file the site expects, with its placeholder status. **To swap a placeholder for the real asset, replace the file at its path with one of the same name and format. Nothing else changes.** Keep the same aspect ratio; any resolution at or above the listed size works (Astro resizes and converts to AVIF and WebP at build).

Check what is still a placeholder:
```
npm run assets:check              # lists every slot as "placeholder" or "real"
npm run assets:check -- --strict  # exits 1 while any placeholder remains (use before launch)
```
In `npm run dev`, placeholder images carry a small "placeholder" badge. Production builds never show it.

Slot data (paths, sizes, alt text) lives in `src/data/assets.ts`. Alt text follows `docs/SEO.md` §5. If a real image shows something different from the "Should show" column, update its `alt` in `src/data/assets.ts` too.

| Slot | Path | Size (px) | Format | Appears on | Should show | Alt text |
|---|---|---|---|---|---|---|
| avatar | `src/assets/avatar/avatar.png` | 1200×1500 (4:5) | PNG | `/` hero, character-select card (LCP image) | The original illustrated avatar, high resolution | Illustrated anime avatar of Aden Khan, product marketer |
| ogDefault | `src/assets/og/default.png` | 1200×630 | PNG | `og:image` / `twitter:image` on every page | Social card (prompt 18 adds per-page cards) | Aden Khan, Product Marketer: portfolio card with red and blue orbs meeting in purple |
| mission-01 | `src/assets/work/mission-01.webp` | 1200×800 (3:2) | WebP | `/work/` card 1 | Meta ads results, Sadiq.ai | Meta ads results for Sadiq.ai showing lower customer acquisition cost |
| mission-02 | `src/assets/work/mission-02.webp` | 1200×800 | WebP | `/work/` card 2 | Amplitude adoption chart, Sadiq.ai | Amplitude feature adoption chart for Sadiq.ai web and mobile |
| mission-03 | `src/assets/work/mission-03.webp` | 1200×800 | WebP | `/work/` card 3 | Sales deck or case study pages, Sadiq.ai | Sales enablement deck and case study pages made for Sadiq.ai |
| mission-04 | `src/assets/work/mission-04.webp` | 1200×800 | WebP | `/work/` card 4 | The SEO writing app, 10Pearls | Internal SEO writing app built at 10Pearls with Ahrefs keyword data |
| mission-05 | `src/assets/work/mission-05.webp` | 1200×800 | WebP | `/work/` card 5 | The cannibalization checker, 10Pearls | Keyword cannibalization checker flagging overlapping search intent at 10Pearls |
| mission-06 | `src/assets/work/mission-06.webp` | 1200×800 | WebP | `/work/` card 6 | HubSpot / n8n workflow, 10Pearls | HubSpot and n8n workflow for lead capture and CRM handoff at 10Pearls |
| mission-07 | `src/assets/work/mission-07.webp` | 1200×800 | WebP | `/work/` card 7 | Sales Navigator pipeline, Leasap.com | LinkedIn Sales Navigator outreach pipeline built for Leasap.com |
| mission-08 | `src/assets/work/mission-08.webp` | 1200×800 | WebP | `/work/` card 8 | i2iScale campaign creative | LinkedIn and Instagram campaign creative for the i2iScale accelerator |
| mission-09 | `src/assets/work/mission-09.webp` | 1200×800 | WebP | `/work/` card 9 | Society sponsorship proposal or post | Sponsorship proposal and event post for the IBA Animation and Pop Culture Society |
| gallery-01 | `src/assets/work/gallery-01.webp` | 1080×1350 (4:5) | WebP | `/work/` creative gallery | Sadiq.ai Blessed Friday Meta ad | Meta ad creative for Sadiq.ai Blessed Friday sale, 89% off |
| gallery-02 | `src/assets/work/gallery-02.webp` | 1080×1350 | WebP | `/work/` creative gallery | Amplitude onboarding funnel | Amplitude onboarding funnel dashboard for Sadiq.ai |
| gallery-03 | `src/assets/work/gallery-03.webp` | 1080×1350 | WebP | `/work/` creative gallery | i2iScale LinkedIn carousel | LinkedIn carousel for the i2iScale accelerator program |
| gallery-04 | `src/assets/work/gallery-04.webp` | 1080×1350 | WebP | `/work/` creative gallery | i2iScale Instagram reel cover | Instagram reel cover for the i2iScale accelerator program |
| gallery-05 | `src/assets/work/gallery-05.webp` | 1080×1350 | WebP | `/work/` creative gallery | Sadiq.ai Meta ad for sellers | Meta ad creative for Sadiq.ai online sellers |
| gallery-06 | `src/assets/work/gallery-06.webp` | 1080×1350 | WebP | `/work/` creative gallery | HubSpot lifecycle email workflow | HubSpot lifecycle email workflow built at 10Pearls |
| gallery-07 | `src/assets/work/gallery-07.webp` | 1080×1350 | WebP | `/work/` creative gallery | n8n enrichment workflow | n8n lead enrichment workflow built at 10Pearls |
| gallery-08 | `src/assets/work/gallery-08.webp` | 1080×1350 | WebP | `/work/` creative gallery | Society social post | Social post for the IBA Animation and Pop Culture Society |
| cvPdf | `public/cv/aden-khan-cv.pdf` | A4 | PDF | CV buttons (nav, Home hero, Contact) | The real CV | Link text: "Download CV (PDF)" |

## Not tracked as slots
- **Favicons** (`public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`): generated "AK" marks. Replace the files to change them.

## Regenerating placeholders
`npm run assets:generate` recreates any **missing** placeholder (never overwrites an existing file; `--force` overwrites everything, so do not use it after real assets are in). The stand-in CV comes from `scripts/make-cv-standin.py` (needs Python with `reportlab`). Placeholder hashes are stored in `src/data/placeholder-hashes.json`; a real file is detected because its hash differs.

## Rules for real images
- Original work the owner has rights to. No third-party characters, logos or named techniques (IP rule, `CLAUDE.md`).
- No important text baked into images; repeat any key number in the page text.
- Screenshots: crop to the content; no device mockups.

## Optional animation slots

These files do not exist yet. Adding one switches its effect on at the next build; removing it switches back. Without them, the static avatar and CSS bursts are used and neither runtime is referenced by any page.

| Slot | Path | What the file should contain | Effect when present |
|---|---|---|---|
| Rive avatar | `src/assets/rive/avatar.riv` | A Rive file of the same illustrated avatar on a 4:5 artboard (1200×1500 or the same ratio), transparent background, with a state machine named **`Idle`** (for example blinking or breathing; an optional boolean input `hover` is fine but not required). Original artwork only. | A canvas fades in over the static avatar the first time the character card is hovered or focused (desktop, fine pointer, not reduced motion, not data saver). The static image stays the LCP image and the fallback. |
| Lottie CV burst | `src/assets/lottie/cv-burst.json` | A Lottie JSON (Bodymovin export) of a short one-shot burst, about 0.6 s, roughly 160×160, transparent background, in the brand colours (red #FF4D6A, blue #3DB0FF, purple #A77CFF). Shape layers only (the light player is used, so no expressions). | Replaces the CSS burst on the CV buttons. Loaded when a CV button is first hovered or focused. Never plays for reduced motion. |
