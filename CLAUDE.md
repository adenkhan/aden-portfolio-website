# CLAUDE.md — Aden Khan Portfolio

Permanent project memory. Read it first, then the docs it points to.

## 1. Project
Personal portfolio for **Aden Khan**, product marketer (IBA Karachi, BBA Marketing, graduating June 2027).
It is also a **graded university assignment (4 marks)**:
1. Design plan doc with purpose, audience and wireframe (`docs/00-design-plan.md`).
2. Home (professional intro, headline, high-quality image), About (bio, education, career goals), Portfolio/Skills page, Contact page (email and LinkedIn).
3. SEO: keywords in headings and content, meta descriptions, image alt text, mobile-friendly and readable.
4. Live on a free host: GitHub Pages, Netlify or Wix.

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
| gsap | 3.15.0 (ScrollTrigger, SplitText, ScrambleText, DrawSVG, MorphSVG; all free) |
| lenis | 1.3.27 |
| motion | 14.9.0 |
| lottie-web | 5.13.0 |
| @rive-app/canvas | 2.49.0 |
| @tsparticles/engine, @tsparticles/slim | 4.5.0 |
| three / @types/three | 0.187.0 |
| postprocessing | 6.39.6 |
| @pixiv/three-vrm | 3.5.5 |
| shadcn (CLI, dev) | 4.23.0 |

Node `>=22.23.4`. Astro uses its default static output (no `output` set in `astro.config.mjs`).

## 3. Commands
- Dev server (background, required by AGENTS.md): `astro dev --background`
- Manage it: `astro dev status`, `astro dev logs`, `astro dev stop`
- Build: `npm run build` · Preview: `npm run preview`
- Type check: `npx astro check` (needs `@astrojs/check` and `typescript`; install them the first time it is used)
- Tests: to be added (Playwright via `playwright-skill`).
- Add components: `npx shadcn@latest add @kokonutui/<name>` or `@bklit/<name>`

## 4. Non-negotiables
- Four real routes: `/`, `/about`, `/work`, `/contact`, plus a 404. Separate pages, not one scroll.
- All meaningful text is real HTML. Never bake text into images or canvas.
- Every page has a unique `<title>`, meta description, exactly one H1 containing a target keyword, Open Graph tags and a canonical URL.
- Every image has descriptive alt text; decorative images use `alt=""`.
- The site is fully readable with JavaScript disabled. Motion is progressive enhancement.
- `prefers-reduced-motion` users get a calm version: no intro, no parallax, no large movement.
- Mobile first. Works at 360px wide with no horizontal scroll.
- The hero image is the original illustrated avatar (no photo, by the owner's choice).
- IP rule: no characters, logos, names or named techniques from any anime or other franchise. The red-orb plus blue-orb collision is an original effect and is never labelled with a franchise term.
- Deploy target is Netlify, with GitHub Pages as backup. **Do not deploy to Vercel**; the rubric does not allow it.

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
| `DESIGN.md` | Design system: tokens, type, components, Tailwind @theme block | exists |
| `docs/design-canvas/` | Three-direction exploration canvas (open index.html) | exists |
| `docs/MOTION.md` | Motion system and moments | pending |
| `docs/ENGINEERING-PLAN.md` | Build plan and architecture | pending |
| `docs/SEO.md` | SEO implementation details | pending |
| `docs/DECISIONS.md` | Running log of decisions | exists |

## 7. Definition of done
A task is done only when all of these hold:
- `astro check` and `npm run build` pass.
- No console errors.
- The change works at 375px and 1440px.
- Reduced-motion behaviour is checked.
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
