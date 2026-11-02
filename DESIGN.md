---
version: alpha
name: Aden Khan Portfolio, Collision HUD
description: Dark navy product-marketing portfolio. Red marks creative work, blue marks data work, purple appears only where the two meet. Content leads, with thin lines, one orb collision, and manga-panel framing used sparingly.
colors:
  navy-950: "#07080F"
  navy-900: "#0B0D1A"
  navy-800: "#12152A"
  navy-700: "#1B1F3A"
  navy-600: "#2A2F52"
  navy-400: "#6970B0"
  ink-100: "#F2F3FA"
  ink-300: "#B4B9D6"
  ink-400: "#9096BC"
  red-500: "#FF4D6A"
  blue-500: "#3DB0FF"
  purple-500: "#A77CFF"
  primary: "{colors.creative}"
  bg-void: "{colors.navy-950}"
  bg-base: "{colors.navy-900}"
  bg-surface: "{colors.navy-800}"
  bg-raised: "{colors.navy-700}"
  line: "{colors.navy-600}"
  line-strong: "{colors.navy-400}"
  text: "{colors.ink-100}"
  text-muted: "{colors.ink-300}"
  text-subtle: "{colors.ink-400}"
  creative: "{colors.red-500}"
  data: "{colors.blue-500}"
  growth: "{colors.purple-500}"
  on-accent: "{colors.navy-900}"
  focus: "{colors.blue-500}"
typography:
  display-xl:
    fontFamily: Big Shoulders Display Variable
    fontSize: 6rem
    lineHeight: 0.92
    fontWeight: 900
    letterSpacing: -0.01em
  display-lg:
    fontFamily: Big Shoulders Display Variable
    fontSize: 3.25rem
    lineHeight: 1
    fontWeight: 900
    letterSpacing: 0em
  display-page:
    fontFamily: Big Shoulders Display Variable
    fontSize: 4.5rem
    lineHeight: 1
    fontWeight: 900
    letterSpacing: -0.01em
  title:
    fontFamily: Big Shoulders Display Variable
    fontSize: 1.875rem
    lineHeight: 1.05
    fontWeight: 800
    letterSpacing: 0em
  body-lg:
    fontFamily: Instrument Sans Variable
    fontSize: 1.1875rem
    lineHeight: 1.55
    fontWeight: 400
  body:
    fontFamily: Instrument Sans Variable
    fontSize: 1rem
    lineHeight: 1.6
    fontWeight: 400
  caption:
    fontFamily: Instrument Sans Variable
    fontSize: 0.875rem
    lineHeight: 1.5
    fontWeight: 400
  mono-label:
    fontFamily: JetBrains Mono Variable
    fontSize: 0.8125rem
    lineHeight: 1.4
    fontWeight: 500
    letterSpacing: 0.02em
rounded:
  none: 0px
  sm: 4px
  md: 12px
  lg: 16px
  pill: 999px
spacing:
  "1": 4px
  "2": 8px
  "3": 12px
  "4": 16px
  "5": 24px
  "6": 32px
  "7": 48px
  "8": 64px
  "9": 96px
  "10": 128px
components:
  nav:
    backgroundColor: "{colors.bg-base}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body}"
    height: 72px
    padding: 16px
  button-primary:
    backgroundColor: "{colors.creative}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: 48px
    padding: 24px
  button-secondary:
    backgroundColor: "{colors.bg-base}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: 48px
    padding: 24px
  button-ghost:
    backgroundColor: "{colors.bg-base}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    height: 44px
    padding: 12px
  mission-card:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 24px
  stat-card:
    backgroundColor: "{colors.bg-base}"
    textColor: "{colors.text}"
    typography: "{typography.display-lg}"
    padding: 16px
  skill-node:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.sm}"
    padding: 12px
  manga-panel:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 24px
  terminal-panel:
    backgroundColor: "{colors.bg-void}"
    textColor: "{colors.text}"
    typography: "{typography.mono-label}"
    rounded: "{rounded.sm}"
    padding: 24px
  dialog:
    backgroundColor: "{colors.bg-raised}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 32px
  footer:
    backgroundColor: "{colors.bg-void}"
    textColor: "{colors.text-muted}"
    typography: "{typography.caption}"
    padding: 32px
---

