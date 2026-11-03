# Design system

Source of truth: the CSS custom properties built into the live site (read with the browser from https://aden-portfolio-website.vercel.app), cross-checked with DESIGN.md. Where they disagree, the code wins; the differences are listed at the end.

## Colour tokens

Contrast ratios are WCAG 2.2, computed from the live hex values. Text needs 4.5:1 (3:1 for large text and UI boundaries).

| Token | Hex | Role | on bg-base | on bg-surface |
| --- | --- | --- | --- | --- |
| --color-bg-base | #0B0D1A | Page background | 1.00 | 1.07 |
| --color-bg-raised | #1B1F3A | Dialog, hover surface | 1.20 | 1.12 |
| --color-bg-surface | #12152A | Cards and panels | 1.07 | 1.00 |
| --color-bg-void | #07080F | Footer, terminal panel | 1.03 | 1.11 |
| --color-blue-500 | #3DB0FF | Primitive (referenced only by the semantic tokens) | 8.15 | 7.59 |
| --color-creative | #FF4D6A | Creative lane: storytelling, campaigns, content | 6.00 | 5.59 |
| --color-data | #3DB0FF | Data lane: analytics, automation, SEO; also the focus ring | 8.15 | 7.59 |
| --color-focus | #3DB0FF | Focus ring | 8.15 | 7.59 |
| --color-growth | #A77CFF | Both lanes together (collision, final panel, CV reveal); never decoration | 6.41 | 5.98 |
| --color-ink-100 | #F2F3FA | Primitive (referenced only by the semantic tokens) | 17.46 | 16.27 |
| --color-ink-300 | #B4B9D6 | Primitive (referenced only by the semantic tokens) | 9.99 | 9.30 |
| --color-ink-400 | #9096BC | Primitive (referenced only by the semantic tokens) | 6.69 | 6.24 |
| --color-line | #2A2F52 | Hairline borders | 1.50 | 1.39 |
| --color-line-strong | #6970B0 | UI boundaries (needs 3:1) | 4.18 | 3.90 |
| --color-navy-400 | #6970B0 | Primitive (referenced only by the semantic tokens) | 4.18 | 3.90 |
| --color-navy-600 | #2A2F52 | Primitive (referenced only by the semantic tokens) | 1.50 | 1.39 |
| --color-navy-700 | #1B1F3A | Primitive (referenced only by the semantic tokens) | 1.20 | 1.12 |
| --color-navy-800 | #12152A | Primitive (referenced only by the semantic tokens) | 1.07 | 1.00 |
| --color-navy-900 | #0B0D1A | Primitive (referenced only by the semantic tokens) | 1.00 | 1.07 |
| --color-navy-950 | #07080F | Primitive (referenced only by the semantic tokens) | 1.03 | 1.11 |
| --color-on-accent | #0B0D1A | Text on any accent fill | 1.00 | 1.07 |
| --color-primary | #FF4D6A | Primitive (referenced only by the semantic tokens) | 6.00 | 5.59 |
| --color-purple-500 | #A77CFF | Primitive (referenced only by the semantic tokens) | 6.41 | 5.98 |
| --color-red-500 | #FF4D6A | Primitive (referenced only by the semantic tokens) | 6.00 | 5.59 |
| --color-text | #F2F3FA | Primary text | 17.46 | 16.27 |
| --color-text-muted | #B4B9D6 | Secondary text | 9.99 | 9.30 |
| --color-text-subtle | #9096BC | Labels, captions | 6.69 | 6.24 |

Surfaces step up in lightness: bg-void (footer, terminal) → bg-base (page) → bg-surface (cards, panels) → bg-raised (dialog, hover). Colour carries meaning: creative = red, data = blue, growth = purple (only where both meet).

## Typography

| Token | Value |
| --- | --- |
| --font-display | "Big Shoulders Display Variable", "Arial Narrow", sans-serif |
| --font-mono | "JetBrains Mono Variable", "JetBrains Mono Fallback", ui-monospace, monospace |
| --font-sans | "Instrument Sans Variable", system-ui, sans-serif |
| --font-weight-medium | 500 |

Roles (DESIGN.md, Typography): **Display**, Big Shoulders Display 800–900, for H1, H2, card titles and stat numbers; **Body**, Instrument Sans 400–600, for reading text, buttons and nav; **Mono**, JetBrains Mono 500, for data, role/company/date lines, the HUD tag and the terminal panel. Fonts are self-hosted (Fontsource, variable builds). Sentence case for headings, tabular figures for numbers, no gradient text, tracking never below -0.02em, body line length about 34em.

Measured on the live About page: body "Instrument Sans Variable" 16px; H1 "Big Shoulders Display Variable" 72px / weight 900.

### Type scale

| Token | Size | Line height |
| --- | --- | --- |
| --text-body-lg | 1.1875rem | 1.55 |
| --text-caption | .875rem | 1.5 |
| --text-display-lg | 3.25rem | 1 |
| --text-display-page | 4.5rem | 1 |
| --text-display-xl | 6rem | .92 |
| --text-mono-label | .8125rem | 1.4 |
| --text-sm | .875rem | calc(1.25 / .875) |
| --text-title | 1.875rem | 1.05 |
| --text-xs | .75rem | calc(1 / .75) |

## Spacing, radius and layout

| Token | Value |
| --- | --- |
| --breakpoint-lg | 64rem |
| --breakpoint-md | 48rem |
| --breakpoint-sm | 30rem |
| --breakpoint-xl | 90rem |
| --radius | 12px |
| --radius-lg | 16px |
| --radius-md | 12px |
| --radius-pill | 999px |
| --radius-sm | 4px |
| --spacing | .25rem |

Spacing is a 4px scale. Container: 1200px max; side padding 16px at 360px, 24px from 768px, 40px from 1024px. Breakpoints: 480, 768, 1024, 1440px. Mobile first.

## Motion tokens

| Token | Value |
| --- | --- |
| --duration-hover | .15s |
| --duration-intro | 2.6s |
| --duration-press | .16s |
| --duration-reveal | .6s |
| --duration-ui | .22s |
| --ease-in | cubic-bezier(.4, 0, 1, 1) |
| --ease-in-out | cubic-bezier(.77, 0, .175, 1) |
| --ease-out | cubic-bezier(.23, 1, .32, 1) |
| --z-content | 1 |
| --z-dialog | 90 |
| --z-intro | 80 |
| --z-nav | 40 |
| --z-skip | 110 |
| --z-toast | 100 |

## Components and states

Measured on the live site: nav height 73px, primary button 48px high with radius 999px (a pill), secondary button 48px with a 1px rgb(42, 47, 82) border, manga/arc panel on rgb(18, 21, 42), chip radius 999px.

State rules (DESIGN.md, Components): focus-visible is a 2px focus outline with 3px offset, never removed; hover changes lightness or border colour only, in 150ms with ease; active steps one level down; disabled is 45% opacity. Tap targets are at least 44px.

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

## Motion principles

From docs/MOTION.md: motion is loud in a few places and restrained everywhere else; every effect has a static version for `prefers-reduced-motion`; only transform and opacity are animated; UI feedback stays under 300ms, long moments (the Convergence, the intro) are rare and skippable; easing comes from the tokens above (`ui-out` for entrances, `ui-in-out` for movement) and never from a built-in curve; phones and weak GPUs get a lighter version of every effect, never none (3D is a core feature).

## Differences between DESIGN.md and the code

No differences in value. The built CSS only normalises how values are written (`0.92` → `.92`, `160ms` → `.16s`, `rgb(255 77 106 / 0.45)` → `#ff4d6a73`, `0.875rem` → `.875rem`) and adds a font fallback to `--font-mono`. Compared: 69 tokens declared in DESIGN.md; 15 differ only in formatting.
