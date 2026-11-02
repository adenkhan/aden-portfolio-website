# Skills & Tools Reference — Aden Portfolio

Everything installed in this Claude Code setup, what it does, and when to reach for it. Skills load after a Claude Code restart; type `/` in chat to see them.

> Security note: skills run with full agent permissions. Most of these were installed without reading their source.

---

## 1. Quick picks for the portfolio

| I want to... | Use |
|---|---|
| Plan the site before building | `superpowers:brainstorming` → `superpowers:writing-plans` |
| Make the UI look distinctive, not templated | `frontend-design:frontend-design`, `impeccable` |
| Polish / audit a finished page | `impeccable`, `baseline-ui`, `improve-ui`, `web-design-guidelines` |
| Add scroll / text / hover animation | `animate`, `emil-design-eng`, GSAP + Lenis |
| Check animation is smooth | `animation-performance`, `fixing-motion-performance` |
| Add polished components | Kokonut UI, shadcn (`/shadcn`) |
| Add charts / stats | Bklit UI, `animated-chart` |
| Test the site in a real browser | `playwright-skill`, `ui-test` |
| Fix accessibility / SEO | `fixing-accessibility`, `fixing-metadata` |
| Make video / reel content about the portfolio | motion-graphics-skills pack |

---

## 2. Project stack (already set up)

Location: `d:\IBA\aden\aden-portfolio-website`

