# Round 2 Motion Audit (r5)

**Method.**
- `find-animation-opportunities` swept the four pages section by section (source plus the built pages), then `animate` set each recipe and `impeccable` checked the result.
- **Owner rule (r5): no section is static.** Every section needs at least one meaningful motion moment tied to its message. The skill's default posture is restraint, so its gate is used here to decide *how* each moment moves, not *whether*:
  - Purpose: named in each row.
  - Frequency and speed: page-entry moments sit under 700 ms per element; anything users trigger repeatedly stays at 150–250 ms.
  - Function: data the reader is reading is never moved for style.
- Every moment animates transform and opacity (stroke drawing for SVG lines), has a reduced-motion end state, and is gated to a fine pointer when it is about hover.
- **Hierarchy (impeccable):** one hero motion per screen; everything else supports it and finishes after it.

## 1. Inventory: what every section did before r5

| Page | Section | Motion before r5 | Static? |
|---|---|---|---|
| All | Page change | Router default crossfade; 3D camera flight starts after the new page loads | — |
| All | Nav, footer | Hover only | Exempt (chrome) |
| Home | Hero H1 | Masked word rise | — |
| Home | Line, buttons | Rise | — |
| Home | Stat counters | Count-up numbers | Plain numbers (owner: make them dials or meters) |
| Home | Character card | Scale-in, bars fill, tilt, pointer light, 3D orbs orbit | — |
| Home | CREATIVE · DATA · GROWTH | Words rise with the scroll collision | Words move as blocks (owner: kinetic type) |
| About | H1 | Word rise | — |
| About | Bio, 3 lines | None | **Static** |
| About | Origin arcs | Slide and settle, edge grows; 3D node lights | Soft (owner: slam in like manga panels) |
| About | Education chips | Section fade-up | Near-static |
| About | Next quest | Section fade-up | Near-static |
| Work | H1 | Word rise | — |
| Work | Case studies | r4 visual stories, pinned sequence | — |
| Work | Skills | Tree draws, 3D constellation | — |
| Work | Creative drops | Drag with momentum, tilt | — |
| Contact | H1 | Word rise | — |
| Contact | Line | None | **Static** |
| Contact | Terminal | Channels decode (scramble) | — |
| Contact | Form | None until send (then the 3D burst) | **Static** |

Text blocks over 40 words: **none.** The longest is the About bio (21 words in 3 lines); no case caption exceeds 17 words. Nothing to replace or cut (owner item 3).

## 2. Opportunities, ordered by leverage

| # | Location | Today | Purpose | Frequency | Motion (r5) |
|---|---|---|---|---|---|
| 1 | Every H1 (`headline.ts`) | Word rise | Explanation and delight on arrival: the page announces itself | Once per page view | **Kinetic type.** SplitText chars, each from `rotationX: -90°, yPercent: 40, opacity 0` around its bottom edge (perspective 600 px), stagger 0.018 s, 0.7 s `ui-out`; lite tier 0.5 s. Words stay grouped (`words,chars`), so lines never break mid-word. Screen readers read the H1 as one string (`aria: auto`). |
| 2 | Teaser words (`home.ts`) | Words rise | Explanation: the three lanes land in turn as the orbs collide | Once per visit (scroll-scrubbed) | Each word's chars flip in from `rotationX: -90°` with a 0.03 s stagger, scrubbed with the collision. GROWTH lands last and swells once (scale 1.08, yoyo) on impact. *As built: a swell, not the planned scramble, because scrambling would replace the split characters.* |
| 3 | Home stat counters (`StatsStrip.astro`) | Plain numbers | Explanation: show the size of each result, not only the figure | Once per session | **Meters that encode the real number.** −72%: a ring that draws to 72%. +40%: a ring that draws to 40%. $7K+: seven ticks, one per $1,000, lighting in turn. 4: four dots, one per company. Drawn with DrawSVG (stroke) and opacity, in step with the count-up (0.9 s `ui-out`); end state without JS. |
| 4 | About arcs (`about.ts`, `ArcPanel.astro`) | Slide and settle | Explanation: each career stage hits like a manga panel, and the 3D path node lights with it | Once per visit | **Slam.** Each panel drops from `scale 1.12, y −30, rotation ±2°, opacity 0` to rest in 0.32 s (`power4.in`, the impact), then gets a one-frame impact flash (a white overlay at 0.5 → 0 opacity over 0.18 s), a 4 px shake (0.25 s) and speed lines (12 SVG rays drawing outward, 0.3 s, then fading). It fires on the same trigger that lights the panel's 3D node (top at 70%). |
| 5 | Section entries below the fold | Fade-up or nothing | Preventing a jarring change, plus pacing: sections arrive like turned pages | Once per section per visit | **Panel wipe with a halftone edge.** An overlay in the page colour, whose leading edge is a dot gradient, slides off the section (`xPercent 0 → 101`, 0.6 s `ui-in-out`), uncovering it. Transform only, added by script only. Never on the first screen (LCP). Applied to: About chips and quest, Work skills and gallery, Contact form. |
| 6 | Page changes (BaseLayout, world controller) | Crossfade; the camera flies after load | Spatial consistency: the page and the 3D camera move as one | Every navigation (tens per visit) | `<main>`: old content exits up (`translateY −16px`, opacity → 0, 180 ms), new content enters from below (`20px`, 320 ms, 60 ms delay), both `ui-out`. The 3D flight starts on `astro:before-preparation`, the moment the link is clicked, toward the destination's station. Kept short because navigation is frequent. |
| 7 | Desktop cursor and buttons (`cursor.ts`) | System cursor; CSS hover | Feedback: interactive things answer the pointer | Constant (desktop, fine pointer only) | A 10 px orb follows the pointer (`quickTo`, 0.25 s) and grows to a 40 px ring over links and buttons (0.2 s). The system cursor stays (accessibility). **Magnetic** `.btn`: it pulls up to 6 px toward the pointer within its box (0.3 s `ui-out`) and springs back on leave (`elastic.out(1, 0.5)`, 0.5 s). Never on touch or reduced motion. |
| 8 | About bio lines | Static | Explanation: the story reads in order | Once per view | The three lines rise in sequence after the H1 (mask rise, 0.5 s, stagger 0.12). |
| 9 | About education chips | Fade-up | State: credentials "stamped" | Once per view | After the wipe, the chips stamp in: `scale 1.25 → 1, rotation −4° → 0, opacity 0 → 1`, 0.35 s `back.out(2)`, stagger 0.1. |
| 10 | About next quest | Fade-up | Explanation: the next level is "loading" | Once per view | After the wipe, the "Next quest" label decodes (ScrambleText "01", 0.6 s); the dashed box fades its border in. |
| 11 | Contact line | Static | Feedback and invitation | Once per view | "Say hi." ends with a single 14° wave of its last word (`rotation 0 → 14 → −8 → 0`, 0.6 s) after the H1 settles. |
| 12 | Contact form | Static | Preventing a jarring change; focus feedback | Entry once; focus often | Fields stagger in after the wipe (`y 12`, opacity, 0.4 s, stagger 0.06). Focus feedback: the field's label steps forward 4 px and takes the growth colour (transform 220 ms, CSS). *As built: the label moves, not a planned underline, which would have needed a layout property.* |

