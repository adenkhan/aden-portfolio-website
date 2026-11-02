# Round 2 Baseline Audit (r1)

The site as it stood at commit `99f1b69` (p16), measured before any Round 2 page work. The owner's verdict: too text heavy, generic and repetitive copy, case studies that are single paragraphs, and almost no 3D or animated visuals. This file records the evidence for that verdict and traces each cause to the doc rule behind it. The new rules are in `CLAUDE.md` §4a, `docs/MOTION.md` §0 and `docs/ENGINEERING-PLAN.md` "Round 2 rules".

**Method.** Each route was rendered from the production build (`npm run build`, `astro preview`) at 1440×900 with the intro marked as seen. Visible words were counted by walking the text nodes and skipping anything that is `display: none`, `visibility: hidden`, `hidden`, inside a closed `<dialog>` or inside `.sr-only`. Visible `aria-hidden` copies, such as the typed terminal text, are counted because readers see them. A "word" is any token that contains a letter or digit, so `−72%` counts and `·` doesn't. Repeated facts were matched on that visible text, then checked again against the raw HTML for meta tags, JSON-LD and the CV dialog.

## 1. Word count per page and section

Round 2 budgets count visible words in `<main>`; nav and footer are counted separately.

| Page | Section | Words | Notes |
|---|---|---|---|
| all | Nav | 6 | `AK Home About Work Contact CV` |
| all | Footer | 10 | Repeats "Aden Khan · Product Marketer · Karachi, Pakistan" and the email on every page |
| **Home** | **main total** | **87** | Budget 80: **over by 7** |
| Home | Hero: H1 | 4 | |
| Home | Hero: subhead | 17 | |
| Home | Hero: availability line | 15 | BBA / IBA / Karachi / internships / mid-2027 |
| Home | Hero: CTAs | 5 | |
| Home | Hero: stats strip | 15 | −72%, +40%, $7,000+, 4 and their captions |
| Home | Hero: character card HUD and bar labels | 10 | |
| Home | Teaser "Creative × Data = Growth" | 21 | The sentence explains what the orb collision already shows |
| **About** | **main total** | **224** | Budget 160: **over by 64** |
| About | Page head: H1 and subline | 12 | |
| About | Page head: bio paragraph | 58 | Biggest text block on the site |
| About | Origin arc, 4 panels | 84 | One sentence per panel (17–24 words each), with a repeated metric in panels 1 and 2 |
| About | Education | 34 | Heading, institution, degree, dates, course list, certificate |
| About | Career goals | 36 | Paragraph, availability (again) and two CTAs |
| **Work** | **main total** | **320** | |
| Work | Page head | 4 | |
| Work | Mission grid, 9 cards | 241 | Budget 60 per case study: **every card is under budget (20–31 words) but is only a single line**, not a case study |
| Work | · Lower the cost of growth (Sadiq.ai) | 27 | |
| Work | · Drive feature adoption (Sadiq.ai) | 24 | |
| Work | · Arm the sales team (Sadiq.ai) | 28 | |
| Work | · Ship an SEO writing tool (10Pearls) | 29 | |
| Work | · Stop keyword cannibalization (10Pearls) | 20 | |
| Work | · Automate the funnel (10Pearls) | 24 | |
| Work | · Build a GTM pipeline (Leasap) | 31 | |
| Work | · Grow a program’s reach (Invest2Innovate) | 22 | |
| Work | · Fund a society (IBA APCS) | 29 | |
| Work | Skills tree | 61 | A list of about 40 tool and skill names |
| Work | Creative gallery | 14 | Heading, one caption line, CTA; images are placeholders |
| **Contact** | **main total** | **54** | Budget 40: **over by 14** |
| Contact | Page head: H1 and subline | 8 | |
| Contact | Page head: lead and link | 19 | |
| Contact | Terminal panel | 14 | |
| Contact | Form | 13 | Includes the "Prefer email?" line, which repeats the email |
| Thanks | main total | 25 | Not budgeted (`noindex` confirmation page) |

## 2. Facts that repeat across pages

Visible text only, unless marked. "Meta" means `<title>`, meta description, Open Graph and JSON-LD; Round 2 allows repeats there.