## Overview

Reconstructed from the canvas in `docs/design-canvas/` and scored against `docs/01-brief.md`. Direction C ("clean futuristic, anime accents") is the base, with two borrowed parts: the manga-panel framing from direction B (About only) and the HUD corner brackets from direction A (character-select card and terminal panel only). Scores and reasoning are in `docs/DECISIONS.md`.

The site is a dark-first recruiter portfolio. Proof leads and style supports it. The one memorable thing is the red and blue orb collision resolving to purple; everything else stays quiet.

The theme is dark only. The design plan names a dark navy base, and a light variant is out of scope.

## Colors

Two layers: primitives (`navy-*`, `ink-*`, `red-500`, `blue-500`, `purple-500`) are only referenced by semantic tokens. Components use semantic tokens only, never raw hex.

Meaning is fixed:
- `creative` (red): storytelling, campaigns, content, and the "creative" lane on mission cards.
- `data` (blue): analytics, automation, SEO tooling, and the "data" lane. Also the focus ring.
- `growth` (purple): only where both appear together (collision burst, "both" lane, the final About panel, the CV reveal). Never decoration.
- `on-accent` is the text colour on any accent fill.

Surfaces step up in lightness: `bg-void` (footer, terminal) → `bg-base` (page) → `bg-surface` (cards, panels) → `bg-raised` (dialog, hover). Separate surfaces with a 1px `line` border. Do not add a shadow under a border.

### Contrast (WCAG 2.2, computed from the hex values)

| Foreground | on bg-base | on bg-void | on bg-surface | on bg-raised | AA result |
|---|---|---|---|---|---|
| text #F2F3FA | 17.46 | 18.06 | 16.27 | 14.56 | pass (AAA) |
| text-muted #B4B9D6 | 9.99 | 10.33 | 9.30 | 8.32 | pass (AAA) |
| text-subtle #9096BC | 6.69 | 6.92 | 6.24 | 5.58 | pass |
| creative #FF4D6A | 6.00 | 6.21 | 5.59 | 5.00 | pass |
| data #3DB0FF | 8.15 | 8.43 | 7.59 | 6.79 | pass |
| growth #A77CFF | 6.41 | 6.63 | 5.98 | 5.35 | pass |
| line-strong #6970B0 (UI boundary, needs 3:1) | 4.18 | 4.33 | 3.90 | 3.49 | pass |

| Text on accent fill | Ratio |
|---|---|
| on-accent #0B0D1A on creative | 6.00 |
| on-accent on data | 8.15 |
| on-accent on growth | 6.41 |
| on-accent on text (neutral button) | 17.46 |

