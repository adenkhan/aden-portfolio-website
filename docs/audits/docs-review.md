# Docs Review (p07)

Reviewed: `CLAUDE.md`, `docs/00-design-plan.md`, `docs/01-brief.md`, `DESIGN.md`, `docs/MOTION.md`, `docs/ENGINEERING-PLAN.md`, `docs/SEO.md` (plus `docs/cv-source.md` for facts). Method: `the-fool` in pre-mortem mode ("it is launch day and the site failed; why?"), then `code-reviewer`'s spec-compliance pass across the docs. Every fix below has been applied in this commit and logged in `docs/DECISIONS.md`.

## Pre-mortem (the-fool)

The plan, steelmanned: a recruiter-first static site whose proof leads, with one memorable orb-collision moment, built in 15 milestones and shipped free on a free host.

The five most likely ways it fails, most likely first:
1. **The motion scope eats the deadline.** The intro and CV burst each had three implementations (Three.js, Lottie, CSS), plus particles, a pointer glow and two versions of the skills tree. The 2D version had to be built anyway. → Build 2D first for everyone; everything else is cut or optional.
2. **The intro delays the largest paint.** Hiding the hero (and fading the avatar from 0) before first paint would move LCP to the end of the intro, failing the 2.5 s budget on phones. → Hidden states only after first paint, never on the avatar.
3. **The recruiter test fails on Home.** The brief says a recruiter must see IBA and availability within 30 seconds, but Home's copy had neither. → One availability line on Home, built from existing copy.
4. **The grader marks rubric item 1 down.** The design plan's wireframe was a text list. → Real per-page wireframes added.
5. **The avatar is late or a placeholder at launch,** so Home has no "high-quality image". → Launch gate in p21 and a logged risk; the owner already chose avatar over photo.

## Findings and fixes