| Fact | Where it appears (visible) | Count | Also in |
|---|---|---|---|
| BBA Marketing / IBA Karachi | Home availability; About bio; About Education heading and body (×2) | 4 | CV dialog (every page), JSON-LD `alumniOf`, About meta |
| "IBA" as a name | Work card "IBA Animation and Pop Culture Society" | 1 | Different fact (an organisation), but reads as a repeat |
| −72% customer acquisition cost | Home stats; About arc 2; Work card 1 | 3 | Meta descriptions |
| +40% awareness (i2iScale) | Home stats; About arc 1; Work card 8 | 3 | |
| $7,000+ sponsorships | Home stats; Work card 9 | 2 | |
| "Product marketer" | Home H1; About H1 subline; About career goals; Contact H1 subline and lead; character card HUD; footer on all 5 pages | 11 | Titles and meta on every page |
| Karachi | Home availability; HUD; About bio; About Education (×2); footer ×5 | 10 | JSON-LD address |
| Availability (internships now, full time from mid-2027) | Home hero; About career goals | 2 | Contact meta |
| Employers (Sadiq.ai, 10Pearls, Leasap, i2iScale) | About arc panels (4); Work cards (Sadiq.ai ×3, 10Pearls ×3, Leasap, i2iScale) | 12 | CV dialog |
| Tools (Amplitude, HubSpot, n8n) | About arc; Work cards; Work skills tree | 3 each | |
| "Since 2025" / dates | Home stat caption; About arc labels ×3 | 4 | CV dialog |
| Email address | footer ×5; Contact terminal; Contact form line; Thanks | 8 | |
| CTA "Open a channel" | Home teaser; About goals; Work gallery; Contact eyebrow | 4 | |
| CTA "See the missions" / "See my missions" | Home; About; Contact; Thanks | 4 | |

The same three metrics carry Home, About and Work, so a reader meets −72% three times and nothing new on the second and third page.

## 3. Text blocks where a visual could carry the point

| Page | Section | Today | What a visual could do |
|---|---|---|---|
| Home | Hero subhead and availability | 32 words of copy beside a placeholder card | The persistent scene and avatar carry the identity. Availability becomes a status chip with no BBA (rule: BBA only on About). |
| Home | Stats strip | Number and caption | Keep the numbers, but make each a visual moment: a cost curve dropping for −72%, a reach ring for +40%. Captions shrink to 2–3 words. |
| Home | Teaser | A 14-word sentence explaining the colour code | The red and blue orbs colliding into purple explain themselves. Keep only the "Creative × Data = Growth" equation. |
| About | Bio paragraph (58 words) | Plain paragraph | An animated arc or path with the avatar moving along it; one short line as the caption. |
| About | Origin arc (4 panels, 84 words) | One sentence each, inside manga-panel frames that are only borders | Each panel shows its stage as an illustration or 3D vignette (megaphone, chart, map, cog) with a label and a single metric chip. |
| About | Education (34 words) | Heading and a course list in prose | One education chip (the only place BBA/IBA appears); courses as small tags. |
| About | Career goals (36 words) | Paragraph | A "next level" visual (a locked node on the path) with a one-line caption. |
| Work | Mission cards (9 × one line) | Thumbnail placeholder, title, one result sentence, tags | Real case studies of at most 60 words each: problem → action → result as three visual beats (before/after, a funnel, a pipeline diagram), with the metric as the hero element. |
| Work | Skills tree (61 words) | Flat list of names in four lanes | A 3D constellation or orbit of skill nodes, lit by lane; names stay as HTML labels. |
| Work | Creative gallery | Placeholder images and one caption | The real creatives in a 3D carousel or a pinned reel. |
| Contact | Page head lead (19 words) | Sentence plus link | The terminal is the visual. The lead shrinks to a few words or goes into the terminal prompt. |
| Contact | Form intro | Repeats the email | Drop it; the terminal already lists the email. |
| All | Footer | Repeats name, role, city and email | Keep only the links; the facts live on their own pages. |

## 4. Where 3D or motion was removed or reduced, and the rule that caused it

