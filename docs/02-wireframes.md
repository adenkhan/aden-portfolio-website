# Wireframes — Aden Khan Portfolio

Low-fidelity layout for each page, mobile (360–767px) and desktop (≥ 1024px). This expands the wireframe list in `docs/00-design-plan.md` §3 for rubric item 1. Copy is shortened here; the full text is in `docs/SEO.md` (appendix). Visual styling is in `DESIGN.md`; motion in `docs/MOTION.md`.

Legend: `[ ]` button or link, `( )` image, `{ }` interactive element, `~` motion moment.

## Shared frame

```
DESKTOP                                                   MOBILE
+-----------------------------------------------------+   +---------------------------+
| AK        Home  About  Work  Contact   [CV]          |   | AK          [CV]  [Menu]  |
+-----------------------------------------------------+   +---------------------------+
|                    page content                     |   |       page content        |
+-----------------------------------------------------+   +---------------------------+
| © 2026 Aden Khan · Product Marketer · Karachi       |   | © 2026 Aden Khan          |
| email · LinkedIn · GitHub                           |   | email · LinkedIn · GitHub |
+-----------------------------------------------------+   +---------------------------+
```
A skip link ("Skip to content") is the first focusable element. [CV] opens the CV dialog (~ CV burst).

## Home `/`

```
DESKTOP                                                   MOBILE
~ intro overlay, first visit per session: [Skip intro]    ~ same overlay, 2D version
+-------------------------------+---------------------+   +---------------------------+
| H1 Aden Khan,                 | +-----------------+ |   | H1 Aden Khan,             |
|    Product Marketer           | | // PLAYER 01 .. | |   |    Product Marketer       |
|                               | | (avatar 4:5)    | |   | subhead (2-3 lines)       |
| subhead (36ch)                | |                 | |   | availability line         |
| availability line             | | Positioning ─── | |   | [Download CV]             |
|                               | | Analytics   ─── | |   | [See my missions]         |
| [Download CV] [See my missions]| | Automation  ─── | |   | +-----------------------+ |
|                               | | Paid growth ─── | |   | | // PLAYER 01 ...      | |
|                               | +-----------------+ |   | | (avatar 4:5)          | |
+-------------------------------+---------------------+   | | stat bar labels       | |
| −72%     | +40%      | $7,000+     | 4              |   | +-----------------------+ |
| CAC      | awareness | sponsorships| roles since 25 |   +-------------+-------------+
+-----------------------------------------------------+   | −72%        | +40%        |
| H2 Creative × Data = Growth                         |   | $7,000+     | 4           |
| teaser sentence ... [Open a channel → /contact/]    |   +-------------+-------------+
+-----------------------------------------------------+   | H2 Creative × Data = Growth|
                                                          | teaser + contact link      |
                                                          +---------------------------+
```
~ hero assembly and count-ups run inside the intro on the first visit only.

## About `/about/`

```
DESKTOP                                                   MOBILE
+-----------------------------------------------------+   +---------------------------+
| H1 The origin arc: from campaigns to products       |   | H1 The origin arc: from   |
|    About Aden Khan, product marketer (subline)      |   |    campaigns to products  |
| bio paragraph (65ch)                                |   |    About Aden Khan, ...   |
+-----------------------------------------------------+   | bio                       |
| H2 From storytelling to product analytics           |   +---------------------------+
| +------------------------+ +------------------------+ | | H2 From storytelling ...  |
| | Arc 1 Storyteller 2025 | | Arc 2 Growth 2025      | | | +-----------------------+ |
| | text           (red)   | | text        (purple)   | | | | Arc 1 Storyteller     | |
| +------------------------+ +------------------------+ | | +-----------------------+ |
| +------------------------+ +------------------------+ | | | Arc 2 Growth          | |
| | Arc 3 Go-to-market     | | Arc 4 Builder 2026     | | | +-----------------------+ |
| | 2025–26        (blue)  | | text        (purple)   | | | | Arc 3 Go-to-market    | |
| +------------------------+ +------------------------+ | | +-----------------------+ |
+-----------------------------------------------------+   | | Arc 4 Builder         | |
| H2 Education: BBA Marketing at IBA Karachi          |   | +-----------------------+ |
| IBA · BBA Marketing · 2023–2027, courses, cert      |   | H2 Education ...          |
+-----------------------------------------------------+   | H2 Career goals ...       |
| H2 Career goals in tech product marketing           |   | [see the missions]        |
| goals text [see the missions] [Open a channel]      |   | [Open a channel]          |
+-----------------------------------------------------+   +---------------------------+
```
~ arc panels reveal once on scroll, in order.