- **Astro** (minimal template) with **React** and **Tailwind v4** integrations. React components only run client-side as islands, e.g. `<Comp client:load />`.
- **shadcn/ui** initialised (`components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `@/*` alias).
- **Registries registered:** `@kokonutui`, `@bklit`.
- **shadcn MCP server** configured in `.mcp.json`.
- **Installed npm libraries:**

| Package | Use |
|---|---|
| `gsap` | Core animation. Includes ScrollTrigger (scroll animation), SplitText (text reveals), MorphSVG (shape morphing). Free for commercial use. |
| `lenis` | Smooth scrolling that makes the page feel premium. |
| `motion` | Motion (formerly Framer Motion): vanilla `animate/scroll/inView`, and `motion/react` for React islands. |
| `lottie-web` | Play Lottie vector animations (speed lines, bursts). |
| `@rive-app/canvas` | Interactive 2D character animation (e.g. avatar that blinks or follows the cursor). |
| `@tsparticles/engine`, `@tsparticles/slim` | Particle effects (energy around orbs). |
| `three` + `@types/three` | 3D / WebGL scenes (orbs, shockwave). |
| `postprocessing` | Bloom, glow, chromatic aberration for Three.js. |
| `@pixiv/three-vrm` | Load VRM (VRoid) 3D anime avatars into Three.js. |

Not installed (needs extra setup): React Three Fiber + drei; Spline; Mixamo and VRoid Studio (external apps whose exported files go in `public/`); Netlify Forms (deployment-time).

Dev server (per `AGENTS.md`): `astro dev --background`, then `astro dev status | logs | stop`.

---

## 3. Plugins (Superpowers and frontend-design)

### Superpowers (v7.0.1)
A workflow framework: it makes Claude plan, test and verify instead of jumping into code.

| Skill | What it does |
|---|---|
| `superpowers:brainstorming` | Required before creative work. Asks clarifying questions and produces a design plan. |
| `superpowers:writing-plans` | Turns a spec into a multi-step implementation plan before touching code. |
| `superpowers:executing-plans` | Runs a plan inline in the current session. |
| `superpowers:subagent-driven-development` | Executes independent plan tasks via subagents. |
| `superpowers:dispatching-parallel-agents` | Splits 2+ independent tasks across parallel agents. |
| `superpowers:test-driven-development` | Write tests first, then implementation. |
| `superpowers:systematic-debugging` | Root-cause approach to bugs and failures before proposing fixes. |
| `superpowers:verification-before-completion` | Must run checks and show evidence before claiming work is done. |
| `superpowers:requesting-code-review` / `receiving-code-review` | Ask for review when finishing work; evaluate feedback critically rather than blindly applying it. |
| `superpowers:using-git-worktrees` | Isolated workspace for feature work. |
| `superpowers:finishing-a-development-branch` | Decide how to merge/PR once work is done. |
| `superpowers:writing-skills` | Create and test new skills. |
| `superpowers:using-superpowers` | Bootstrap: how to find and use skills. |
| `superpowers:diagnosing-superpowers` | Diagnose why a session went wrong; build a bug report. |

### frontend-design (v1.1.1)
`frontend-design:frontend-design` — guidance for distinctive, intentional visual design: aesthetic direction, typography, avoiding templated defaults. Feed it the design plan and wireframes.

---

## 4. Design and UI skills

### Impeccable (`pbakaus/impeccable`)
`impeccable` — one skill covering design, redesign, critique, audit, polish, simplify, harden, animate and copy for any frontend. Detects "AI slop" (purple gradients, centered cards) and anti-patterns. Best for audits and final polish passes.

### UI UX Pro Max (`nextlevelbuilder/ui-ux-pro-max-skill`)
| Skill | What it does |
|---|---|
| `ui-ux-pro-max` | Searchable design data: ~50 active UI styles, 192 palettes, 74 font pairings, 119 UX guidelines, 22 stacks. Good for choosing a style/palette/type pairing fast. |
| `ui-styling` | shadcn/ui + Tailwind styling, themes, dark mode, accessible components. |
| `design-system` | Token architecture (primitive → semantic → component), spacing/type scales. |
| `design` | Umbrella: brand identity, logos, icons, banners, social images. |
| `brand` | Brand voice, visual identity, style guides. |
| `banner-design` | Banners for social, ads, hero images. |
| `slides` | HTML presentations with Chart.js. |

### ibelick UI Skills (`ibelick/ui-skills`)
| Skill | What it does |
|---|---|
| `baseline-ui` | Fast cleanup: spacing, hierarchy, typography, small layout issues. |
| `improve-ui` | Read-only audit against the product's own design; writes plans for another agent to implement. |
| `fixing-accessibility` | Fixes ARIA, keyboard nav, focus, contrast, form errors (WCAG). |
| `fixing-metadata` | Titles, meta descriptions, Open Graph, Twitter cards, canonical URLs, JSON-LD. Do this before launch. |
| `fixing-motion-performance` | Fixes janky animations (layout thrash, compositor properties, blur cost). |
| `create-design-md` | Writes a `DESIGN.md` documenting the design language for coding agents. |
| `create-canvas` / `component-canvas` | Interactive canvases to explore and compare ideas or component variants. |
| `ui-skills-root` | Picks the smallest useful UI-skills context before UI work. |

### Interface Design (`Dammyjay93/interface-design`)
`interface-design` — craft-first design for dashboards, admin panels, SaaS and tools. Not for marketing or landing pages, so use it only if the portfolio gets an app-like section.

### Web Design Guidelines (`vercel-labs/agent-skills`)
| Skill | What it does |
|---|---|
| `web-design-guidelines` | Reviews UI code against Web Interface Guidelines (accessibility, UX, performance). |
| `vercel-react-best-practices` | React/Next.js performance patterns. |
| `vercel-composition-patterns` | Scalable React component APIs (compound components, etc.). |
| `vercel-react-view-transitions` | Page/route transitions and shared-element animation with React's View Transition API. |
| `deploy-to-vercel`, `vercel-cli-with-tokens`, `vercel-optimize` | Deploying to Vercel and tuning cost/performance. |
| `vercel-react-native-skills` | React Native / Expo (not needed here). |
| `writing-guidelines` | Review docs/prose for style and tone. |

### shadcn (`shadcn/ui`)
- `shadcn` — add, search, debug, style and compose shadcn components; works with the `components.json` already in the project.
- `migrate-radix-to-base` — migrate from Radix to Base UI.
- MCP tools (`mcp__shadcn__*`) let Claude search and view registry items (including Kokonut and Bklit) and get exact add commands.

---

## 5. Animation and motion skills

### Emil Kowalski (`emilkowalski/skill`)
| Skill | What it does |
|---|---|
| `emil-design-eng` | Philosophy for UI polish and invisible details that make software feel great. |
| `animate` | Builds an animation from scratch, deciding in order: whether to animate, why, tool, properties, curve, interruption. Start here. |
| `animation-performance` | Keeps animations in the frame budget (composite-only properties, `will-change`, CSS vs WAAPI vs JS). |
| `animation-vocabulary` | Turns "the bouncy thing when a popover opens" into the exact term. |
| `apple-design` | Apple-style fluid, physical motion, springs, gestures, materials. |
| `find-animation-opportunities` | Read-only: finds places that should animate and proposes values. |
| `improve-animations` | Audits a codebase's motion and writes a prioritised plan. |
| `review-animations` / `remove-animations` | Review motion, or strip animation that has no purpose (not all of these were in the install list, so check `/`). |
| `ask-sonner` | Guide to the Sonner toast library. |
| `break-ui` | Stress-test UI with worst-case data (long names, empty, huge). |
| `mobile-native` | CSS and meta fixes so a web app feels native on phones. |
| `animate-expo` | Animation for React Native / Expo (not needed here). |
| `write-swift` | Modern Swift guidance (not needed here). |

### Motion Graphics Skills (`charlie947/motion-graphics-skills`)
Code-built videos, GIFs and loops for social posts. Not for the website itself.

| Skill | Output |
|---|---|
| `brand-intake` | Setup step: interview → `brand.md` and `MOTION.md`. Run first. |
| `motion-brief-writer`, `motion-prompt-writer`, `reference-to-motion` | Turn ideas or reference videos into precise build prompts. |
| `motion-effects` | 16 premium looping effects (chart morph, masked type, particle logo, etc.), exportable to MP4/GIF. |
| `animated-chart` | Looping animated chart for LinkedIn or newsletters. |
| `milestone-reveal` | 12-second particle number reveal (followers, revenue). |
| `launch-video` | 30–45 second product launch video. |
| `apple-launch-film` | Apple-keynote-style Mac UI film. |
| `title-sequence-3d` | Cinematic Three.js title sequence. |
| `vox-explainer` | Vox-style documentary explainer. |
| `newsletter-promo`, `loop-cover` | Newsletter promo clip; looping GIF cover. |
| `reel-export` | Convert any video to a 1080×1920 Reel/TikTok. |
| `model-showdown` | Side-by-side comparison of three AI models on one brief. |

### Motion AI Kit (motion.dev) — NOT YET INSTALLED
`npx motion-ai` is interactive, so run it yourself in a terminal: choose global, then Claude Code. It adds the `/motion` skill and a free MCP server for current Motion docs and examples. Motion+ (paid) adds spring generation, MotionScore audits and premium source via `npx motion-ai --plus`.

---

## 6. Browser automation and testing

| Skill | What it does |
|---|---|
| `playwright-skill` | Writes and runs Playwright scripts: screenshots, responsive checks, link checks, form flows. Visible browser by default. Run `npm run setup` (done). |
| `playwright-expert` | Writing proper Playwright E2E test suites and fixing flaky tests. |
| `ui-test` | Adversarial UI testing from git diffs or full-app exploration (uses the `browse` CLI). |
| Playwright plugin (MCP) | Direct browser tools (navigate, click, snapshot, screenshot) inside Claude. |

### Browserbase skills (`browserbase/skills`)
Need the `browse` CLI (not installed); remote features need a Browserbase API key.

| Skill | What it does |
|---|---|
| `browser` | Browser automation by CLI; remote sessions with CAPTCHA solving and proxies. |
| `fetch` / `search` | Fetch a URL or search the web without a browser session. |
| `browser-trace`, `browser-to-api` | Capture DevTools traces; turn site traffic into an OpenAPI spec. |
| `autobrowse` | Self-improving browser automation loop. |
| `cookie-sync` | Reuse your local Chrome logins in remote sessions. |
| `functions` | Deploy browser automation as cloud functions. |
| `safe-browser` | Agents restricted to an allowlist of domains. |
| `webmcp-gen`, `add-webmcp` | Expose a site's features as WebMCP tools. |
| `browser-use-to-stagehand`, `optimize-agent-prompt` | Migration and prompt-tuning for browser agents. |
| `agent-experience` | Audit how agent-friendly a product or docs site is. |
| `company-research`, `competitor-analysis`, `event-prospecting` | Sales and market research reports. Not relevant to the portfolio. |

---

## 7. General engineering skills (`jeffallan/claude-skills`, 67 skills)

Installed in bulk. Relevant ones for this project are bold.

| Group | Skills |
|---|---|
| **Frontend** | **`react-expert`, `typescript-pro`, `javascript-pro`**, `nextjs-developer`, `vue-expert`, `vue-expert-js`, `angular-architect` |
| **Quality** | **`code-reviewer`, `test-master`, `debugging-wizard`, `security-reviewer`, `secure-code-guardian`**, `the-fool` (devil's advocate) |
| **Planning and docs** | **`feature-forge`** (requirements and specs), `architecture-designer`, `api-designer`, `code-documenter`, `spec-miner` |
| Backend / data | `fastapi-expert`, `django-expert`, `nestjs-expert`, `laravel-specialist`, `rails-expert`, `spring-boot-engineer`, `java-architect`, `csharp-developer`, `dotnet-core-expert`, `golang-pro`, `rust-engineer`, `cpp-pro`, `python-pro`, `php-pro`, `postgres-pro`, `sql-pro`, `database-optimizer`, `pandas-pro`, `graphql-architect`, `websocket-engineer` |
| Infra / ops | `devops-engineer`, `kubernetes-specialist`, `terraform-engineer`, `cloud-architect`, `monitoring-expert`, `sre-engineer`, `chaos-engineer`, `microservices-architect`, `legacy-modernizer`, `cli-developer` |
| AI / ML | `prompt-engineer`, `rag-architect`, `ml-pipeline`, `fine-tuning-expert`, `mcp-developer`, `spark-engineer` |
| Other platforms | `flutter-expert`, `react-native-expert`, `swift-expert`, `kotlin-specialist`, `embedded-systems`, `game-developer`, `shopify-expert`, `wordpress-pro`, `salesforce-developer`, `atlassian-mcp`, `django-storages-s3` |

Tip: for this Astro site only the bolded rows matter. The rest add description clutter and can be uninstalled from `~/.claude/skills/`.

---

## 8. Writing

`no-ai-slop` (`petergyang/no-ai-slop`) — edits text to remove 20+ AI-writing patterns ("It's not X, it's Y", "Here's the thing", importance puffery) while keeping your voice. Use `/no-ai-slop <text>` to edit, or `/no-ai-slop is this slop? <text>` to only detect. Good for the About page and project descriptions.

---

## 9. Built-in Anthropic skills and connectors

`anthropic-skills:` `docx`, `pdf`, `pptx`, `xlsx` (create and edit Office files), `deep-research`, `find-skills`, `skill-creator`, `humanizer`, `google-workspace`, `import-memory`, `computer-use`, `chrome-browser`, `built-in-browser`. Also `claude-api` (Claude SDK help), `code-review`, `simplify`, `security-review`, `run`, `init`, `loop`, `schedule` and `update-config`.

Gmail, Google Calendar and Google Drive connectors need authorising in your claude.ai connector settings before they work.

---

## 10. Component libraries and reference links

| Link | What it is | Use for | Status |
|---|---|---|---|
| [kokonutui.com](https://kokonutui.com/) | Free shadcn registry of animated React components (Tailwind + Motion). | Hero effects, buttons, cards, text effects. | Registered. Install with `npx shadcn@latest add @kokonutui/<name>`, e.g. `particle-button`. |
| [bklit.com](https://bklit.com/) | Bklit UI: 200+ chart components (area, bar, heatmap, sankey, sparkline...). | Skills-radar, stats, GitHub-activity style charts. | Registered. `npx shadcn@latest add @bklit/area-chart`. |
| [motion.dev](https://motion.dev/) | Motion animation library plus AI Kit. | Scroll, layout and hover animation. | Library installed; AI Kit pending (section 5). |
| [github.com/charlie947/motion-graphics-skills](https://github.com/charlie947/motion-graphics-skills) | 15 motion-video skills. | Social content about your work. | Installed. |
| [github.com/jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | 67 engineering skills. | General dev work. | Installed. |
| [github.com/Dammyjay93/interface-design](https://github.com/Dammyjay93/interface-design) | Dashboard-focused design skill. | App-like UI only. | Installed. |
| [github.com/lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) | Playwright automation. | Test and screenshot the site. | Installed + Chromium. |
| [github.com/browserbase/skills](https://github.com/browserbase/skills) | Browserbase automation suite. | Remote browsing, research. | Installed; CLI/key not set up. |
| [github.com/petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) | Writing editor. | Portfolio copy. | Installed. |
| [github.com/obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace) | Superpowers plugin. | Workflow discipline. | Installed. |
| [bareminimum.design](https://bareminimum.design/) | Wireframe generator (Gemini also works). | Wireframes before design. | External tool, not installed. |
| [Anthropic cookbook: prompting for frontend aesthetics](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb) | Notebook on getting non-generic UI from Claude. | Writing the design prompt. | Reading, not installed. |
| [docs.astro.build](https://docs.astro.build) | Astro docs. | Routing, islands, styling. | Reference. |

Library-list links from your notes (all free): GSAP, Lenis, Lottie/LottieFiles, Rive, tsParticles, Three.js, React Three Fiber + drei, postprocessing, VRoid Studio + three-vrm, Mixamo, Spline. Recommended stack: Astro + GSAP + Three.js, deployed to Netlify or GitHub Pages.

---

## 11. Suggested workflow for building the portfolio

1. Read the Anthropic frontend-aesthetics cookbook notebook; write a detailed design prompt.
2. Generate wireframes (bareminimum.design or Gemini). Wireframes only, not mockups.
3. Run `superpowers:brainstorming` with the prompt and wireframes; answer its questions to get a design plan.
4. Run `frontend-design:frontend-design` with the plan and wireframes to build.
5. Add components from Kokonut UI / Bklit; animation with GSAP, Lenis, Motion.
6. Polish with `impeccable`, `baseline-ui`, `animation-performance`.
7. Test with `playwright-skill` / `ui-test`; fix with `fixing-accessibility` and `fixing-metadata`.
8. Edit copy with `no-ai-slop`; run `superpowers:verification-before-completion`; deploy (Netlify, GitHub Pages or `deploy-to-vercel`).
