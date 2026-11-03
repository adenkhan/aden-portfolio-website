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
| avatar | `src/assets/avatar/avatar.webp` | 1200×1500 (4:5) | WebP, transparent | `/` hero, character-select card (LCP image, and the poster under the live 3D model) | Rendered from the owner's VRoid model by `node scripts/render-avatar.mjs poster` (r9): relaxed pose, slight smile, looking at the camera, a red rim glow on one side and blue on the other, composited outside her silhouette | 3D anime avatar of Aden Khan, product marketer |
| ogDefault | `src/assets/og/default.png` | 1200×630 | PNG | `og:image` / `twitter:image` on /thanks/ and the 404 | Social card | Aden Khan, Product Marketer: portfolio card with red and blue orbs meeting in purple |
| og-home, og-about, og-contact | `src/assets/og/<page>.png` | 1200×630 | PNG | `og:image` on that page | Rendered from the model by `node scripts/render-avatar.mjs og` (r9): navy background, red and blue orb glows, the page's accent, her in the right third. No text | Set per page in `src/data/seo.ts` |
| og-work | `src/assets/og/work.png` | 1200×630 | PNG | `og:image` on `/work/` | A collage of five creatives with the page title, rendered by `node scripts/render-og-work.mjs` (r10) | Product marketing missions: a collage of Aden Khan's Instagram carousels and seller campaign posts |
| creative-* (19) | `src/assets/work/creative/<file>.webp` | 1200×1200, or 1024×1536 for the concept posters | WebP | `/work/` campaign shelf | The owner's campaign creatives; file names, order and alt text are in `src/data/campaigns.ts` (one entry per campaign) | Per image, in `src/data/campaigns.ts` |
| seo-tool-01 … 05 | `src/assets/work/seo-tool/seo-tool-0N-<page>.webp` | 1440×900 | WebP | `/work/` case study 3 (browser-frame visual) | Screens of the SEO tool's public pages (Create, Articles, Research, Dashboard, AI Visibility), captured with Playwright (r10) | Per image, in `seoToolShots` in `src/data/assets.ts` |
> **r4:** the case studies render visual stories (`src/components/sections/work/CaseVisual.astro`) instead of these six images, so the mission slots are **reserved** for real evidence screenshots and are not shown on the site yet. The gallery slots below are still used.

| cvPdf | `public/cv/aden-khan-cv.pdf` | A4 | PDF | CV buttons (nav, Home hero, Contact) | The real CV | Link text: "Download CV (PDF)" |

## Campaign shelf (r10)

The 19 creatives replaced every gallery placeholder; the placeholder slots with no real asset (the eight gallery slots, including the HubSpot and n8n workflow ones, and the six case-study screenshot slots, which were never shown) were deleted. To add a campaign or a slide, put the WebP in `src/assets/work/creative/` and add it to `src/data/campaigns.ts` with its width, height and alt text; the slot, the shelf card and the JSON-LD follow from that entry. Never use franchise names in alt text, file names, headings or meta tags.

## Not tracked as slots
- **Favicons** (`public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`): generated "AK" marks. Replace the files to change them.

## Regenerating placeholders
`npm run assets:generate` recreates any **missing** placeholder (never overwrites an existing file; `--force` overwrites everything, so do not use it after real assets are in). The stand-in CV comes from `scripts/make-cv-standin.py` (needs Python with `reportlab`). Placeholder hashes are stored in `src/data/placeholder-hashes.json`; a real file is detected because its hash differs.

## Rules for real images
- Original work the owner has rights to. No third-party characters, logos or named techniques (IP rule, `CLAUDE.md`).
- No important text baked into images; repeat any key number in the page text.
- Screenshots: crop to the content; no device mockups.

## The VRoid avatar (r9)

- **Model:** `public/models/avatar.vrm` (VRM 1.0, 14 expressions, MToon, about 41k triangles, 16 MB). The owner's file: never modified, re-exported or compressed. The site loads it lazily after first paint and keeps it for the whole visit. `netlify.toml` serves `/models/*` as `model/gltf-binary` so the CDN compresses it.
- **Look rule:** her MToon materials are untouched, and she is lit like VRoid Studio: one white key light plus a white ambient, set in `src/components/three/avatar/look.ts`. `node scripts/render-avatar.mjs tune <dir> '[[key, ambient], …]'` matched her cheek to VRoid's own thumbnail inside the VRM: rgb(244 212 187) against rgb(244 212 185). See `docs/screens/round4/look-compare.png`.
- **Re-render the stills** after changing the look or framing: `node scripts/render-avatar.mjs all` (poster and the four social cards) and `node scripts/render-avatar.mjs look` (the comparison images).
- **Expressions the site uses:** happy, surprised, angry, relaxed and blink. The loader warns in the console if the model lacks one.

### Optional animation clips (.vrma)

Procedural poses need no files. Dropping a VRM animation into `src/assets/anim/` replaces the matching pose at the next build; the clip is crossfaded in an `AnimationMixer` through `@pixiv/three-vrm-animation`. Clips live in `src/assets` (not `public/models/anim/`), so the build knows which exist and the browser never probes for missing files.

| Pose | File |
|---|---|
| idle (loops) | `src/assets/anim/idle.vrma` |
| wave | `src/assets/anim/wave.vrma` |
| point | `src/assets/anim/point.vrma` |
| cast-ready | `src/assets/anim/cast-ready.vrma` |
| cast-charge | `src/assets/anim/cast-charge.vrma` |
| cast-release | `src/assets/anim/cast-release.vrma` |

## Optional animation slots

These files do not exist yet. Adding one switches its effect on at the next build; removing it switches back. Without them, the static avatar and CSS bursts are used and neither runtime is referenced by any page.

| Slot | Path | What the file should contain | Effect when present |
|---|---|---|---|
| Rive avatar | `src/assets/rive/avatar.riv` | A Rive file of the same illustrated avatar on a 4:5 artboard (1200×1500 or the same ratio), transparent background, with a state machine named **`Idle`** (for example blinking or breathing; an optional boolean input `hover` is fine but not required). Original artwork only. | A canvas fades in over the static avatar the first time the character card is hovered or focused (desktop, fine pointer, not reduced motion, not data saver). The static image stays the LCP image and the fallback. |
| Lottie CV burst | `src/assets/lottie/cv-burst.json` | A Lottie JSON (Bodymovin export) of a short one-shot burst, about 0.6 s, roughly 160×160, transparent background, in the brand colours (red #FF4D6A, blue #3DB0FF, purple #A77CFF). Shape layers only (the light player is used, so no expressions). | Replaces the CSS burst on the CV buttons. Loaded when a CV button is first hovered or focused. Never plays for reduced motion. |