## Work `/work/`

```
DESKTOP                                                   MOBILE
+-----------------------------------------------------+   +---------------------------+
| H1 Product marketing missions, completed            |   | H1 Product marketing      |
| intro line                                          |   |    missions, completed    |
+-----------------------------------------------------+   +---------------------------+
| H2 Case studies from SaaS and tech startups         |   | H2 Case studies ...       |
| +---------------+ +---------------+ +---------------+ | | +-----------------------+ |
| | • Both        | | • Data        | | • Creative    | | | | • Both                | |
| | H3 Lower the  | | H3 Drive      | | H3 Arm the    | | | | H3 Lower the cost ... | |
| | cost of growth| | feature adopt.| | sales team    | | | | Sadiq.ai, role        | |
| | Sadiq.ai      | | Sadiq.ai      | | Sadiq.ai      | | | | result sentence       | |
| | result        | | result        | | result        | | | | [Read the arc]        | |
| | [arc link]    | | [arc link]    | | [arc link]    | | | +-----------------------+ |
| +---------------+ +---------------+ +---------------+ | |   ... 9 cards stacked     |
|   ... 3 rows of 3 (2 columns at 768px)              |   +---------------------------+
+-----------------------------------------------------+   | H2 Skills ...             |
| H2 Skills: go-to-market, analytics, automation      |   | trunk                     |
|                 ─────── trunk ───────               |   |  ├ Product marketing      |
|   |            |              |             |       |   |  │  chips                 |
| Product mkt  Growth     Data & automation  Creative |   |  ├ Growth  chips          |
|  chips        chips       chips             chips   |   |  ├ Data & automation      |
+-----------------------------------------------------+   |  └ Creative chips         |
| H2 Creative gallery: campaigns and ad creatives     |   +---------------------------+
| {← ( ) ( ) ( ) ( ) ( ) →}  horizontal scroll-snap    |   | H2 Creative gallery       |
| closing line [Open a channel → /contact/]           |   | {( ) ( ) → swipe}         |
+-----------------------------------------------------+   | [Open a channel]          |
                                                          +---------------------------+
```
~ skills-tree connectors grow trunk → lanes → chips, once.

## Contact `/contact/`

```
DESKTOP                                                   MOBILE
+-----------------------------------------------------+   +---------------------------+
| H1 Open a channel                                   |   | H1 Open a channel         |
|    Contact Aden Khan, product marketer (subline)    |   |    Contact Aden Khan, ... |
| line + [the missions behind this → /work/]          |   | line + work link          |
+-----------------------------------------------------+   +---------------------------+
| +--------- terminal panel (max 720px) -----------+  |   | +-----------------------+ |
| | $ open --channel_       ~ scramble, decorative |  |   | | $ open --channel_     | |
| | email     aden.khan613@gmail.com  [mailto]     |  |   | | email    [mailto]     | |
| | linkedin  /in/adenkhank           [open]       |  |   | | linkedin [open]       | |
| | github    /adenkhan               [open]       |  |   | | github   [open]       | |
| | cv        [Download CV]                        |  |   | | cv       [CV]         | |
| +------------------------------------------------+  |   | +-----------------------+ |
+-----------------------------------------------------+   +---------------------------+
| H2 Send a message                                   |   | H2 Send a message         |
| {name} {email}                                      |   | {name}                    |
| {message ........................................}  |   | {email}                   |
| [Send message]                                      |   | {message}                 |
+-----------------------------------------------------+   | [Send message]            |
                                                          +---------------------------+
```

## Thanks `/thanks/` and 404

```
+---------------------------------------------+
| H1 Message received  /  H1 Page not found   |
| one line                                    |
| [See my missions] [Back to home]            |
+---------------------------------------------+
```
Both are `noindex`. Centred content is allowed only on the 404 (DESIGN.md Layout).