| # | Type | Issue | Docs affected | Fix (applied) |
|---|---|---|---|---|
| 1 | Contradiction | Palette: design plan suggests #FF3B5C / #2FA8FF / #9B5CFF; DESIGN.md uses #FF4D6A / #3DB0FF / #A77CFF | 00-design-plan, DESIGN | Status note at the top of the design plan points to DESIGN.md as final; the change was already logged |
| 2 | Contradiction | Fonts: design plan suggests Bebas/Anton + Inter; DESIGN.md uses Big Shoulders Display + Instrument Sans | 00-design-plan, DESIGN | Same status note; already logged |
| 3 | Contradiction | Lighthouse SEO: design plan 90+, brief 100, engineering plan 95 floor | 00-design-plan, 01-brief, ENGINEERING-PLAN | Brief now says "SEO 95+ (aim 100)"; design plan note points to the engineering plan |
| 4 | Contradiction | Routes: CLAUDE.md lists four routes + 404; engineering plan and SEO add `/thanks/` and trailing slashes | CLAUDE, ENGINEERING-PLAN, SEO | CLAUDE.md non-negotiable now lists `/thanks/` (noindex) and "trailing slash always" |
| 5 | Contradiction | Glow: DESIGN.md allows glow only on orb, CV burst and focus ring; MOTION.md added a pointer-following glow on the avatar card | DESIGN, MOTION, ENGINEERING-PLAN | Pointer glow cut from MOTION.md, the engineering plan (file list, p13) and DESIGN.md's phone note |
| 6 | Contradiction | Budget exclusions: your constraint excludes only lazy 3D; the engineering plan also excluded tsParticles and Lottie | MOTION, ENGINEERING-PLAN | Only three + postprocessing are excluded; tsParticles counts if built |
| 7 | Contradiction | Library list: CLAUDE.md implies DrawSVG, MorphSVG, Lottie and particles are in use | CLAUDE, MOTION, ENGINEERING-PLAN | CLAUDE.md stack table marks what is used, optional, stretch or unused |
| 8 | Contradiction | Particles appear in MOTION.md but not in DESIGN.md's motif rules | DESIGN, MOTION | DESIGN.md motif table gains a particles row (hero only, desktop, stretch) |
| 9 | Rubric gap | Home "professional intro": no IBA or availability on Home, so the brief's 30-second recruiter test cannot pass | SEO, ENGINEERING-PLAN | Home availability line ("BBA Marketing student at IBA Karachi. Open to internships now and full-time roles from mid-2027.") added to `HomeCopy`, SEO appendix, p09 and p13 criteria |
| 10 | Rubric gap | Rubric item 1 asks for a wireframe; the design plan has a text list only | 00-design-plan | New `docs/02-wireframes.md` with mobile and desktop wireframes per page; linked from the design plan, CLAUDE.md and p09 |
| 11 | Rubric gap | Home "high-quality image" depends on an avatar that has not arrived | ENGINEERING-PLAN | p21 launch gate; if missing, deploy and log the open risk |
| 12 | Rubric gap | About/Contact H1 keyword | SEO | Already fixed in p06 (H1 sublines); confirmed, no further change |
| 13 | Rubric gap | GitHub Pages backup would break links (served from a subpath) | ENGINEERING-PLAN | §12 notes `base`, a single link helper from p08, and mailto in place of the form |
| — | Rubric check | About bio/education/goals, Work projects and skills, Contact email and LinkedIn, meta descriptions, alt text rules, mobile rules, Vercel hosting | all | Present and specified; no change |
| 14 | Over-scope | Lottie burst: a third burst implementation with no asset | MOTION, ENGINEERING-PLAN | **Cut** |
| 15 | Over-scope | Avatar pointer glow | MOTION, ENGINEERING-PLAN | **Cut** (also finding 5) |
| 16 | Over-scope | Skills tree had two implementations (DrawSVG SVG on desktop, scaled divs on mobile) | MOTION, ENGINEERING-PLAN | **Replaced** by one HTML tree with transform-scaled connectors at every width; DrawSVG dropped |
| 17 | Over-scope | tsParticles: decoration with a continuous main-thread cost | MOTION, ENGINEERING-PLAN | **Stretch goal**: built only after p17 if Home has budget headroom |
| 18 | Over-scope | Three.js intro and burst: largest chunk and biggest mobile risk | MOTION, ENGINEERING-PLAN | **Re-sequenced**: 2D version first for every tier (p11, p12); Three.js is a `full`-tier enhancement kept only if budgets hold |
| 19 | Performance | Fading the avatar (LCP image) from opacity 0 and hiding hero text before first paint would delay LCP | MOTION, ENGINEERING-PLAN | Avatar animates with transform only; hidden states applied after first paint under the overlay; p13 criterion and checklist item added |
| 20 | IP | No franchise names or technique names found in any doc or the canvas (searched) | — | No change |
| 21 | IP | The avatar's originality is assumed, not confirmed | 01-brief, ENGINEERING-PLAN | Open question added to the brief; p19 requires the owner's confirmation; risk row added |
| 22 | IP | The red + blue → purple collision could be read as a reference to an existing anime technique | CLAUDE, MOTION | Already covered: the effect is never named or labelled with a franchise term; p19 adds a grep of `src/` and `dist/` for franchise and technique names |
| 23 | Missing AC | No acceptance criterion for self-hosted fonts | ENGINEERING-PLAN | p08: no requests to Google Fonts |
| 24 | Missing AC | No INP check | ENGINEERING-PLAN | p17: TBT < 200 ms on every route plus a dialog and menu response check |
| 25 | Missing AC | H1 sublines and wireframe conformance not checked | ENGINEERING-PLAN | p09 criteria added |
| 26 | Missing AC | Mission card links could point to ids that do not exist | ENGINEERING-PLAN | p14 criterion added |
| 27 | Missing AC | 2D intro not required to stand alone | ENGINEERING-PLAN | p11: 2D version passes on its own and is committed before any 3D work |
| 28 | Missing AC | No IP check before launch | ENGINEERING-PLAN | p19 criterion added |
| 29 | Risk | Vercel subdomain may be taken; LCP risk; deadline risk; wireframe risk; avatar IP risk not in the register | ENGINEERING-PLAN | Five rows added to the risk register |

## Cut order if time or budget runs short

Already applied: 1–3. Apply 4–6 in order only if a milestone slips or a budget fails.

1. Avatar pointer glow (cut).
2. Lottie burst (cut).
3. DrawSVG skills tree (replaced).
4. Particles (stretch goal; do not build).
5. Three.js enhancement (ship the 2D intro and burst for everyone).
6. Contact prompt scramble (static prompt line).

Never cut: the 2D intro with Skip and Esc, the CV dialog, reduced-motion handling, the About panel reveal (cheap, and explains the sequence).
