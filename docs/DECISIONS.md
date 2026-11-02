# Decisions Log

Running log of project decisions. Newest entries at the bottom. Update this file whenever a decision changes.

Format:
```
## YYYY-MM-DD — <short title>
- Decision: what was decided
- Why: reason
- Source: prompt / doc
- Supersedes: earlier entry, if any
```

## 2026-11-02 — Intro is rare, short and optional
- Decision: Intro orb collision runs under 3 s, once per session, with a skip button. It does not run for reduced-motion or no-JS visitors, and it never delays real text in the HTML.
- Why: A recruiter has under a minute. The collision is the signature moment but must not cost reading time.
- Source: p02, `docs/01-brief.md` decisions 4 and 8.

## 2026-11-02 — Motion is loud once, restrained elsewhere
- Decision: Large motion is limited to the intro collision and the CV-download burst. Elsewhere motion must explain something (count-up, panel assembly, skills branch lighting) or be cut.
- Why: Keeps proof ahead of style.
- Source: p02, `docs/01-brief.md` decision 4.

## 2026-11-02 — Colour carries meaning
- Decision: Red marks creative work, blue marks data work, purple appears only where both are shown together. Specific hex values stay open until prompt 3.
- Why: Keeps the Creative × Data = Growth metaphor honest.
- Source: p02, `docs/01-brief.md` decision 12.

## 2026-11-02 — No invented stat-bar numbers
- Decision: The avatar's stat bars (Positioning, Analytics, Automation, Paid growth) show labels only, or are tied to real proof. No made-up percentages.
- Why: Unexplained ratings read as fake and conflict with the "never invent beyond cv-source" rule.
- Source: p02, `docs/01-brief.md` decision 10.

## 2026-11-02 — Gamified language is limited to labels
- Decision: Game vocabulary ("missions", "player 01", "open a channel") is allowed in labels and microcopy. Headlines and body copy stay professional.
- Why: A recruiter should never have to decode the page.
- Source: p02, `docs/01-brief.md` decision 11.

## 2026-11-02 — 3D and particles are decoration only
- Decision: Three.js, postprocessing and tsParticles carry no content and load after the page text.
- Why: Content must be readable without JavaScript and render fast.
- Source: p02, `docs/01-brief.md` decision 14.

## 2026-11-02 — Lighthouse targets
- Decision: Mobile production build targets Performance 85+, Accessibility 95+, Best Practices 95+, SEO 100, with LCP under 2.5 s and no layout shift from the intro.
- Why: The design plan asks for 90+ on SEO and accessibility. Performance gets a small allowance for the motion layer.
- Source: p02, `docs/01-brief.md` section 6.
- Supersedes: the "Lighthouse target 90+ for SEO and accessibility" line in `docs/00-design-plan.md` (raised for SEO and accessibility, performance added).

## 2026-11-02 — Unresolved items stay open
- Decision: The open questions in `docs/01-brief.md` section 8 (avatar file, mission evidence, phone number, old Vercel site, contact form, sound) are logged and do not block work.
- Why: CLAUDE.md autonomy rule: build to placeholders and keep going.
- Source: p02, `docs/01-brief.md` section 8.

## 2026-11-02 — Visual direction: C (clean futuristic) with borrowed parts
- Decision: Build on direction C, "Collision HUD". Borrow B's manga-panel framing for the About section and A's HUD corner brackets for the avatar card and terminal panel only. Dark theme only.
- Why: C scored highest for a recruiter (clarity and readability) while keeping the orb story. B and A each put a loud effect on every element, which breaks the brief's "loud once, restrained elsewhere" rule.
- Source: p03, `docs/design-canvas/index.html`, `DESIGN.md`.

Scores (1 to 5, higher is better; performance is "cheap to run"):

| Direction | Recruiter clarity | Distinctiveness | Readability | Performance cost | Total |
|---|---|---|---|---|---|
| A. Neon cyber HUD | 3 | 3 | 3 | 2 | 11 |
| B. Ink and halftone manga | 3 | 5 | 3 | 4 | 15 |
| C. Clean futuristic, anime accents | 5 | 4 | 5 | 4 | 18 |

- A: glowing text, full-page scanlines and grid hurt legibility, and the overlay repaints constantly. Neon cyber is also a familiar genre.
- B: the most memorable, but huge condensed caps, tilted panels and hard offset shadows make long reading tiring. Hard offset shadows are also on the impeccable refuse list outside a neobrutalist world.
- C: content leads, a single orb collision carries the idea, and the effects are static layers that can be pre-rendered.

## 2026-11-02 — HUD tag moves inside the avatar card
- Decision: "// PLAYER 01 · PRODUCT MARKETER · KARACHI" sits inside the character-select card as its status line, not above the H1.
- Why: A kicker above a heading is a ban in impeccable's craft floor. The tag keeps its wording from the design plan but no longer acts as an eyebrow.
- Source: p03, `DESIGN.md` Components. The canvas still shows the tag above the H1; the canvas is exploration and DESIGN.md governs.

## 2026-11-02 — Typefaces
- Decision: Display Big Shoulders Display (variable), body Instrument Sans (variable), mono JetBrains Mono (variable). All self-hosted with Fontsource (`@fontsource-variable/*`, v5.3.0).
- Why: Distinctive condensed display, a readable non-Inter body, and a mono kept for data and readouts. Avoids the Inter/Roboto/Arial defaults called out in Anthropic's frontend-aesthetics notebook.
- Source: p03, `DESIGN.md` Typography.
- Supersedes: the design plan's type suggestion (Bebas Neue or Anton, Inter, JetBrains Mono).

## 2026-11-02 — Palette adjusted for contrast
- Decision: Keep red/blue/purple but lighten them: creative #FF4D6A, data #3DB0FF, growth #A77CFF. Background #0B0D1A and text #F2F3FA unchanged. Use #6970B0 for control borders.
- Why: The design plan's #9B5CFF purple gave 4.94 on the base background and 4.12 on raised surfaces, and white text on it gave 3.9. The adjusted set passes WCAG AA on every surface (lowest text ratio 5.00, lowest border ratio 3.49).
- Source: p03, `DESIGN.md` Colors.
- Supersedes: the palette suggestion in `docs/00-design-plan.md` section 4.

## 2026-11-02 — Lane shown by dot and word, not stripe
- Decision: Mission cards mark Creative, Data or Both with a filled dot and the word, with a lane-coloured top edge on panels. No coloured side borders.
- Why: Coloured border-left accents above 1px are on impeccable's refuse list, and colour alone would not meet accessibility needs.
- Source: p03, `DESIGN.md` Components and Do's and Don'ts.

## 2026-11-02 — Hero stats strip is kept but constrained
- Decision: Keep the four-number strip from the design plan once, on Home only, coloured by lane and attributed to a role.
- Why: It matches the hero-metric template that impeccable flags, but the copy and numbers are fixed by the design plan and the recruiter needs them. The constraint reduces the template feel.
- Source: p03, `DESIGN.md` Do's and Don'ts.
