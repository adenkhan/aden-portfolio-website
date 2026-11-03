# CLAUDE.md — Aden Khan Portfolio

Permanent project memory. Read it first, then the docs it points to.

## 1. Project
Personal portfolio for **Aden Khan**, product marketer (IBA Karachi, BBA Marketing, graduating June 2027).
It is also a **graded university assignment (4 marks)**:
1. Design plan doc with purpose, audience and wireframe (`docs/00-design-plan.md`).
2. Home (professional intro, headline, high-quality image), About (bio, education, career goals), Portfolio/Skills page, Contact page (email and LinkedIn).
3. SEO: keywords in headings and content, meta descriptions, image alt text, mobile-friendly and readable.
4. Live on a free host (the owner chose Vercel).

Facts about Aden come only from `docs/cv-source.md`. Never invent roles, numbers or dates.

## 2. Stack
Astro static output + React islands + Tailwind v4 + shadcn/ui (style `base-nova`, alias `@/*` → `src/*`).
shadcn registries: `@kokonutui`, `@bklit` (see `components.json`). shadcn MCP is in `.mcp.json`.

| Package | Version |
|---|---|
| astro | 7.4.4 |
| @astrojs/react | 7.1.2 |
| react / react-dom | 19.3.1 |
| tailwindcss / @tailwindcss/vite | 4.3.3 |
| gsap | 3.15.0 (uses ScrollTrigger, SplitText, ScrambleText, CustomEase; DrawSVG and MorphSVG are free but unused) |
| lenis | 1.3.27 |
| motion | 14.9.0 |
| lottie-web | 5.13.0 (installed, unused: cut in p07) |
| @rive-app/canvas | 2.49.0 |
| three / @types/three | 0.187.0 (core: the persistent 3D world behind every page, r3; plain Three.js + custom GLSL) |
| postprocessing | 6.39.6 |
| @react-three/fiber, @react-three/drei, @react-three/postprocessing | allowed from r1; not installed (r3 chose plain Three.js, see `docs/DECISIONS.md`) |
| @pixiv/three-vrm | 3.5.5 (the owner's VRoid avatar, r9) |
| @pixiv/three-vrm-animation | 3.5.5 (optional .vrma clips, lazy) |
| shadcn (CLI, dev) | 4.23.0 |

Node `>=22.23.4`. Astro uses its default static output (no `output` set in `astro.config.mjs`).

## 3. Commands
- Dev server (background, required by AGENTS.md): `astro dev --background`
- Manage it: `astro dev status`, `astro dev logs`, `astro dev stop`
- Build: `npm run build` · Preview: `npm run preview`
- Type check: `npm run check` · Format: `npm run format` · Tests: `npm test` (Playwright, builds and previews first)
- Budget: `npm run budget` (first-load JS per page) · All gates: `npm run verify`
- 3D world switches (per session): `?world=force` runs it even on software WebGL (tests, review), `?world=off` keeps the CSS orbs, `?quality=high|medium|low` pins a tier. `?avatar=off` keeps the avatar poster (no 16 MB model). Debug handle: `window.__akWorld.debug`.
- Assets: `npm run assets:check` (which slots are still placeholders), `npm run assets:generate` (recreate missing placeholders). See `docs/ASSETS.md`.
- Add components: `npx shadcn@latest add @kokonutui/<name>` or `@bklit/<name>`

## 4. Non-negotiables
- Four real routes: `/`, `/about/`, `/work/`, `/contact/`, plus `/thanks/` (form confirmation, noindex) and a 404. Separate pages, not one scroll. Trailing slash always.
- All meaningful text is real HTML. Never bake text into images or canvas.
- Every page has a unique `<title>`, meta description, exactly one H1 containing a target keyword, Open Graph tags and a canonical URL.
- Every image has descriptive alt text; decorative images use `alt=""`.
- The site is fully readable with JavaScript disabled, and the first paint always shows real HTML text. This is the only sense in which visuals are optional: 3D and motion are core features (§4a), not progressive enhancement.
- `prefers-reduced-motion` users get a calm, static version of every effect: no intro, no parallax, no large movement. This is the only setting that turns effects static.
- Mobile first. Works at 360px wide with no horizontal scroll.
- The hero image is the original illustrated avatar (no photo, by the owner's choice).
- IP rule: no characters, logos, names or named techniques from any anime or other franchise. The red-orb plus blue-orb collision is an original effect and is never labelled with a franchise term. The rule covers the site's own design and animations, not the owner's past work shown as portfolio pieces (the Good Liar concept posters, r10; `docs/DECISIONS.md`). Even there, never use franchise names in alt text, file names, headings or meta tags.
- Deploy target is Vercel (owner decision, r11), live at https://aden-portfolio-website.vercel.app. The contact form posts to the Vercel function `api/contact.js` (needs `RESEND_API_KEY` in the project environment). Do not migrate to another host.

## 4a. Round 2 rules (from r1, 2026-11-02)
The p16 site was too text heavy, repetitive and flat. Evidence: `docs/audits/round2-baseline.md`. These rules override any older rule in any doc that conflicts with them, including `docs/01-brief.md` ("loud in two places"), `DESIGN.md` glow and motif limits, and the p07 cut list.
- **Visual first.** Every section leads with a visual or motion moment; text is its caption. Word budgets count visible words in `<main>` (not nav, footer, `.sr-only` or meta):

  | Page | Budget |
  |---|---|
  | Home | ≤ 80 |
  | About | ≤ 160 |
  | Work | ≤ 60 per case study |
  | Contact | ≤ 40 |

- **Say each fact once on the whole site.** A metric, employer, date, place or credential is shown on one page, in one place. BBA/IBA appears only in the About education chip, plus meta tags and JSON-LD. The CV dialog previews the PDF on request and is exempt, like meta. Exception (owner, r2): the three headline metrics (−72% CAC, +40% reach, $7K+/$7,000+ sponsorships) may appear as a Home counter, an About arc chip and a Work case-study result, because the owner's copy places them there.
- **3D is a core feature on every page.** A persistent WebGL scene runs behind the site (built in R3). It is not progressive enhancement and is never cut for budget.
- **Performance work may lower quality but may not remove an effect.** Allowed levers: pixel ratio, particle counts, shader detail, postprocessing resolution, and frame rate when idle or off-screen. Mobile and low-power devices get a lighter version of every effect. Only `prefers-reduced-motion` gets static versions. A device with no usable WebGL gets the 2D or static version, because the effect can't run there; that is a capability limit, not a budget cut.
- **Budgets:**
  - Lighthouse Performance: desktop ≥ 75, mobile ≥ 65.
  - Lighthouse SEO and Accessibility: ≥ 95.
  - JavaScript: no limit on lazily loaded 3D and visual chunks. First-load (entry) JS stays under 150 KB gzip, and the first paint must show real HTML text.
- **Libraries.** React Three Fiber, drei and custom GLSL shaders are allowed. Install `@react-three/fiber`, `@react-three/drei` and `@react-three/postprocessing` in the prompt whose plan first uses them.
- Round 2 prompts commit as `rN: <area>`.

## 5. Skill routing
| Task | Skills |
|---|---|
| UI direction | `frontend-design:frontend-design` + `ui-ux-pro-max` |
| Design audit | `impeccable`, `baseline-ui`, `web-design-guidelines` |
| Motion design | `animate`, `emil-design-eng`, `animation-vocabulary` |
| Motion performance | `animation-performance`, `fixing-motion-performance` |
| Components | shadcn MCP (Kokonut, Bklit) |
| Metadata | `fixing-metadata` |
| Accessibility | `fixing-accessibility` |
| Browser tests | `playwright-skill`, `ui-test` |
| Copy edits | `no-ai-slop` |
| Planning | `superpowers:brainstorming`, `superpowers:writing-plans` |
| Bugs | `superpowers:systematic-debugging` |
| Before claiming done | `superpowers:verification-before-completion` |

Overview of every installed skill: `docs/SKILLS-AND-TOOLS.md`.

## 6. Docs index
Read the relevant docs before changing code. Update `docs/DECISIONS.md` whenever a decision changes.

| File | Purpose | Status |
|---|---|---|
| `docs/00-design-plan.md` | Purpose, audience, wireframe, SEO plan, word-for-word site copy, stack | exists |
| `docs/cv-source.md` | Source facts for the CV and all copy | exists |
| `docs/SKILLS-AND-TOOLS.md` | Installed skills and tools reference | exists |
| `docs/01-brief.md` | Creative brief: positioning, personality, concept, success criteria | exists |
| `docs/02-wireframes.md` | Low-fidelity wireframes per page, mobile and desktop | exists |
| `docs/audits/docs-review.md` | p07 cross-doc review: contradictions, rubric gaps, cuts (its cut order is superseded by §4a) | exists |
| `docs/audits/ui.md` | p16 UI audit: merged findings, fixed or deferred | exists |
| `docs/audits/round2-baseline.md` | r1 baseline: word counts, repeated facts, text-heavy sections, every 3D/motion cut and its cause | exists |
| `DESIGN.md` | Design system: tokens, type, components, Tailwind @theme block | exists |
| `docs/design-canvas/` | Three-direction exploration canvas (open index.html) | exists |
| `docs/MOTION.md` | Motion system: tiers, moments, budget, checklist | exists |
| `docs/ENGINEERING-PLAN.md` | Architecture, folders, data types, budgets, tests, deploy, milestones p08–p22, risks | exists |
| `docs/ASSETS.md` | Every asset slot: path, size, alt, how to swap a placeholder | exists |
| `docs/SEO.md` | SEO spec: SITE_URL, titles, H1/H2s, alt text, OG, JSON-LD, links, checklist, copy appendix | exists |
| `docs/DECISIONS.md` | Running log of decisions | exists |

## 7. Definition of done
A task is done only when all of these hold:
- `astro check` and `npm run build` pass.
- No console errors.
- The change works at 375px and 1440px.
- Reduced-motion behaviour is checked.
- Round 2 pages: the §4a word budget holds, no fact is repeated, and the persistent scene runs on the page (lighter on mobile, static only for reduced motion).
- Docs are updated.

Run `superpowers:verification-before-completion` and show evidence before saying so.

## 8. Autonomy
The owner does not want manual work.
- Never stop to ask. When a skill asks clarifying questions, answer them yourself from the docs, make the call, log it in `docs/DECISIONS.md` and continue.
- Stop only if an action would break a non-negotiable above, or needs a sign-in.
- Commit at the end of every task with a message like `p08: scaffold`.

## 9. Assets
Real assets (avatar, screenshots, CV PDF) arrive later. Always build around the placeholder slots in `src/data/assets.ts` (created in prompt 8). Never block on a missing asset.

## 10. Repo notes
- Public GitHub repo: `adenkhan/aden-portfolio-website`, branch `main`. Do not commit secrets or `.env` files.
- `docs/cv-source.md` contains a phone number and is public. Do not copy the number into site pages.
