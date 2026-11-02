# UI Audit (p16)

Surfaces: `/`, `/about/`, `/work/`, `/contact/` (+ `/thanks/`), at 375×667 (phone), 375×812, 1440×900, and 200% zoom. Reviewed read-only first, then fixed highest severity first. Status below reflects the fixes and the confirming impeccable rerun.

**Recruiter test (owner's bar):** a hiring manager on a phone should understand who Aden is, what he does and one proof point within 10 seconds on Home.

## Sources and method

| Skill | What it ran |
|---|---|
| impeccable | `impeccable detect` on `src/` (regex rules) and on the four running pages (element rules incl. AI-slop palette, halos, line length, occlusion); critique against DESIGN.md and `docs/01-brief.md` |
| improve-ui | Audit against DESIGN.md as the governing system (contract → runtime → correction proof for each finding) |
| web-design-guidelines | Latest Web Interface Guidelines (vercel-labs `command.md`), checked against the components; axe-core WCAG 2.2 A/AA scan of all routes |
| break-ui | Worst-case fixture (`npm run dev:worst`, p14) for long names, missing images, empty lists; plus 200% zoom on all pages |
| mobile-native | Platform layer: tap highlight, touch-action, user-select, input zoom, viewport units, safe areas, overscroll, hover gating |

## Design language (improve-ui)
- Audited surface: the four public pages and shared layout (nav, footer, CV dialog).
- Design sources: `DESIGN.md` (current, governs all pages), `docs/MOTION.md`, `docs/01-brief.md`.
- Documented decisions: dark-only palette with lane meaning (red creative, blue data, purple both); type ramp display-xl/lg, title, body-lg, body, caption, mono-label; 65ch body measure; the only multi-colour gradient allowed is the CV button; glow only on orb, CV burst, focus ring and card pointer light.
- Governing owners and consumers: `src/styles/global.css` `@theme` tokens → every component.
- Explicit exceptions: None documented.

## Findings (merged, highest severity first)

| # | Severity | Page | Issue | Fix | Raised by | Status |
|---|---|---|---|---|---|---|
| 1 | Critical | Home (phone) | Recruiter test fails: at 375×667 the proof point (stats strip, −72% CAC) starts at 1,257 px, almost two screens down, below the avatar card. Name, role and CTA are visible; proof is not. | Move the stats strip into the hero and order it before the avatar card on phones (copy → proof → card); keep copy · card / stats on desktop. | Recruiter test, impeccable critique | **fixed**: StatsStrip moved into Hero.astro (grid areas copy / proof / visual on phones); first stat −72% at 546–582 px and its label ending at 628 px on 360×640 and 375×667 |
| 2 | High | All | axe `label-content-name-mismatch` (WCAG 2.5.3): logo link shows "AK" but its accessible name is "Aden Khan, home". Voice-control users saying "click AK" miss it. | Accessible name that starts with the visible text: `aria-label="AK, Aden Khan, home"`. | web-design-guidelines (axe) | **fixed**: Nav.astro; axe clean on all 5 routes |
| 3 | High | Home | Stat bars use the creative→growth→data gradient, which DESIGN.md reserves for the CV button; impeccable flags it as the purple-gradient AI tell. | Solid lane colour per bar (Positioning both/purple, Analytics data/blue, Automation data/blue, Paid growth creative/red). | improve-ui (DESIGN.md contract), impeccable `ai-color-palette` | **fixed**: CharacterCard.astro, `data-lane` per bar with `--lane-colour` |
| 4 | Medium | About, Contact, Home | Body measure exceeds DESIGN.md's 65ch: About's bio renders ~93 characters per line (`.measure` uses `ch`, which is wider than an average character in Instrument Sans). | `.measure { max-width: 34em }` (≈ 70 characters at body and body-lg sizes). | improve-ui (DESIGN.md contract), impeccable `line-length` | **fixed**: global.css `.measure`; About bio now ~68 characters per line |
| 5 | Medium | All (touch) | Grey tap flash on links and buttons; no `touch-action: manipulation`; long-press selects button labels. | `-webkit-tap-highlight-color: transparent` on `html`; `touch-action: manipulation` on links and buttons; `user-select: none` on buttons and button-styled links (content links keep selection). | mobile-native, web-design-guidelines | **fixed**: global.css. Needs a real phone to confirm the tap flash is gone (emulation can't show it) |
| 6 | Medium | Work | Nine identical cards in a uniform grid: the strongest proof (mission 1, −72% CAC) has the same weight as the rest. | Feature mission 1: at ≥ 1024 px it spans two columns with image and text side by side. | impeccable critique (same-size cards) | **fixed**: MissionCard `featured` prop, set on index 0 in MissionGrid.astro |
| 7 | Medium | All | Type sizes off the DESIGN.md ramp: logo 1.75rem, tags 0.75rem, page titles 4.5rem. | Logo → `--text-title`; tags → `--text-mono-label`; add `display-page` (4.5rem) to DESIGN.md and use the token for page titles. | impeccable (design-system advisories), improve-ui | **fixed**: tokens applied; `display-page` added to global.css and DESIGN.md |
| 8 | Low | Contact | Email input allows spellcheck and autocapitalisation; the submit button gives no feedback while the post is in flight and can be pressed twice. | `spellcheck="false" autocapitalize="none"` on email; on a valid submit, disable the button and show "Sending…". | web-design-guidelines (forms) | **fixed**: ContactForm.astro; `copy.sending` in timeline.ts |
| 9 | Low | About, 404 | Straight apostrophes in copy ("I'm", "program's", "Aden Khan's"). | Curly apostrophes in `src/data` (text only; meaning unchanged). | web-design-guidelines (typography) | **fixed**: timeline.ts, missions.ts, seo.ts |
| 10 | Low | All (notched phones) | Safe-area insets are always 0 (`viewport-fit` missing), so the toast and intro Skip button don't clear the home indicator in landscape; the keyboard doesn't resize the layout on Android. | `viewport-fit=cover, interactive-widget=resizes-content`; side padding `max(gutter, env(safe-area-inset-left/right))` in `.container-site`. | mobile-native | **fixed**: BaseLayout.astro viewport, global.css `.container-site`. Notch insets need a real device to confirm |
| 11 | Info | Home | impeccable flags the teaser orbs and intro as `radial-halo` / purple glow. | None: the red + blue → purple collision is the brand concept in the brief and DESIGN.md, limited to these places. | impeccable | **deferred**: brand concept. Rerun confirms the remaining flags are the teaser orbs (Teaser.astro) and the card pointer light (CharacterCard.astro), both allowed by DESIGN.md "Elevation & Depth" |
| 12 | Info | About, Work | impeccable `text-occlusion` on the "fps · triggers" overlay. | None: dev-only overlay, absent from production builds (tested in p10). | impeccable | **deferred**: dev only, not in the production build |
| 13 | Info | All | Guidelines suggest Title Case headings and second-person copy. | None: DESIGN.md sets sentence case and the brief sets first person. | web-design-guidelines | **deferred** (rejected): conflicts with DESIGN.md and the brief, which govern |
| 14 | Info | All | Brand names (Sadiq.ai, HubSpot, n8n…) lack `translate="no"`. | Defer: low value for an English-only site. | web-design-guidelines | **deferred**: low value on an English-only site; revisit if a translated version is added |
| 15 | Info | About, Work | break-ui worst case: long titles, roles, emails, empty lists and missing images all hold (fixed in p14). Checked again at 200% zoom. | None. | break-ui | **held**: rechecked at 200% zoom on all four pages, no horizontal overflow and no clipped text |

## Results after the fixes

**Recruiter test, Home on a phone, passes.** Measured with mobile emulation (no desktop scrollbar) at 360×640 and 375×667. The whole chain sits inside the first screen with no scrolling:

| Element | Top (px) | What the reader gets |
|---|---|---|
| H1 | 89 | Who: “Aden Khan, Product Marketer” |
| Subhead | 260 | What: “I connect what customers feel with what the data shows, then build the systems that scale it.” |
| Availability line | 360 | BBA Marketing at IBA Karachi; open to internships now |
| CTAs (one row, down to 360 px) | 461 | Download CV · See my missions |
| Proof: −72% | 546 (number ends 582) | Label “customer acquisition cost” ends at 628, inside a 640 px screen |

Before the fix, the proof started at 1,257 px. Desktop (1440×900 and 1024×768): the stats sit in the left column under the CTAs; the numbers end at 749 px, so they are in the first screen at both sizes. The labels end at 795, inside 900 but just below a 768 px fold. Screens: `docs/screens/home-375-first-screen.png`, `docs/screens/home-1440-first-screen.png`.

Regressions found and fixed while verifying: the count-up trigger still looked for a `section` wrapper, which no longer existed after the move, so on desktop it fired before the stats were on screen. It now triggers on `.stats`. Content-sized stat columns made the card shift while counting (CLS 0.029); fixed by reserving each value's final width (`dd::after`) and top-aligning the card.

**impeccable rerun (detect, live pages):**
- Home: two `ai-color-palette` flags and one `radial-halo`. Traced to the teaser orbs and the card pointer light, both allowed by DESIGN.md (row 11). The stat-bar gradient flag (row 3) is gone.
- About, Work: only the dev-overlay `text-occlusion` (row 12).
- `line-length` flags: gone.

**impeccable rerun (detect, `src/`):** the only advisories left are dev-only (DataToggle colours, 0.75rem placeholder badges in Img and CharacterCard) and the `#000` mask colour in ArcPanel, which is a mask channel, not a visible colour.

**axe-core, WCAG 2.2 A/AA (`tests/e2e/a11y.spec.ts`):** 0 violations on `/`, `/about/`, `/work/`, `/contact/`, `/thanks/`.

**Needs a real phone:** the tap flash (row 5) and the safe-area insets (row 10) can't be reproduced in emulation.