## 3. Rejected candidates

- **Nav and footer links.** Clicked tens of times per visit; hover colour already answers them. Motion would slow core navigation (gate: frequency).
- **Case-study captions moving on every scroll after their beat.** The captions are what the reader is reading (gate: function). They move once with their beat (r4), then rest.
- **Skill chips jiggling on hover.** Tens per visit, and the chips are the content being read (gate: function). The 3D cluster brightening behind them (r3) is the hover answer.
- **Glitch on every H1.** Cut in p04 as cringe and disallowed by MOTION.md moment 3. The kinetic H1 uses 3D char rotation; scramble stays for labels and the GROWTH impact.
- **A custom cursor that replaces the system cursor.** That hides the precise pointer and breaks for some assistive setups (gate: function). The orb is a companion; the system cursor stays.

## 4. Hierarchy check (impeccable, after the build)

The rule: one hero motion per screen; supporting motion finishes after it or waits for it.

| Screen | Hero | Supporting | Fixed after the check |
|---|---|---|---|
| Home, first screen | Kinetic H1 (0–0.9 s) | Line, buttons and stats rise; meters draw and numbers count; 3D orbs orbit (ambient) | Meters and count-up fired at load, at the same time as the H1. **Now delayed 0.75 s** when the page starts at the top. |
| Home, teaser | The scroll collision with the words flipping in | GROWTH swell | — |
| About, first screen | Kinetic H1 | Bio lines (from 0.45 s), the 3D path | — |
| About, arcs | Each panel's slam | Flash, shake, speed lines, edge; the 3D node lights | Two panels in one row slammed together. **The right one now hits 0.14 s later.** |
| About, chips and quest | The wipe | Chip stamps, label decode (from 0.35 s) | — |
| Work | The pinned case sequence (r4) | The 3D camera move | — |
| Work, skills and gallery | The wipe, then the tree draw | The constellation | — |
| Contact, first screen | Kinetic H1 | The "hi." wave (0.9 s) | The terminal started decoding 0.15 s in, under the H1. **Now from 0.6 s.** |
| Contact, form | The wipe | Fields stagger in | — |
| Any page change | The page lifts away and rises in | The 3D flight, from the click | — |

`impeccable detect` on the four built pages (`?world=off`), after the fixes:
- **Low contrast on Home** (2.0–2.5:1 on `#07080f`). The selectors are the SplitText characters and the secondary button **mid-animation** (partial opacity), and the ratios change between runs. At rest the end state passes the axe WCAG 2.2 AA spec (`tests/e2e/a11y.spec.ts`, run after motion settles). **Not a defect.**
- **AI colour palette (purple heading text).** The growth lane colour, declared in DESIGN.md; the brand concept (same call as p16, row 11). **Kept.**
- **Nested cards on Work** (the visual's bordered stage inside the case card). **Fixed:** the stage has no border or fill of its own, only a hairline above it.
- **Content hidden at rest on Work** (54% of text). These are the problem / move / result captions of cases 2–6, waiting at opacity 0 for their beat in the pinned sequence (r4, at the owner's request). They stay in the HTML and the accessibility tree; reduced motion and no-JS show them at once. **Kept, deliberately.**
- **Source advisories.** Only the existing dev-only items (DataToggle, the Img placeholder badge) and the mask `#000`.

## 5. Result

- Every section on the four pages now has a motion moment tied to its message (§2), and every page change has one.
- Text blocks over 40 words: none existed, so none needed replacing.
- Tests:
  - **Full suite:** `npm run verify` passes, 104 tests.
  - **World spec:** 18 of 18 across three repeats.
  - **Reduced motion:** the existing specs check final states for every page.
  - **Desktop pointer:** the cursor orb and magnetic buttons were verified in a browser (the ring opens over a button, which leans toward the pointer); they never run on touch or reduced motion.
- Lighthouse is not re-run for r5: the r3 table stands as the baseline, and r5 adds no new chunk to first load.
