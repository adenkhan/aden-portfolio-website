# Motion System — Aden Khan Portfolio

Inputs: `DESIGN.md`, `docs/01-brief.md`, `docs/00-design-plan.md` section 4, `CLAUDE.md`. Written 2026-11-02.

Rule from the brief: loud in two places (the intro collision and the CV burst), restrained everywhere else. Every moment below went through the `animate` decision order: frequency gate, purpose, tool, properties, curve and duration, interruption and exit, reduced motion. A moment with no purpose was cut, and the cuts are listed with reasons in section 3.

Your constraints (intro limits, library ownership, transform and opacity, `gsap.matchMedia()`, 150 KB) override the "cheapest tool" default in `animate`. Where the cheaper tool also satisfies them, I used it (CSS hover, CSS scroll-snap, native view transitions).

## 1. Foundations

### Tokens (extend `DESIGN.md`, do not fork)
```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* default: entering, exiting, feedback */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* on-screen movement */
--duration-press: 160ms;   --duration-hover: 150ms;
--duration-ui: 220ms;      --duration-reveal: 600ms;
--duration-intro: 2600ms;
```
In GSAP, register the same curves once with CustomEase: `CustomEase.create("ui-out", "0.23,1,0.32,1")` and `CustomEase.create("ui-in-out", "0.77,0,0.175,1")`. Never use `ease-in` on UI, never `transition: all`, never `scale(0)` (start from 0.95 with opacity 0).

### Three capability tiers
Decided once at load and stored on `<html data-motion="...">`:

| Tier | When | What runs |
|---|---|---|
| `full` | `prefers-reduced-motion: no-preference`, desktop pointer, ≥ 8 GB or unknown memory, not save-data | Everything below |
| `lite` | no-preference but touch device, or `hardwareConcurrency ≤ 4`, or `deviceMemory ≤ 4`, or `saveData` | GSAP scroll moments; intro and CV burst use the 2D version (no Three.js); no particles |
| `reduced` | `prefers-reduced-motion: reduce` | No intro, no parallax, no movement. Content at final state. Opacity or colour changes under 200 ms only where they aid comprehension |

All GSAP setup lives inside `gsap.matchMedia()`:
```js
const mm = gsap.matchMedia();
mm.add({ ok: "(prefers-reduced-motion: no-preference)", fine: "(hover: hover) and (pointer: fine)", wide: "(min-width: 768px)" },
  (ctx) => { const { ok, fine, wide } = ctx.conditions; if (!ok) return; /* register moments here */ });
```
`matchMedia` reverts all tweens and ScrollTriggers when a condition flips, so a user toggling reduced motion mid-session gets the static version without a reload.