Rules from the numbers:
- `line` (#2A2F52) is about 1.9:1 and is decorative only. Any border that marks a control (input, outline button) uses `line-strong`.
- Never put white or `text` on a `growth` fill (3.9:1 fails). Use `on-accent`.
- Tinted washes of an accent behind text (for example 16% creative over `bg-base`, about #321727) keep `text` at 14.7:1 and `text-muted` at 8.4:1.

## Typography

Fonts are free and self-hosted with Fontsource (variable builds, `npm i @fontsource-variable/<name>`; `big-shoulders-display`, `instrument-sans`, `jetbrains-mono` were confirmed on npm at v5.3.0). Load only the weights used and subset to latin.

| Role | Face | Use |
|---|---|---|
| Display | Big Shoulders Display, 800–900 | H1, H2, card titles, stat numbers. Condensed, game-HUD feel without a system font. |
| Body | Instrument Sans, 400–600 | All reading text, buttons, nav. |
| Mono | JetBrains Mono, 500 | Data and measurement only: role/company/date lines, HUD readout in the character-select card, terminal panel. Not decoration. |

Scale (rem, desktop; mobile steps down as listed):
- `display-xl` 6rem on desktop, 3.5rem at 360px. Line height 0.92. Used for the H1 only.
- `display-page` 4.5rem from `lg` up; below `lg` it uses `display-lg`. The H1 on About, Work, Contact and Thanks (added in p16).
- `display-lg` 3.25rem, 2.25rem on mobile. H2.
- `title` 1.875rem, 1.5rem on mobile. Card titles.
- `body-lg` 1.1875rem. Hero subhead.
- `body` 1rem (16px minimum for all reading text).
- `caption` 0.875rem, for labels under stats and image captions only.
- `mono-label` 0.8125rem.

Rules:
- Max line length for body text: about 65–70 characters, set as `.measure { max-width: 34em }` (a `ch` is wider than an average Instrument Sans character, so 65ch rendered ~93 characters). Hero subhead 36ch.
- Tracking never goes below -0.02em. Headings use `text-wrap: balance`.
- Use sentence case for headings. All caps is allowed only for the single HUD tag in the character-select card.
- Numerals in stats and dates use tabular figures.
- No gradient text. Emphasis comes from size and weight.

## Layout

Spacing is a 4px scale (`spacing` tokens 1–10). Heavy sections get `9` (96px) above and `7` (48px) between the heading and content, with more space above a heading than below.

Breakpoints (Tailwind v4 `@theme`): `sm` 480px, `md` 768px, `lg` 1024px, `xl` 1440px. Mobile first; the layout stacks below `md`.

Container: 1200px max, with 16px side padding at 360px, 24px at `md`, 40px at `lg`.

| Page | 360–479px | 480–767px | 768–1023px | 1024–1439px | 1440px |
|---|---|---|---|---|---|
| Home | one column: H1, subhead, buttons, stats 2×2, then the avatar card (proof sits in the first screen, p16) | same, avatar card max 420px | hero two columns (text left, avatar right), stats 4 across below both; from `lg` the stats sit in the left column under the CTAs, card top-aligned beside them | same, larger display type | container capped at 1200px, extra space is empty navy |
| About | bio, then the four panels stacked | same | panels 2×2 | same | same |
| Work | mission cards one column, skills tree stacked by lane | one column | two columns | three columns | three columns |
| Contact | terminal panel full width | same | terminal panel max 720px, left aligned | same | same |

Alignment: everything left aligned. Nothing is centred except the 404 message.

The nav is a text row from `md` up. Below `md` it collapses to the logo, CV button and a menu button that opens a full-width list. Tap targets are at least 44px.

## Elevation & Depth

Declare depth once: border or shadow, never both. This site uses borders (1px `line`) plus a lightness step between surfaces. There are no drop shadows on cards.

Glow is a light source, not decoration. It is allowed in exactly four places: the orb collision behind the avatar, the CV-download burst, the focus ring, and the pointer light inside the character-select card (desktop, fine pointer). Nowhere else.

Z-index scale (tokens in `@theme`): base 0, content 1, nav 40, intro overlay 80, dialog 90, toast 100, skip link 110.

## Shapes

Radii: `sm` 4px (small controls, terminal), `md` 12px (cards), `lg` 16px (dialog), `pill` (buttons only). Manga panels use `none` plus a cut corner.

The cut corner is the signature shape: a 20px diagonal cut on the bottom-right of manga panels and on the top-right of the stat card (`clip-path: polygon(...)`). Use it on panels and nowhere else, so it stays meaningful.

## Textures and motifs

Each motif has a place and an upper limit, so the page does not get noisy.

| Motif | Allowed | Not allowed |
|---|---|---|
| Orb collision (red + blue → purple) | behind the avatar in the hero; the intro; the CV burst | page backgrounds, section dividers |
| Halftone dots | About panels (corner fade, 90px max) and the creative gallery frame | behind body text, hero, nav |
| Manga panel borders | About panels only; 1px `line-strong` with one 3px `creative`/`data`/`growth` top edge on the panel's own lane | mission cards, buttons |
| HUD corner brackets | the character-select avatar card and the terminal panel | every card |
| Grid lines | inside the character-select card only, as a measuring grid behind the readout | full-page grid or scanline overlays |
| Ambient particles (`docs/MOTION.md` 7a, built in p10) | behind the character-select card in the hero, desktop only | any other section or page |
| HUD labels (mono) | role/date lines; the single "// PLAYER 01" tag inside the avatar card | above every heading |

## Components

The HUD tag from the design plan ("// PLAYER 01 · PRODUCT MARKETER · KARACHI") sits inside the character-select card as its status line, not above the H1. The H1 carries its own weight.

States use the same rules everywhere. Focus-visible: 2px `focus` outline with 3px offset, never removed. Hover changes lightness or border colour only, in 150ms with `ease` (see `docs/MOTION.md`). Active steps one tone darker. Disabled is 45% opacity with `cursor: not-allowed` and does not need to meet contrast.

| Component | Default | Hover | Focus-visible | Active | Disabled |
|---|---|---|---|---|---|
| nav | `bg-base`, 1px `line` bottom border; current page `text` with a 2px underline | link to `text` | 2px `focus` ring | link to `text-muted` | n/a |
| button-primary | `creative` fill, `on-accent` text, pill, 48px high. It is the only element allowed a creative→growth→data gradient, and only on the CV button | fill lightens 6% | 2px `focus` ring | fill darkens 8% | 45% opacity |
| button-secondary | transparent, 1px `line-strong` border, `text` | border `text` | ring | `bg-surface` | 45% opacity |
| button-ghost | text only, `text-muted`, underline on hover | `text` | ring | `text-muted` | 45% opacity |
| mission-card | `bg-surface`, 1px `line`, 12px radius. Lane shown as a filled dot plus the word Creative, Data or Both. Result sentence in `body-lg`. No coloured side stripe | border `line-strong`, title shifts to the lane colour | ring around the card if it is a link | `bg-raised` | n/a |
| stat-card | number in `display-lg` coloured by lane, caption below in `text-muted`, cut top-right corner | none (static) | n/a | n/a | n/a |
| stat-bar (character card) | solid fill in the stat's lane colour (`growth` for both, `data`, `creative`); never a gradient | none | n/a | n/a | n/a |
| skill-node | `bg-surface`, `mono-label`, 4px radius; lights to the lane colour as it enters view | border lane colour | ring | n/a | n/a |
| manga-panel | `bg-surface`, 1px `line-strong`, cut bottom-right, halftone corner, top edge in its lane colour | none | n/a | n/a | n/a |
| terminal-panel | `bg-void`, `mono-label`, 1px `line-strong`, corner brackets in `creative` (top-left) and `data` (bottom-right) | row text to `text` | each link has its own ring | row `bg-surface` | n/a |
| dialog | `bg-raised`, 1px `line-strong`, 16px radius, scrim `bg-void` at 80% | n/a | focus trapped, first control focused | n/a | n/a |
| footer | `bg-void`, `caption`, links `text-muted` underlined | links to `text` | ring | n/a | n/a |

## Imagery rules

- Avatar: the illustrated avatar in a character-select frame at 4:5, delivered as WebP with width and height set, `alt="Illustrated anime avatar of Aden Khan, product marketer"`. The frame is the only place the orb collision appears on the page. No photo.
- Screenshots (Amplitude dashboard, ad creatives): shown at native crop in a 1px `line-strong` frame with a caption in `caption`. No device mockups, tilted or skewed.
- Every image has descriptive alt text; decorative imagery uses `alt=""`. Alt-text wording lives in `docs/SEO.md` (pending).
- Halftone and orb layers are CSS or pre-rendered images, never baked into text.

## Breakpoint motion notes

Phones get lighter effects: the 2D orb version and no particles. The character-card pointer light is desktop-only (fine pointer); there is no page-wide cursor glow. Reduced motion removes the intro, parallax and large movement and shows the final composed state.

## Tailwind v4 `@theme` block

Not applied to code yet. When it is, it goes in `src/styles/global.css` after `@import "tailwindcss";`.

```css
@theme {
  /* primitives */
  --color-navy-950: #07080f;
  --color-navy-900: #0b0d1a;
  --color-navy-800: #12152a;
  --color-navy-700: #1b1f3a;
  --color-navy-600: #2a2f52;
  --color-navy-400: #6970b0;
  --color-ink-100: #f2f3fa;
  --color-ink-300: #b4b9d6;
  --color-ink-400: #9096bc;
  --color-red-500: #ff4d6a;
  --color-blue-500: #3db0ff;
  --color-purple-500: #a77cff;

  /* semantic */
  --color-primary: var(--color-creative);
  --color-bg-void: var(--color-navy-950);
  --color-bg-base: var(--color-navy-900);
  --color-bg-surface: var(--color-navy-800);
  --color-bg-raised: var(--color-navy-700);
  --color-line: var(--color-navy-600);
  --color-line-strong: var(--color-navy-400);
  --color-text: var(--color-ink-100);
  --color-text-muted: var(--color-ink-300);
  --color-text-subtle: var(--color-ink-400);
  --color-creative: var(--color-red-500);
  --color-data: var(--color-blue-500);
  --color-growth: var(--color-purple-500);
  --color-on-accent: var(--color-navy-900);
  --color-focus: var(--color-blue-500);

  /* type */
  --font-display: "Big Shoulders Display Variable", "Arial Narrow", sans-serif;
  --font-sans: "Instrument Sans Variable", system-ui, sans-serif;
  --font-mono: "JetBrains Mono Variable", ui-monospace, monospace;
  --text-display-xl: 6rem;
  --text-display-xl--line-height: 0.92;
  --text-display-lg: 3.25rem;
  --text-display-lg--line-height: 1;
  --text-display-page: 4.5rem;
  --text-display-page--line-height: 1;
  --text-title: 1.875rem;
  --text-title--line-height: 1.05;
  --text-body-lg: 1.1875rem;
  --text-body-lg--line-height: 1.55;
  --text-caption: 0.875rem;
  --text-caption--line-height: 1.5;
  --text-mono-label: 0.8125rem;
  --text-mono-label--line-height: 1.4;

  /* shape and space */
  --radius-sm: 4px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 999px;
  --spacing: 0.25rem;

  /* breakpoints */
  --breakpoint-sm: 30rem;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;
  --breakpoint-xl: 90rem;

  /* layers */
  --z-content: 1;
  --z-nav: 40;
  --z-intro: 80;
  --z-dialog: 90;
  --z-toast: 100;
  --z-skip: 110;

  /* motion */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --duration-press: 160ms;
  --duration-hover: 150ms;
  --duration-ui: 220ms;
  --duration-reveal: 600ms;
  --duration-intro: 2600ms;

  /* glow: orb, burst and focus only */
  --shadow-glow-creative: 0 0 48px 0 rgb(255 77 106 / 0.45);
  --shadow-glow-data: 0 0 48px 0 rgb(61 176 255 / 0.45);
  --shadow-glow-growth: 0 0 64px 0 rgb(167 124 255 / 0.55);
}
```

Mobile type override (put in a media query, not `@theme`): at widths under 48rem set `display-xl` to 3.5rem, `display-lg` to 2.25rem, `title` to 1.5rem.

## Do's and Don'ts

Anti-patterns to avoid, from running impeccable's craft-floor and the frontend-design slop list against this direction. Each item names the risk and what to do.

- **Hero-metric template.** The Home stats strip (big number, small label, accent) is exactly the flagged template. Keep it once, not repeated per page. Colour each number by its lane and keep the source role beside it, so it reads as proof rather than a template.
- **Eyebrow above a heading.** The "// PLAYER 01" tag goes inside the avatar card as a status line, not above the H1, and no section gets an eyebrow.
- **Section numbers (01/02/03).** Not used. Arc 1–4 are an actual sequence, so those labels are allowed on the About panels.
- **Gradient text and purple-on-white.** No gradient text. The only gradient is the one CV button. Purple means "both", never filler.
- **Coloured side stripes.** No `border-left` or `border-right` above 1px on cards. Lanes are shown with a dot plus a word, and panels use a top edge.
- **Hard offset shadows.** Rejected with direction B. Depth is a border plus a surface step.
- **Glow as decoration.** Glow only on the orb, the CV burst, the focus ring and the character-card pointer light. No glowing text, no neon buttons.
- **Scanline, grid or stripe backgrounds.** Only the measuring grid inside the character-select card.
- **Monospace as a costume.** Mono is for roles, dates, readouts and the terminal only.
- **Identical rounded cards everywhere.** Cards use 12px radius, panels use cut corners, buttons are pills. Mix on purpose, not by default.
- **Same fade-up on every section.** One authored intro, a few explanatory motions (count-up, panel assembly, branch lighting). Everything else is still.
- **Overused fonts.** No Inter, Roboto, Arial or system fonts as the display voice.
- **Invented numbers.** The character-select bars are labels with equal-length decoration, not ratings. No fake percentages.
- **Franchise material.** No characters, logos, names or named techniques from any anime or other franchise.
- **Text in images.** All meaningful text stays real HTML.
