# Motion moments

From docs/MOTION.md (section numbers in the last column). Every moment has a reduced-motion version and a lighter mobile version; 3D is a core feature, never cut for budget.

| Moment | Page | What it does | Library | MOTION.md |
| --- | --- | --- | --- | --- |
| Intro: Convergence | Home (first visit) | Red and blue orbs spiral into each other, lightning arcs, space bends, they collapse into purple and the hero is torn open. Skippable, under 3 s, never repeats in a session. | Three.js + GSAP timeline | §1, §16 |
| CV reveal burst | All pages (CV button) | A short burst from the button, then the CV dialog scales in from it. | GSAP, native dialog | §2 |
| Kinetic headlines | All pages (H1) | Each character flips up in 3D from its bottom edge. The accessible name stays the real text. | GSAP SplitText | §3, §15 |
| Stat count-up and meters | Home | The four numbers count up once when in view and the meters fill; the final values are in the HTML. | GSAP ScrollTrigger | §10, §15 |
| Character card tilt | Home (desktop) | The avatar card leans toward the pointer. | GSAP quickTo | §15 |
| Convergence scroll scrub | Home (CREATIVE · DATA · GROWTH) | The section pins; scrolling plays the collision forward and back, with the three words flipping in on the beats, and snaps to its start or end. | GSAP ScrollTrigger, Lenis, Three.js | §16 |
| Persistent 3D world | All pages | One WebGL scene behind every page, kept alive across navigation; the camera flies to a station per page. Quality tiers lower detail on phones and weak GPUs. | Three.js, postprocessing, custom GLSL, Astro ClientRouter | §13 |
| Section wipes | About, Work | A cover with a halftone edge slides off each section as it enters. | GSAP ScrollTrigger | §15 |
| Manga panels (pinned slams) | About | The four arcs pin on desktop; each scroll step slams a panel in with an ink-bleed mask, a 2-frame inverted flash, a halftone burst behind its stat chip and a camera shake. Its node on the 3D path lights on the same beat. | GSAP ScrollTrigger, SVG filters, Lenis | §4, §18 |
| Education chips and goal label | About | The chips stamp in; the "Next quest" label decodes. | GSAP, ScrambleText | §15 |
| Case studies as visual stories | Work | Each case has an animated visual with three beats (problem, move, result). On desktop the section pins and the cases move sideways; phones stack them. | GSAP ScrollTrigger, DrawSVG, MotionPath | §14 |
| Case-study takeover | Work | Click a case's open button: the card morphs to full screen, scrolls on its own, and morphs back on close. Deep link #case-<slug>. | GSAP Flip, native dialog | §20 |
| SEO tool visual | Work (case 3) | A browser frame cycles the tool's five screens; the five playbook steps light one by one. | GSAP | §25 |
| Skills tree | Work | Branches are drawn over the HTML tree from its live layout; chips light as they enter. | GSAP DrawSVG | §11 |
| Velocity marquee of skills | Work | Two rows of skills drift in opposite directions, flip with the scroll direction and speed up with scroll velocity; hovering a word pauses its row and lights its 3D cluster. | GSAP ticker, Lenis | §21 |
| Campaign shelf | Work | Carousels swipe or drag with momentum; campaign posts fan out on hover or in view; a lightbox opens on any image. | CSS scroll-snap, native dialog | §25 |
| Terminal panel | Contact | The channel rows decode in; the email copy button confirms. | GSAP ScrambleText | §6, §12 |
| Contact wave | Contact | "hi" in the intro line waves; the 3D avatar waves as the page enters view. | GSAP, Three.js | §12, §24 |
| Form submit burst | Contact | A burst at the Send button, then the form posts and /thanks/ confirms. | Three.js, GSAP | §12 |
| Smooth scroll | All pages | Inertial scrolling that GSAP ScrollTrigger reads; stopped while a dialog or the portal is open. | Lenis | §1, §7 |
| Speed lines | All pages | Manga speed lines fade in at the screen edges on fast scroll; headings skew with the scroll direction; the 3D particles stretch into streaks. | GSAP ticker, Lenis, GLSL | §17 |
| Portal page transitions | Between pages | A purple orb grows from the click, covers the swap and collapses into the new H1, which decodes. The 3D camera flies at the same time. | GSAP, Astro view transitions | §19 |
| Orb cursor and magnets | Desktop | A red and blue orb with a trail follows the pointer and is pulled toward buttons and cards. | GSAP Observer, quickTo | §22 |
| Charged cards | Work (desktop) | Lightning crawls along a hovered case card's border and its result number glitches once. | SVG, GSAP | §22 |
| Rewind to top | Footer, all pages | "Back to top" rewinds the page over 1.6 s under a VHS overlay while the 3D world runs backwards. | Lenis, GSAP | §23 |
| 3D avatar | Home, About, Contact | The owner's VRoid model breathes, blinks, follows the cursor, swings its hair with scroll speed, and casts the Convergence from its hands. It waves on Contact and glances at About panels. | Three.js, @pixiv/three-vrm, GSAP | §24 |
| Reduced motion | All pages | Every effect has a calm static version: no intro, no pins, no parallax; the 3D world renders one still frame; the avatar stays a poster. | CSS media query, GSAP matchMedia | §0, §1 |