### Scroll plumbing (not a "moment")
- Lenis owns smooth scroll. GSAP's ticker drives it, and it feeds ScrollTrigger:
```js
const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, syncTouch: false, autoRaf: false, anchors: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
- Lenis is created only inside the `ok` condition, so reduced-motion users get native scroll. Touch keeps native scroll (`syncTouch: false`).
- `lenis.stop()` while the intro overlay or a dialog is open; `lenis.start()` after. The gallery and dialogs carry `data-lenis-prevent` so nested scroll stays native.
- Because pages are separate documents (section 2, moment 8), Lenis and ScrollTrigger are created fresh on each page load and need no teardown logic.

### Library ownership
| Library | Owns | Never used for |
|---|---|---|
| GSAP (+ ScrollTrigger, SplitText, ScrambleText, CustomEase) | all timelines, scroll triggers, text effects, count-ups, connector drawing, dialog open/close | hover and focus |
| Lenis | smooth scroll | any visual animation |
| Motion (`motion/react`) | small interactions inside React islands (Kokonut components) via `LazyMotion` + `domAnimation` | page-level timelines |
| CSS | hover, focus, press, scroll-snap, view transitions, cursor blink | anything needing sequencing |
| Three.js + postprocessing | intro shockwave and CV burst only, as an enhancement on `full` tier over the 2D baseline (see "Build order" in moment 1) | anything else |
| tsParticles slim | hero ambient particles only; stretch goal (moment 7a) | any other page or effect |
| lottie-web | not used (cut in p07: no burst asset exists, and the 2D ring already covers the fallback) | — |
| Rive | not used. There is no `.riv` file in `src/assets`; revisit only if one is added | — |

## 2. Moments

Format per moment: gate and purpose, trigger, owner, properties, timing and curve, interruption, reduced motion, mobile, cost.

### 1. Intro on Home: orb collision into a purple shockwave — KEEP
- **Gate and purpose:** rare tier (once per session), so the delight budget applies. Purpose: explanation. It shows the Creative × Data = Growth idea in 2.6 s before the reader meets the copy.
- **Trigger:** first Home load in a browser session, `full` or `lite` tier only. A tiny inline script in `<head>` runs before first paint: it reads `sessionStorage["ak.intro"]`; if absent and not reduced-motion it sets the flag immediately (so a reload mid-intro does not replay) and adds `html.intro`. If storage throws (private mode), the intro does not play. CSS shows the overlay only under `html.intro`, so no-JS visitors never see it. The same inline script attaches an Esc listener, so Esc works before the main bundle loads. A `pageshow` handler with `event.persisted` removes the overlay after a back/forward restore.
- **Owner:** GSAP timeline. Three.js + postprocessing render the orbs and shockwave on one canvas inside the overlay. The overlay is a fixed full-viewport `bg-void` div, with a Skip button in the HTML (top right, 44 px target, text "Skip intro") visible from the first paint and first in tab order.
- **Build order (p07):** the 2D version (two radial-gradient orb elements and a CSS ring, transform and opacity only) is built first and is the intro for every tier. The Three.js scene is an enhancement for `full` tier, added only after the 2D version passes, and kept only if Home still meets the p17 budgets. If time runs out, the 2D version ships for everyone.
- **LCP:** the hero is real HTML and renders underneath from the first paint. The overlay is a plain background colour and a `<canvas>`, neither of which is an LCP candidate. The three chunk is fetched with `fetchpriority="low"` only when `html.intro` is set. Hero hidden states (H1 words, subhead, buttons) are applied only after the first paint (double `requestAnimationFrame`), while the overlay covers them, so the first paint always contains the real text. The avatar is the LCP image, so it is never faded from opacity 0; it animates with transform only. I have not measured this; verify LCP in the Lighthouse pass.
- **Choreography** (t = ms from when motion starts; the clock starts when the 3D scene is ready, or at 600 ms after DOM ready if it is not, in which case the 2D fallback runs):

| t | What happens | Properties and curve |
|---|---|---|
| 0–120 | Overlay is solid. Orbs sit off-screen. Anticipation: each orb pulls back 24 px away from centre | transform, 120 ms `ui-out` |
| 120–1000 | Red orb from the left, blue orb from the right, converge on centre | transform, 880 ms `ui-in-out`; orb glow intensity ramps 0.3 → 1 |
| 1000–1160 | Collision. The orbs merge into a purple core; bloom spikes | bloom 0 → 1 in 160 ms `ui-out`, then settles to 0.4 over 400 ms |
| 1000–1700 | Shockwave ring expands from centre; chromatic aberration spikes then relaxes (full tier, desktop only) | ring scale 0.1 → 3.2 over 700 ms `ui-out`; aberration 0.004 → 0 over 400 ms |
| 1150–1600 | Overlay fades out; `pointer-events: none` from 1150 ms so the hero is usable immediately | opacity 1 → 0, 450 ms `ui-out` |
| 1300–2300 | Hero assembles under the shockwave: H1 masked word rise (moment 3), avatar card scale 0.96 → 1 (transform only, opacity stays 1), subhead and buttons fade-rise 12 px, stats strip stagger 60 ms | transform + opacity, 500–700 ms `ui-out` |
| 2300–2600 | Count-ups finish (moment 5); overlay node removed from the DOM; focus moves to `<main>` (`preventScroll`) | — |

- **Interruption:** the Skip button or Esc runs `tl.timeScale(10)` on the overlay portion and sets all hero elements to their final state, then removes the overlay within 150 ms. Scroll and wheel input are ignored (Lenis is stopped), so the user cannot scroll under the overlay. Nothing else skips it, so a stray click does not.
- **Reduced motion:** never plays. No overlay, no flag write needed.
- **Mobile (`lite`):** no Three.js. The 2D version runs, duration 2.0 s. If the 3D enhancement ships, `full` mobile-class devices (rare) cap DPR at 1.5, drop chromatic aberration and use half-resolution bloom.
- **Cost:** the 2D version is a few KB of our own code in the Home bundle. The optional 3D enhancement is a lazy chunk of tree-shaken Three.js + postprocessing (est. 120–170 KB gzip; measure), outside the first-load budget, and the hero never waits for it.

### 2. CV reveal: mini burst, then the dialog — KEEP
- **Gate and purpose:** user-initiated, once or twice per visit. Purpose: feedback and delight. It is the only other place purple "growth" appears as an event, and it confirms the click.
- **Trigger:** click on the primary Download CV button (nav button and hero button). `pointerenter` and `focus` on the button prefetch the 3D chunk (intent prefetch).
- **Owner:** CSS for the press; GSAP for the sequence; the 2D ring and core from the intro module on every tier; Three.js on `full` only if the intro's 3D enhancement shipped.
- **Sequence:**

| t | What happens | Properties and curve |
|---|---|---|
| 0 | Press feedback | `scale(0.97)`, 160 ms `ease-out` (CSS `:active`) |
| 0–600 | Burst at the button's position: a small ring and purple core, about 35% of the intro's size | ring scale 0.1 → 1.6, 600 ms `ui-out`; bloom pulse |
| 380 | The dialog opens (it does not wait for the burst to finish) | native `<dialog>.showModal()`; opacity 0 → 1 and `scale(0.96)` → 1, 220 ms `ui-out`; modal stays centred |

- **Dialog:** a native `<dialog>` element, so focus trap and Esc come free. It holds the CV link (PDF slot from `src/data/assets.ts`) and a LinkedIn link. Close: 140 ms `ui-out` (exit faster than enter). The scrim is `bg-void` at 80% and fades with the dialog.
- **Interruption:** an `isPlaying` guard means a double click plays one burst. Esc or the scrim click closes the dialog at any time; the burst, if still running, finishes behind it.
- **Reduced motion:** no burst. The dialog opens with a 150 ms opacity fade and no scale.
- **Mobile:** the 2D burst, same timing. If the 3D chunk has not loaded within 150 ms of the click on `full`, play the 2D burst; never delay the dialog.
- **Cost:** the 2D burst reuses the intro's 2D module. The 3D version (if shipped) reuses the intro's Three module when loaded; otherwise the chunk is prefetched on intent.

### 3. Headline reveals — MERGE and TRIM (changed in p10, see §7)
- **Gate and purpose:** the Home H1 is seen once per session, with the intro. Purpose: preventing a jarring change (text appearing while the overlay lifts). Other pages' H1s fail the purpose test, so they stay static.
- **What changed from the plan:** "type-in with glitch" is cut. The brief lists typewriter text that blocks reading and a glitch on every heading as cringe. The reveal is a masked word rise, and ScrambleText is used once on the small HUD status line.
- **Trigger:** only inside the intro timeline (Home, first view per session, `full` or `lite`). On every other load the H1 is plain static HTML.
- **Owner:** GSAP + SplitText (`type: "lines,words"`, `mask: "lines"`, `aria: "auto"` so the full text stays accessible). Initial hidden state is set by script only after the first paint and only while the overlay is up, so the H1 is never hidden in the HTML, no-JS users read it, and the LCP paint contains it.
- **Properties and timing:** words `yPercent: 110 → 0`, stagger 50 ms, 700 ms `ui-out`, starting at t = 1300 ms. The HUD status line "// PLAYER 01 · PRODUCT MARKETER · KARACHI" uses ScrambleText: `chars: "01"`, 500 ms, once, then holds.
- **Interruption:** Skip sets the final state instantly. SplitText `revert()` runs on `matchMedia` revert so the DOM returns to plain text.
- **Reduced motion and mobile:** static text. `lite` keeps the word rise but with a 40 ms stagger and a 450 ms duration.
- **Cost:** SplitText and ScrambleText (est. 6 KB and 3 KB gzip), loaded on Home only.

### 4. About: manga panels assembling on scroll — KEEP
- **Gate and purpose:** occasional, once per page view. Purpose: spatial consistency and sequence. The four arcs are a real order (Storyteller → Growth → Go-to-market → Builder), so a staggered entrance reinforces the reading order.
- **Trigger:** ScrollTrigger batch, `start: "top 85%"`, `once: true`. Panels in the same row enter together; later rows enter as they scroll in.
- **Owner:** GSAP ScrollTrigger `batch()`.
- **Properties and timing:** panel `opacity 0 → 1`, `translateY 24px → 0`, and `clip-path: inset(0 0 14% 0) → inset(0)`, 600 ms `ui-out`, stagger 90 ms. The panel's lane-colour top edge draws left to right (`scaleX 0 → 1`, `transform-origin: left`, 500 ms, delayed 150 ms). The halftone corner fades in (opacity, 200 ms delay).
- **Interruption:** `once: true`, no reverse, so fast scrolling never leaves panels half hidden. Anything already above the trigger on load is set to its final state.
- **Reduced motion:** all panels at final state, no movement.
- **Mobile:** opacity + `translateY 16px` only (no clip-path), 450 ms, panels animate one by one as they scroll in.
- **Cost:** ScrollTrigger only (already in the base bundle). No extra library.

### 5. Work: count-ups, card entrances, skills tree, gallery — SPLIT

**5a. Stat count-ups — KEEP, but on Home only.** The design plan placed them on Work, but the Work results are numbers inside sentences ("cut customer acquisition cost by 72%"), and reading text should not move. The four-number strip on Home is the place.
- **Gate and purpose:** first Home view per session (same flag as the intro). Purpose: state indication, the numbers settling draws the eye to the proof.
- **Trigger:** ScrollTrigger `start: "top 90%"`, `once: true`; inside the intro timeline at t = 1500 ms when the intro plays.
- **Owner:** GSAP, tweening a number and writing `textContent` on an `aria-hidden` span. A visually hidden span always holds the final value, so screen readers and no-JS users get the real number.
- **Properties and timing:** the numeric part only; the sign, `$` and `+` are static. 900 ms `ui-out` (`power3.out` equivalent). Tabular numerals plus a `min-width` in `ch` sized to the final value prevent layout shift.
- **Reduced motion and returning visits:** final numbers shown immediately.
- **Mobile:** same, 700 ms.

**5b. Mission-card entrances — CUT.** Nine identical cards fading up is the generic entrance the brief warns against, and it adds delay to scanning the proof. Cards are static. Hover (CSS only, gated by `(hover: hover) and (pointer: fine)`): border `line` → `line-strong` and title colour to the lane colour, 150 ms `ease`.

**5c. Skills-tree branches drawing in — KEEP.**
- **Gate and purpose:** once per page view. Purpose: explanation. The tree shows that four lanes branch from one trunk.
- **Trigger:** ScrollTrigger `start: "top 70%"`, `once: true`.
- **Owner:** GSAP timeline animating `transform` on connector elements (one implementation for every width; DrawSVG cut in p07).
- **Structure:** the tree is HTML, not SVG: a trunk line, then four lanes (four columns at ≥ 1024px, two at ≥ 768px, one stacked below). Each connector is a 2px element whose length comes from layout, so it never breaks on reflow.
- **Sequence:** trunk grows (`scaleX` or `scaleY` from 0 to 1 with the origin at the trunk start) 500 ms `ui-out`; four lane connectors grow 400 ms each, stagger 100 ms, each in its lane colour; then the skill chips appear (`opacity` + `scale 0.96 → 1`), stagger 25 ms. Total about 1.3 s, acceptable because it is explanatory and rare.
- **Interruption:** `once`, no reverse.
- **Reduced motion:** fully drawn, chips visible.
- **Cost:** no extra plugin.

**5d. Horizontal creative gallery — KEEP as CSS, no JS motion.** A pinned horizontal scroll would hijack vertical scrolling, which is hostile on phones and for keyboard users. Use native `overflow-x: auto` with `scroll-snap-type: x proximity` and `scroll-padding`. The strip is focusable (`tabindex="0"`, labelled) and has small previous/next buttons that call `scrollBy({ behavior: "smooth" })` (`auto` under reduced motion). It carries `data-lenis-prevent`. Properties animated by JS: none. Cost: zero JS animation.

### 6. Contact: terminal typing — TRIM
- **Gate and purpose:** rare page. The real contact details (email, LinkedIn, GitHub, CV) are the page's whole job, so they must never be typed out or delayed. Purpose of any motion here is theme only, so it is limited to a decorative prompt line.
- **Effect:** the prompt line "$ open --channel" in the terminal panel is scrambled in (GSAP ScrambleText, 500 ms, once). It is `aria-hidden`. The cursor after it blinks three times (CSS `steps(1)` keyframes, `animation-iteration-count: 3`) then stops, so nothing loops beside the contact details.
- **Trigger:** page load, `full` and `lite`. Reduced motion: static prompt and no blink.
- **Cost:** reuses ScrambleText.

### 7. Ambient — MERGE and CUT
**7a. Particles — BUILT in p10 at the owner's request (see §7).** Previously: Built only after p17 passes with budget headroom on Home; otherwise not built. It is pure decoration with a continuous main-thread cost and an extra dependency.
- **Gate and purpose:** constantly visible, so it must be nearly imperceptible. Purpose: atmosphere behind the avatar only; if it cannot be subtle it is cut.
- **Scope:** Home hero only, behind the character-select card. 28 particles, drifting slowly, 25–50% opacity, red and blue (purple where they overlap), no links, `fpsLimit: 30`.
- **Gating:** `full` tier only. Loaded with `requestIdleCallback` after the intro ends (or after load when there is no intro). Paused when the hero leaves the viewport (IntersectionObserver) and when the tab is hidden.
- **Owner and cost:** tsParticles slim on a `<canvas>`. It draws without touching layout, but it does run on the main thread with rAF, which is why it is capped, paused and lazy. Outside the first-load budget; measure its chunk.
- **Reduced motion and mobile:** not created.

**7b. Cursor glow — REINSTATED in p10 as the avatar-card pointer light (see §7).** Previously cut: A page-wide glow has no purpose, and the narrowed avatar-card version contradicted `DESIGN.md`, which allows glow only on the orb, the CV burst and the focus ring. It added code and testing for decoration alone.

**7c. Hover and focus micro-interactions — CSS only.** All transitions list their properties and sit behind `@media (hover: hover) and (pointer: fine)` for hover:
- Press: `transform: scale(0.97)`, 160 ms `ease-out`, on `:active` for every button.
- Hover colour or border: 150 ms `ease`.
- Nav link underline: `scaleX 0 → 1`, `transform-origin: left`, 180 ms `ui-out`.
- Focus ring: appears instantly, no transition.
Hover is "tens of times a day" frequency, so it stays small and fast.

### 8. Page-to-page transitions — KEEP, native CSS
- **Gate and purpose:** occasional. Purpose: preventing a jarring change between four separate pages.
- **Tool:** cross-document View Transitions (`@view-transition { navigation: auto; }`), with no JavaScript. This keeps `/`, `/about`, `/work` and `/contact` as real separate documents, as `CLAUDE.md` requires, and avoids shipping Astro's client router. Browsers without support navigate instantly, which is the correct fallback.
- **Effect:** a crossfade. Old page `opacity 1 → 0` in 100 ms, new page `0 → 1` in 180 ms (exit faster than enter), both `ease-out`. The nav carries `view-transition-name: site-nav`, so it stays put and the page content crossfades beneath it.
- **Interaction with the intro:** the intro flag is session-scoped, so navigating back to Home shows the final hero with no intro and no count-up.
- **Reduced motion:** `::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none; }`.
- **Cost:** none in JS. Snapshots use the GPU.

## 3. Cut or changed from the plan
| Candidate | Decision | Reason |
|---|---|---|
| Headline type-in with glitch | Cut | The brief lists typewriter and glitch headings as cringe, and they block reading |
| Mission-card entrances | Cut | Nine identical fade-ups is the generic pattern; slows scanning |
| Work count-ups | Moved to Home | The Work numbers sit inside sentences; Home has the standalone proof strip |
| Typing the contact details | Cut | The contact details are the page's job and must be instant |
| Page-wide cursor glow | Cut, including the avatar-card version (p07) | No purpose; contradicts DESIGN.md's glow rule |
| Site-wide particles | Narrowed to the hero, then made a stretch goal (p07) | Decoration with a continuous main-thread cost |
| Lottie burst | Cut (p07) | No asset exists; the 2D ring covers every tier |
| DrawSVG skills tree | Replaced by transform-scaled connectors (p07) | One implementation for all widths; one fewer plugin |
| Three.js intro and burst | Re-sequenced as an enhancement over the 2D version (p07) | The 2D version must exist anyway; 3D ships only if budgets hold |
| Parallax | Not added | Large movement is excluded for reduced motion and adds no meaning |
| Astro client router | Not used | Native cross-document view transitions do the job with no JS |
| Pinned horizontal gallery scroll | Replaced by scroll-snap | Scroll-jacking hurts phones and keyboard users |
| Rive avatar | Not used | No `.riv` file exists |

## 4. First-load JavaScript budget (target under 150 KB gzip)

All figures are estimates from typical published bundle sizes, not measurements. They exist to show the shape of the budget; `ENGINEERING-PLAN.md` must add a build-time size check that fails the build over the limit.

| Item | Est. gzip | Loaded where |
|---|---|---|
| Astro hydration runtime | ~2 KB | all pages |
| Lenis | ~4 KB | all pages |
| GSAP core | ~27 KB | all pages |
| ScrollTrigger | ~12 KB | all pages |
| CustomEase | ~2 KB | all pages |
| SplitText + ScrambleText | ~9 KB | Home (ScrambleText also Contact) |
| Page code (ours, including the 2D intro on Home) | ~8 KB | per page |
| **Vanilla total** | **~64 KB** | |
| React + react-dom (islands) | ~45–60 KB | only pages that hydrate an island |
| Motion with `LazyMotion` + `domAnimation` | ~15 KB | inside islands only |
| **Worst case with an island** | **~120–140 KB** | still under 150 KB |

Rules that keep it there:
- Home first load has no React island. The nav, avatar card, stats and CV dialog are Astro and vanilla (the dialog is a native `<dialog>`).
- Kokonut and Bklit islands use `client:visible` or `client:idle`, so they are outside first load.
- Excluded from the budget: Three.js + postprocessing only (lazy 3D, as the constraint says). tsParticles, if the stretch goal is built, counts toward the budget even though it loads lazily.
- Import GSAP plugins individually and register only what a page uses.

## 5. Vocabulary (exact names)
Terms from the glossary, with the moment they belong to.
- **Orchestration**: the intro timeline as a whole (moment 1).
- **Anticipation**: the 24 px pull-back before the orbs converge.
- **Reveal**: the masked word rise on the H1, and the panel `clip-path` wipe.
- **Stagger**: hero assembly, manga panels, skill chips.
- **Scroll reveal**: manga panels and the skills tree (triggered once, not scrubbed). This is not a *scroll-driven animation*, which would tie progress to scroll position.
- **Number ticker**: the Home stats count-up, with **tabular numbers**.
- **Line drawing**: the skills-tree connectors growing from the trunk (done with `scale`, not SVG strokes).
- **Press / Tap feedback**: `scale(0.97)` on every button.
- **Hover effect**: card border and nav underline.
- **Crossfade** and **View transition**: page-to-page navigation.
- **Idle animation** (closest to **Float**): the slow drift of the hero particles.
- **Ripple** (closest match): the expanding shockwave ring. The glossary has no exact term for it. *Bloom* and *chromatic aberration* are rendering terms, not motion terms.
- **Typewriter** is used here only for the contact prompt scramble, and ScrambleText has no exact glossary term (nearest is **Text morph**).
- **Reduced motion**, **Frequency of use**, **Purposeful animation**: the principles the cuts in section 3 apply.

## 6. Performance checklist
Run before calling any motion work done.

- [ ] Only `transform` and `opacity` are animated, plus `clip-path` on About panels (the sanctioned fourth). No `width`, `height`, `margin`, `top`, `left` or `box-shadow` in any animation.
- [ ] The avatar (LCP image) is never animated from opacity 0, and hero hidden states are applied only after the first paint.
- [ ] No `transition: all`. Every transition lists its properties.
- [ ] No animated CSS variable on a parent whose children inherit it. Transforms are written directly on the element.
- [ ] No React state updates per frame. Pointer and scroll handlers write to refs or use `quickTo`.
- [ ] Every scroll moment is `once: true` or reverts under `matchMedia`; no ScrollTrigger is left behind on teardown.
- [ ] Lenis is driven by `gsap.ticker`, with `lagSmoothing(0)`, and `lenis.on("scroll", ScrollTrigger.update)` is set.
- [ ] `will-change` is not set anywhere by default. Add it only to a specific element once a 1 px shift or dropped frames are observed.
- [ ] Animated blur and bloom stay under 20 px equivalent; the orb layer is a small, pre-rendered element rather than a full-screen blur.
- [ ] The 2D intro works on every tier on its own. If the 3D enhancement ships, its chunk is lazy, low priority, and falls back to the 2D version after 600 ms.
- [ ] LCP is not delayed by the intro. Verify in Lighthouse and in DevTools Performance with the overlay present.
- [ ] No layout shift from count-ups (tabular numerals, reserved width) or from the overlay removal.
- [ ] If the particles stretch goal ships: they pause when the hero is off-screen or the tab is hidden, are not created on `lite` or `reduced`, and count toward the JS budget.
- [ ] First-load JS is under 150 KB gzip, checked by the build, not estimated.
- [ ] Recorded on a real mid-range Android phone over remote debugging at 4× CPU throttle: the intro (or its fallback), a scroll through About, and the CV reveal hold 60 fps, with the Performance panel showing no long tasks over 50 ms during the animation.
- [ ] `prefers-reduced-motion: reduce` checked: no intro, no overlay, no movement, view transitions off, Lenis not created.
- [ ] Page works with JavaScript disabled: all text and links visible and usable.
- [ ] Slowed-down review (2–5× duration in the animation inspector) and a second look the next day, for the intro and the CV burst.

## 7. Changes in p10 (global motion layer)

The owner's p10 prompt asked for headline reveals on all four H1s, ambient particles and a cursor glow. Those override the earlier cuts above; everything else in this file stands.

**Headline reveal on every page.** `data-reveal="headline"` on the H1 of Home, About, Work and Contact (404 and Thanks stay static).
- Trigger: every page load, `full` and `lite` tiers. Not session-gated yet; p11 folds the Home reveal into the intro.
- Hide-before-animate: an inline `<head>` script adds `html.motion-pending` (CSS: `visibility: hidden` on reveal targets) only when motion is allowed, and removes it after 2.5 s if the motion bundle never runs. No JavaScript, reduced motion or a failed bundle all leave the text visible.
- Motion: SplitText `type: "lines,words"`, `mask: "lines"`, `aria: "auto"`, `autoSplit: true`. Words `yPercent: 110 → 0`, 700 ms, stagger 50 ms, `ui-out` (lite: 450 ms, stagger 40 ms). Split waits for fonts, at most 600 ms.
- Cost measured: mobile Lighthouse LCP rose from 1.5–1.9 s to 1.9–2.1 s across the four pages; all still under 2.5 s, Performance 98–99.

**Scramble label.** `data-reveal="scramble"` runs ScrambleText (`chars: "01"`, 500 ms, `revealDelay` 0.1 s) on the HUD tag in the character-select card. The scrambled span is `aria-hidden` with a visually hidden copy for screen readers. It animates text, not transform or opacity; justified because it is one 13 px label for 0.5 s, with `contain: layout paint` and `overflow-wrap: anywhere` so it never shifts or overflows.

**Particles (7a).** Built as specified in 7a: Home hero only, 28 particles, `fpsLimit: 30`, paused off-screen and on blur, `full` tier on screens ≥ 768 px. Loaded with `requestIdleCallback` (Astro's `client:idle` needs a framework island; a vanilla idle loader gives the same timing without about 45 KB of React).

**Pointer light (7b).** A 240 px radial gradient inside the character-select card follows the pointer with `gsap.quickTo` on `x`/`y` (transform), 0.5 s `power3.out`; fades in 220 ms and out 180 ms. `full` tier, fine pointer, ≥ 768 px. The card rect is cached per hover so `pointermove` never forces layout. DESIGN.md's glow rule now lists it.

**Page transition (moment 8).** Implemented as specified: `@view-transition { navigation: auto }`, old page 100 ms, new page 180 ms, `--ease-out`, nav has `view-transition-name: site-nav`, all view-transition animations off under reduced motion. No Astro client router, so no `astro:before-swap` / `astro:page-load` handling is needed; each document boots motion once and `gsap.matchMedia().revert()` runs on `pagehide`.

**Plugins.** Registered: ScrollTrigger, CustomEase (every page), SplitText and ScrambleText (headline module). DrawSVG is not registered: the skills tree uses transform-scaled connectors (p07).

**Dev overlay.** `src/lib/motion/dev-hud.ts` shows FPS, active ScrollTriggers and the tier. It is imported only under `import.meta.env.DEV`, so production builds do not contain it (tested).

**Budget, measured** (`npm run budget`, gzip): first load 59.7 KB on every page (GSAP core, ScrollTrigger, CustomEase, SplitText, ScrambleText, Lenis, motion code). Lazy: 49.3 KB of tsParticles, fetched only on Home when idle on the full tier. Home total 109.0 KB of the 150 KB budget.

## 8. Changes in p11 (Home intro)

Built as moment 1 describes, with these changes.

**Implementation.** Vanilla modules, not a React island: `src/components/motion/IntroGate.astro` (inline, before first paint), `IntroOverlay.astro` (overlay, Skip button, boot script), `src/lib/motion/moments/intro.ts` (timeline, skip, fallbacks, cleanup), `src/components/three/` (`capability.ts`, `stage.ts`, `orbs-2d.ts`, `intro-scene.ts`, `dispose.ts`). Both renderers draw the same `IntroState` object that one GSAP timeline tweens, so the 2D and 3D versions share timing exactly.

**Which version plays.** 3D only when the tier is `full`, `hardwareConcurrency > 4`, no data saver, and WebGL works without a major performance caveat (software rendering counts as unusable). Otherwise the 2D version. If the 3D chunk has not loaded and built its scene within 600 ms, the 2D version runs. Any error skips straight to the end state. Debug switches: `?intro=replay`, `?intro=2d`, `?intro=3d`, `?intro=off`.

**Story and timing** (seconds; × 0.77 on phones and low-power devices):

| t | Beat |
|---|---|
| 0–0.45 | Charge: red and blue orbs gather light either side of the avatar card's centre (scale 0.3 → 1, opacity 0 → 1, `ui-out`) |
| 0.45–0.57 | Anticipation: pull apart 24 px (`ui-out`) |
| 0.57–1.00 | Converge on the collision point (`ui-in-out`) |
| 1.00 | Collision: orbs fade in 0.12; purple core 0.4 → 1 in 0.16; bloom spikes then settles over 0.4; shockwave ring 0.1 → 3.2 over 0.7 (fades from 1.4); burst particles fly out over 0.7 (3D); chromatic aberration 0.004 → 0 over 0.4 (3D desktop) |
| 1.15–1.60 | Overlay fades (`ui-out`, 0.45), clicks pass through from 1.15 |
| 1.30 | Hero reveal: the H1 word rise and HUD scramble start (the headline module waits for this beat on Home's first visit) |
| ~1.7 | Overlay removed, focus moved to `<main>` if it was on Skip, smooth scroll resumes |

The collision point is the avatar card's centre, clamped to 62% of the screen height on phones so it stays visible. The overlay is now removed at about 1.7 s (1.3 s on phones), not 2.6 s; the hero's own reveal continues on the page.

**Skip.** The Skip button is in the HTML and visible from the first frame (the inline gate shows the overlay before first paint). Skip or Esc jumps to the end state: the overlay fades in 150 ms and the hero shows without its reveal. Esc pressed before the intro bundle loads is handled by the inline gate.

**Safety nets.** The overlay only shows under `html.intro`, which the inline gate sets for new sessions without reduced motion; no JavaScript or reduced motion means no overlay and no session flag. If storage throws, no intro. If the intro bundle never starts, the gate removes the overlay after 4 s. Scroll is locked with `overflow: hidden` while `html.intro` is set, with `scrollbar-gutter: stable` so nothing shifts.

**3D details.** Orthographic camera in viewport pixels; additive sprites for the orbs and core; a ring mesh; 160 burst points (80 on phones); `EffectComposer` with mipmap bloom (half resolution on phones) and a separate chromatic-aberration pass on desktop. Pixel ratio capped at 1.5 on phones, 2 on desktop. Cleared to pure black (a dark non-zero clear colour came out grey after the colour-space round trip).

**Cleanup.** The overlay and canvas leave the DOM as soon as the timeline ends. GPU disposal (geometries, materials, texture, composer and passes, renderer, `forceContextLoss()`) runs at the next idle callback, so it never competes with the hero reveal. The test reads `renderer.info.memory` after disposal: 0 geometries, 0 textures.

**Cost, measured.** Home first load 62.4 KB gzip (+2 KB for the intro and 2D stage); the 3D chunk is 144 KB gzip, loaded only on Home on the full tier and absent from About, Work and Contact (tested). Mobile Lighthouse on Home, cold session (the emulated phone gets the 2D version): Performance 98, LCP 2.1 s (avatar), CLS 0, TBT 0 ms, the same as before the intro. Under software WebGL the 3D disposal takes about 5 s at idle; real GPUs never take the 3D path through software rendering, but p17 must profile the 3D intro and its disposal on a real device.

**Performance review.** Everything animated is transform or opacity, plus bloom and aberration inside the WebGL canvas. The 2D layers use `will-change: transform, opacity` because they are large soft gradients moved every frame for under 2 s (the skill's expensive-paint exception). The render loop runs only while the timeline does.

## 9. Changes in p12 (CV reveal)

Built as moment 2 describes, with these changes.

- **Burst is 2D on every tier.** A purple core (scale 0.4 → 1 in 160 ms, then out by 600 ms), a ring (0.1 → 1.6 over 600 ms) and 12 sparks in the creative, data and growth colours flying out over 600 ms, all `ui-out`, transform and opacity only, centred on the button that was clicked. No Three.js: loading the 144 KB 3D chunk for a 0.6 s button effect is not worth it. Lottie stays cut.
- **Loading.** `src/lib/motion/cv-burst.ts` is imported on the first `pointerenter` or `focus` of a CV button, never on page load (tested). If it is not ready 150 ms after a click, the dialog opens without the burst.
- **Dialog.** Native `<dialog>` with `showModal()`, opened 380 ms after the click (the burst keeps playing behind it). Enter: opacity 0 → 1 and scale 0.96 → 1 in 220 ms; exit 140 ms; backdrop fades to `bg-void` at 80%. Done with CSS transitions and `@starting-style` rather than GSAP, which overrides the ownership table: the browser runs them off the main thread and needs no JavaScript for the exit. Browsers without `@starting-style` open and close instantly.
- **Accessibility.** Focus moves into the dialog on open; Tab and Shift+Tab wrap inside it (Chrome's native modal otherwise lets Tab leave for the browser UI); Esc, the Close button and a backdrop click close it; focus returns to the button that opened it. Background scroll is locked with `html.dialog-open` and Lenis is paused through `ak:scroll-lock` / `ak:scroll-unlock`.
- **Reduced motion.** No burst; the dialog and backdrop fade only, in 150 ms (an exception to the global reduced-motion reset, in `global.css`).
- **No JavaScript.** CV buttons are plain `<a href="/cv/aden-khan-cv.pdf" download>` links.
- **Preview card.** Title, role line, the four roles with dates, education and certification, all from `docs/cv-source.md` (`src/data/cv.ts`), plus Download PDF (`download`) and Open in new tab (`target="_blank" rel="noopener"`).

## 10. Changes in p13 (Home)

All in `src/lib/motion/moments/home.ts`, loaded only on Home (dynamic import from the motion boot). Everything waits for the intro's reveal beat on a first visit (`src/lib/motion/intro-gate.ts`), runs straight away when no intro plays, and shows the final state at once when the intro is skipped. Hidden start states come from `html.motion-pending` (CSS: `visibility: hidden` on `[data-reveal="rise"]` and `[data-stat]`, `scaleX(0)` on `[data-bar]`), so no JavaScript means everything is visible and final.

| Moment | Spec |
|---|---|
| Hero entrance | Avatar card `scale 0.96 → 1`, 600 ms (transform only, the avatar is the LCP image); subhead, availability line and buttons rise 12 px with opacity, 500 ms, stagger 70 ms, from +150 ms; all `ui-out`. Lite: 450/400 ms. |
| Stat bars | `scaleX 0 → 1` from the left, 600 ms, stagger 80 ms, from +350 ms. Still equal-length decoration, not ratings. |
| Stats strip | Items rise 12 px with opacity, stagger 60 ms, from +300 ms. Number ticker (moment 5a): an `aria-hidden` copy counts from 0 to the real value in 900 ms `power3.out` (lite 700 ms) when the strip reaches 90% of the viewport; the real value sits in a visually hidden span for screen readers and is the copy's text without JavaScript. Once per session (`sessionStorage["ak.counted"]`). The copy reserves the final value's width in `ch`, so counting never shifts layout (CLS tested < 0.01). |
| Card tilt | Desktop, fine pointer, full tier: `rotationY` up to ±3° and `rotationX` up to ±2° following the pointer, `quickTo` 0.4 s `power3.out`, perspective 900 px, back to 0 on leave. Card rect cached per hover. |
| Teaser collision | Scroll-driven (scrubbed, 0.6 s smoothing): red starts 12% left of its place and travels to the centre, blue mirrors it, purple grows `0.4 → 1.15` and fades in from 35% of the way, red and blue settle to 30% opacity. Trigger from the stage top at 95% of the viewport to its bottom at 85% (reachable even though the teaser is the last section). At rest (no JS, reduced motion) the stage shows the equation: red, purple, blue. The three orbs carry `will-change: transform, opacity` because they are large gradients moved on every scroll frame. |

**Optional assets.** `src/assets/rive/avatar.riv` switches on a Rive avatar over the static one (state machine `Idle`); `src/assets/lottie/cv-burst.json` replaces the CSS CV burst with a Lottie one. Both are opt-in by file: without the file, the page references neither runtime. Both load on intent (Rive on first hover or focus of the character card; Lottie on first hover or focus of a CV button), never for reduced motion. Rive's WebAssembly is self-hosted (bundled from the package), not fetched from unpkg. Verified with a temporary Lottie file: the burst switched to the Lottie SVG and back when the file was removed.

**Kokonut UI.** Not used: every candidate text effect, card and button is a React component, and one React island on Home would push it past 150 KB.

**Measured.** Home first load 63.8 KB, total with idle particles 115.3 KB. Mobile Lighthouse on Home (cold session, 2D intro): before Performance 98, LCP 2.1 s, CLS 0; after Performance 97, LCP 2.3 s, CLS 0, TBT 0 ms. LCP is still the avatar; its render delay grew about 165 ms under simulated throttling.

## 11. Changes in p14 (About and Work)

`src/lib/motion/moments/about.ts` and `work.ts`, loaded only on their page, after the first frame. Hidden start states come from `html.motion-pending` (panels, sections and mission text hidden; mission cards shifted 24 px) and then from GSAP inline styles, so no JavaScript means everything visible.

| Moment | Spec |
|---|---|
| About: origin-arc panels | "Laid down like manga panels": at ≥ 768 px each panel slides in from its own side (24 px, alternating left/right) with a 1.5° rotation and 16 px rise, settling to 0; phones rise 16 px in place. 600 ms `ui-out` (lite 450), stagger 90 ms, ScrollTrigger batch at 85%, once. The lane-coloured top edge draws with `scaleX` 0 → 1 (500 ms, +150 ms). No pinning on About (the prompt allowed it on desktop; skipped to avoid scroll-jacking a reading page). This replaces moment 4's clip-path wipe, which would have overridden the panels' cut-corner clip-path. |
| About: education and goals | Rise 16 px with opacity, 500 ms, stagger 80 ms, at 88%, once. |
| Work: mission cards | Staggered group (reinstates moment 5b, cut in p04, at the owner's request): cards rise 24 px (550 ms, stagger 60 ms, batch at 90%, once); their text fades in; the result line arrives last (opacity and 8 px, +200 ms) as the emphasis. Cards only move, never fade, because the first thumbnail can be the LCP image. |
| Work: skills tree | DrawSVG is back (reverses the p07 cut, at the owner's request): an SVG overlay is built from the live layout when the tree comes within 400 px of the viewport (trunk across the top at four columns, down the left otherwise; branches are straight drops or runs to each heading), redrawn on resize. Trunk 500 ms, branches 400 ms stagger 100 ms, then chips fade and scale from 0.96, stagger 25 ms. The skills stay real HTML text and are not focusable (not interactive). Without JavaScript or with reduced motion the CSS connectors show. `stroke-dashoffset` is painted, an accepted exception for a small SVG. |
| Work: creative gallery | Desktop (≥ 1024 px, fine pointer): the section pins at 12% from the top and the strip moves sideways with scroll (scrub 0.5); arrow keys on the focused strip scroll the page by one card. Narrower or touch: native swipe with scroll-snap, as before. Reduced motion: never pinned. Reverses moment 5d's "no pin" at the owner's request, desktop only. |

**Bklit.** Not used: it is React, and a React island on Work would break the 150 KB budget. The only number that would chart is "−72% CAC", which is relative; a before/after chart would need invented absolute values.

**Resilience (break-ui).** `npm run dev:worst` renders About and Work with worst-case data (long titles, organisations and roles, an unbreakable string, a long email, empty tag and skill lists, missing images). Fixed: empty lists no longer render an empty `<ul>`; a missing image file renders a labelled "Image coming soon" box at the slot's size instead of failing the build. Held up: wrapping of long titles, roles and emails; no overflow at 320, 360, 1440 px and 200% zoom.

**Performance.** The first mission image is now `eager` + `fetchpriority="high"` (its 1.1 s load delay was the main LCP cost). Mobile Lighthouse, local: About 97–98, LCP 2.0–2.3 s; Work 93–97, LCP 2.46–2.63 s, which sits on the 2.5 s line with the p14 motion on or off (tested both). Open item for p17.

## 12. Changes in p15 (Contact)

**Terminal typing.** Replaces moment 6's "prompt only" rule at the owner's request, without breaking its reason (contact details must never be delayed): each link keeps its real text in a visually hidden span, so its accessible name, `href` and keyboard focus exist from the first byte; only an `aria-hidden` copy animates. ScrambleText decodes the prompt, then each channel, from `0`/`1` into its text: 450 ms per line (lite 350), lines 120 ms apart (lite 100), `revealDelay` 0.12 s, from 150 ms after boot. `src/lib/motion/moments/contact.ts`, loaded on Contact only. The typed copies are monospace and keep their length, so nothing reflows. Reduced motion and no JavaScript: final text at once.

**Copy-email toast.** A "Copy email" button beside the address (shown only when JavaScript and the Clipboard API are available) writes the address to the clipboard and confirms in a toast with `role="status"`. The toast rises from below in 220 ms and leaves in 150 ms (`--ease-out`, CSS transition, interruptible: a second click restarts the timer rather than queueing). It stays 2.4 s. Reduced motion: no movement. If copying fails, the toast shows the address instead. Sonner was not used: it is React.

**Form.** No animation; errors appear immediately. Documented here because they are part of the Contact experience: native `required`/`type="email"` validation without JavaScript; with JavaScript, inline messages linked by `aria-describedby`, `aria-invalid` on each field, a `role="status"` summary ("Check 3 fields: Name, Email, Message."), focus on the first invalid field, and live re-checking after the first attempt. A valid form posts natively to Netlify, which redirects to `/thanks/`.
