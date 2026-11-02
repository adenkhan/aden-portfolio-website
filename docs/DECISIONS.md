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

## 2026-11-02 — Motion system
- Decision: `docs/MOTION.md` defines three tiers (full, lite, reduced), keeps the intro (2.6 s, 2.0 s on lite), the CV burst, the Home H1 word rise, the About panel scroll reveal, the Home count-ups, the skills-tree line drawing, a CSS scroll-snap gallery, a decorative contact prompt scramble, hero-only particles, an avatar-card pointer glow, CSS hover and press, and native cross-document view transitions.
- Why: Follows the brief's "loud once, restrained elsewhere" and the `animate` decision order. Each kept moment has a named purpose.
- Source: p04, `docs/MOTION.md`.

## 2026-11-02 — Motion cuts and moves
- Decision: Cut the headline glitch and type-in, mission-card entrances, typing out the contact details, the page-wide cursor glow and parallax. Move count-ups from Work to the Home stats strip. Replace a pinned horizontal gallery with CSS scroll-snap. Do not use Astro's client router or Rive.
- Why: Glitch and typewriter headings are listed as cringe in the brief; the Work numbers sit inside sentences; contact details must be instant; scroll-jacking hurts phones and keyboard users; native view transitions need no JS; there is no `.riv` file.
- Source: p04, `docs/MOTION.md` section 3.