| What | What happened | Rule that caused it | Source |
|---|---|---|---|
| Overall posture | Motion limited to "loud in two places (intro, CV burst), restrained everywhere else" | Brief, carried into MOTION.md line 5 | `docs/01-brief.md`; `docs/MOTION.md` intro; DECISIONS "Large motion is limited to the intro collision and the CV-download burst" |
| Three.js intro | Re-sequenced to a 2D baseline for every tier, with 3D only as an optional `full`-tier enhancement, "kept only if budgets hold" | Docs review findings 17–18; "3D is the biggest performance risk" | `docs/audits/docs-review.md` #18 and cut order step 5; DECISIONS "p07: 2D intro first, 3D optional"; ENGINEERING-PLAN §6 "Baseline first" |
| 3D on phones and tablets | Every touch device, ≤ 4 cores, ≤ 4 GB or save-data is `lite` and never gets Three.js | MOTION.md tier table (`lite`: "no Three.js") | MOTION.md §1 tiers; ENGINEERING-PLAN §6 capability check |
| 3D intro on emulated phones | Lighthouse runs and phones always see the 2D intro | Same `lite` rule, plus the `hardwareConcurrency > 4` gate | DECISIONS p11 result line |
| 3D anywhere but the intro | "Where: Home intro, and the CV burst. No other 3D." | ENGINEERING-PLAN §6 | ENGINEERING-PLAN §6; MOTION.md library table ("Three.js … anything else: never") |
| CV burst in 3D | Made 2D on every tier; the 144 KB 3D chunk "not worth it for 0.6 s" | Budget reasoning in p12 | DECISIONS p12; MOTION.md §9 |
| Postprocessing (chromatic aberration) | Desktop `full` only; dropped on mobile | MOTION.md moment 1 | MOTION.md moment 1 table, "Mobile (`lite`)" |
| Particles | Cut to hero only, then a stretch goal, then built in p10 but desktop, fine-pointer, `full` only | "Decoration with a continuous main-thread cost"; counts toward the 150 KB budget | Docs review #17; MOTION.md 7a and §3 |
| Pointer glow | Cut in p07, reinstated in p10 on the avatar card only, desktop only | DESIGN.md glow rule (four places only) | Docs review #5 and #15; DESIGN.md "Elevation & Depth" |
| Lottie burst | Cut, then made an optional, intent-loaded slot with no asset | No asset; budget | Docs review #14; DECISIONS p13 |
| Rive avatar | "Not used", then an optional slot with no `.riv` file | No asset; 85 KB plus 0.9 MB WebAssembly vs budget | MOTION.md library table; DECISIONS p13 |
| Mission-card entrances | Cut in p04 ("generic fade-ups"), reinstated in p14 | MOTION.md 5b | MOTION.md §3 |
| DrawSVG skills tree | Replaced with scaled divs in p07, reinstated in p14 | Docs review #16 ("one implementation") | DECISIONS p07 and p14 |
| Pinned gallery | Rejected in p04 for CSS scroll-snap, reinstated desktop-only in p14 | MOTION.md 5d | DECISIONS p14 |
| Headline glitch and type-in | Cut; replaced by a masked word rise | The brief calls typewriter and glitch headings cringe | MOTION.md moment 3, §3 |
| Typing the contact details | Cut in p04, reinstated in p15 | MOTION.md §3 | DECISIONS p15 |
| Page-wide cursor glow and parallax | Cut | MOTION.md §3; DESIGN.md glow rule | MOTION.md §3 |
| React islands (Kokonut, Bklit, R3F) | None used anywhere | ADR-002 and the 150 KB first-load budget, which React (45–60 KB) would break | ENGINEERING-PLAN ADR-002; DECISIONS p12, p13, p14 |
| Bklit chart | Not used | React plus budget; "a before/after would need invented values" | DECISIONS p14 |
| Budget itself | 150 KB gzip for first load *plus lazy chunks* (only three, Lottie and Rive excluded); mobile Lighthouse Performance ≥ 85 | ENGINEERING-PLAN §9; `scripts/check-budget.mjs` | DECISIONS "p07: first-load budget excludes only 3D", p10 |
| No client router | Every page is a fresh document, so no scene can persist between pages | ADR-001 | ENGINEERING-PLAN ADR-001 |

**Pattern.** Every cut follows one of three rules: the 150 KB budget (which counts lazy chunks), the "loud in two places" posture, and "3D is an optional enhancement that must earn its place". Round 2 replaces all three.

## 5. Other docs that still say the old thing

The owner asked for CLAUDE.md, MOTION.md and ENGINEERING-PLAN.md to change. The docs below still contain old rules; CLAUDE.md §4a now says Round 2 rules win wherever they conflict, and each is to be updated by the Round 2 prompt that touches its area:

- `docs/01-brief.md`: "loud in two places, restrained everywhere else".
- `DESIGN.md`:
  - The glow rule allows glow in only four places.
  - The motif table caps particles at the hero on desktop.
  - The Home layout row lists the availability line.
- `docs/SEO.md` and `src/data/seo.ts`: the About H2 "Education: BBA Marketing at IBA Karachi" names BBA/IBA in a heading. Under Round 2 the visible BBA/IBA is the education chip only; the H2 needs new keyword wording.
- `docs/00-design-plan.md`: word-for-word copy (hero availability, bio) that repeats BBA/IBA and the metrics.