## 2026-11-02 — Motion easing tokens replace the expo curve
- Decision: Use `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, registered in GSAP as `ui-out` and `ui-in-out` with CustomEase. Durations: press 160 ms, hover 150 ms, UI 220 ms, reveal 600 ms, intro 2600 ms.
- Why: These are the curves the `animate` skill requires; the earlier `--ease-out-expo` token in DESIGN.md is replaced so there is one easing system.
- Source: p04, `docs/MOTION.md` section 1, `DESIGN.md` @theme.
- Supersedes: `--ease-out-expo`, `--duration-fast`, `--duration-base` and `--duration-intro: 2800ms` in the DESIGN.md @theme block.

## 2026-11-02 — Intro gating details
- Decision: An inline head script sets `html.intro` before first paint only if `sessionStorage["ak.intro"]` is unset and motion is not reduced. The flag is written when the intro starts, so a reload mid-intro does not replay it. If storage throws, the intro does not play. Esc is handled by the inline script. The 3D chunk gets 600 ms to load before the 2D fallback runs.
- Why: Meets the once-per-session, Esc and Skip constraints, keeps no-JS visitors overlay-free, and stops a slow 3D download from delaying the page.
- Source: p04, `docs/MOTION.md` moment 1.

## 2026-11-02 — JS budget approach
- Decision: Home's first load has no React island; the CV dialog is a native `<dialog>`; React islands use `client:visible` or `client:idle`; Three.js, tsParticles and lottie-web load lazily. Estimated first load is about 62 KB gzip without islands. The build must check the real size.
- Why: Keeps first load under the 150 KB gzip target with room for one island. The figures are estimates, not measurements.
- Source: p04, `docs/MOTION.md` section 4.

## 2026-11-02 — Engineering architecture
- Decision: Static multi-page Astro with no `<ClientRouter />`; native cross-document view transitions. No required React islands (optional Kokonut/Bklit islands use `client:visible` or `client:media`). All copy in typed `src/data/*.ts`, not content collections. Netlify hosting with GitHub Pages as a static backup.
- Why: Four real pages for the rubric, a 150 KB first-load budget, and simpler motion lifecycle (no swap events to clean up).
- Source: p05, `docs/ENGINEERING-PLAN.md` §1 (ADR-001 to ADR-004).

## 2026-11-02 — Site URL placeholder and /thanks route
- Decision: `site` is `https://adenkhan.netlify.app` until deploy confirms the real origin. A `/thanks` page (noindex, excluded from the sitemap) confirms Netlify form submissions.
- Why: Canonical, OG and sitemap URLs need an absolute origin from p08 onward; the form needs a landing page.
- Source: p05, `docs/ENGINEERING-PLAN.md` §4 and §10.

## 2026-11-02 — Lane assignments
- Decision: Missions 1 both, 2 data, 3 creative, 4 data, 5 data, 6 data, 7 both, 8 creative, 9 creative. Arcs 1 creative, 2 both, 3 data, 4 both. Skill lanes: product both, growth creative, data data, creative creative.
- Why: Red is storytelling and campaigns, blue is analytics, automation and tooling, purple is where both are needed (DESIGN.md Colors).
- Source: p05, `docs/ENGINEERING-PLAN.md` §3.

## 2026-11-02 — SEO score floor
- Decision: Lighthouse SEO ≥ 95 is the pass floor per the owner's p05 budgets; 100 remains the aim from the brief.
- Source: p05, `docs/ENGINEERING-PLAN.md` §9.
- Supersedes: "SEO 100" as a hard target in the 2026-11-02 Lighthouse targets entry.

## 2026-11-02 — Site URL constant
- Decision: `SITE_URL = "https://aden-khan-portfolio.netlify.app"` in `src/data/site.ts`, the only place the origin is written. Prompt 21 replaces it with the live URL.
- Source: p06, owner's value; `docs/SEO.md` §1.
- Supersedes: the `https://adenkhan.netlify.app` placeholder in the "Site URL placeholder and /thanks route" entry.

## 2026-11-02 — H1 sublines on About and Contact
- Decision: Keep "The origin arc: from campaigns to products" and "Open a channel" word for word, and add a visible second line inside each H1: "About Aden Khan, product marketer" and "Contact Aden Khan, product marketer".
- Why: CLAUDE.md requires every H1 to contain a target keyword; these two did not. Visible text, no hidden keywords. The owner can remove the sublines if they accept the rubric risk.
- Source: p06, `docs/SEO.md` §3 and §10.

## 2026-11-02 — Metadata rules from the fixing-metadata review
- Decision: Trailing slash always; deploy previews `noindex`; one JSON-LD block per page (Home `@graph` of WebSite + Person, About `ProfilePage`); `/thanks/` and `/404` get titles, descriptions and `noindex`; OG tags include image alt, site name, locale and size; per-page OG images; mission cards link to the About arc (or skills lane) that tells the longer story; no web manifest. Titles keep the owner's mixed formats.
- Why: Each closes a gap the review found (`docs/SEO.md` §10).
- Source: p06, `docs/SEO.md`.
- Supersedes: separate Person and WebSite JSON-LD blocks and the single default OG image in `docs/ENGINEERING-PLAN.md` (updated in the same commit).

## 2026-11-02 — p07 docs review: contradictions resolved
- Decision: The design plan gets a status note naming DESIGN.md, SEO.md, MOTION.md and ENGINEERING-PLAN.md as final for palette, type, SEO, motion, stack and budgets. The brief's SEO target reads "95+ (aim 100)". CLAUDE.md lists `/thanks/` and trailing slashes in its routes rule, and its stack table marks each library as used, optional, stretch or unused. DESIGN.md's motif table gains a particles row.
- Why: Findings 1–4, 7 and 8 in `docs/audits/docs-review.md`.
- Source: p07.

## 2026-11-02 — p07: pointer glow and Lottie burst cut
- Decision: Cut the avatar-card pointer glow and the Lottie CV burst.
- Why: The glow contradicted DESIGN.md's glow rule and is decoration only; the Lottie path was a third burst implementation with no asset.
- Source: p07, findings 5, 14, 15.
- Supersedes: MOTION.md 7b "narrowed" glow and the Lottie owner in moment 2.

## 2026-11-02 — p07: one skills-tree implementation
- Decision: The skills tree is HTML with transform-scaled connectors at every width (4, 2 or 1 columns). DrawSVG is not used.
- Why: One implementation instead of two; nothing breaks on reflow; one fewer plugin.
- Source: p07, finding 16.
- Supersedes: MOTION.md 5c SVG/DrawSVG desktop version.

## 2026-11-02 — p07: 2D intro first, 3D optional, particles stretch
- Decision: The 2D intro and burst are built first and ship on every tier. Three.js is an enhancement for the `full` tier, kept only if Home meets the budgets. Particles are a stretch goal built only after p17 with budget headroom.
- Why: The 2D version had to exist anyway; 3D and particles are the biggest performance and deadline risks.
- Source: p07, findings 17, 18; cut order in `docs/audits/docs-review.md`.

## 2026-11-02 — p07: first-load budget excludes only 3D
- Decision: The 150 KB gzip first-load budget excludes three and postprocessing only. tsParticles counts if built.
- Why: Matches the owner's constraint ("excluding lazily loaded 3D").
- Source: p07, finding 6.
- Supersedes: the exclusions for tsParticles and Lottie in ENGINEERING-PLAN.md.

## 2026-11-02 — p07: LCP-safe intro
- Decision: Hero hidden states are applied only after the first paint and only under the overlay. The avatar (LCP image) animates with transform only, never from opacity 0.
- Why: Hiding the hero before first paint would move LCP to the end of the intro.
- Source: p07, finding 19.

## 2026-11-02 — p07: Home availability line
- Decision: Add "BBA Marketing student at IBA Karachi. Open to internships now and full-time roles from mid-2027." under the Home subhead.
- Why: The brief's recruiter test needs IBA and availability on Home within 30 seconds. Both sentences reuse existing About copy, so no new facts.
- Source: p07, finding 9; `docs/SEO.md` appendix.

## 2026-11-02 — p07: wireframes doc
- Decision: Add `docs/02-wireframes.md` with mobile and desktop wireframes for every page.
- Why: Rubric item 1 asks for a wireframe; the design plan had a text list.
- Source: p07, finding 10.

## 2026-11-02 — p07: new acceptance criteria and risks
- Decision: Add criteria for self-hosted fonts (p08), H1 sublines, wireframes and the availability line (p09), a standalone 2D intro (p11), recruiter test and avatar opacity (p13), mission link ids and the single skills tree (p14), TBT/INP (p17), an IP grep and avatar originality confirmation (p19), and an avatar launch gate (p21). Add risk rows for LCP, deadline, Netlify subdomain, wireframe and avatar IP. Document the GitHub Pages base-path requirement.
- Why: Findings 11, 13, 21–29.
- Source: p07.
