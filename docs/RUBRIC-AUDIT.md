# Rubric audit (r11)

Live site: https://aden-portfolio-website.vercel.app (Vercel, the owner's choice; the site is audited as deployed, not on localhost). Audited 2026-11-03 with Playwright (fresh contexts), axe and Lighthouse. Raw data and screenshots are in the session scratchpad; the checks are repeatable with the same script.

Status column: **PASS**, **FAIL** (fixed in this round, rechecked below), **OPEN** (needs the owner), **NOTE**.

## A. Deployment (1 mark)

| Item | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| A1 | Live over HTTPS, public | PASS | `https://aden-portfolio-website.vercel.app` loads without a login | none |
| A2 | Status codes, fresh context, no cookies | PASS | `/` 200, `/about/` 200, `/work/` 200, `/contact/` 200, `/this-page-does-not-exist/` 404 | none |
| A3 | Internal links, nav, CTAs, CV PDF | PASS | 13 internal URLs all < 400; `/cv/aden-khan-cv.pdf` 200 `application/pdf` | none |
| A4 | mailto, LinkedIn, GitHub | PASS | `mailto:aden.khan613@gmail.com`; GitHub 200; LinkedIn `https://www.linkedin.com/in/adenkhank/` answers 999 to scripts (LinkedIn's bot block), the href is correct | none |
| A5 | Contact form submits and arrives | **OPEN** | POST `/api/contact/` returned 502: the function ran but `RESEND_API_KEY` is not set, so it shows its "could not be sent, email instead" page. Netlify Forms do not exist on Vercel, so the form was rebuilt this round | Owner: add `RESEND_API_KEY` (free resend.com account) in Vercel → Settings → Environment Variables, redeploy; then send one test message. Arrival cannot be confirmed from outside |
| A6 | No console errors during a full scroll | PASS | 0 console errors, page errors or failed requests on all four pages | none |
| A7 | Canonical, og:url, sitemap, robots use the live domain | FAIL → PASS | Before this round every canonical and og:url said `aden-khan-portfolio.netlify.app`. After the Vercel switch: canonical and og:url match each page; `robots.txt` and `sitemap-index.xml`/`sitemap-0.xml` list only `aden-portfolio-website.vercel.app` | `SITE_URL` changed, all Netlify references removed |
| A8 | Host is on the assignment's list | **NOTE** | The assignment rubric (docs/00-design-plan.md) lists GitHub Pages, Netlify or Wix; Vercel is not on it. The owner chose Vercel | Owner's call, logged in DECISIONS.md |

## B. Content and structure (1 mark)

| Item | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| B1 | Home: intro, H1, high-quality image | PASS | H1 "Aden Khan, Product Marketer"; poster `img[data-avatar-poster]`, alt "3D anime avatar of Aden Khan, product marketer", `fetchpriority=high` | none |
| B2 | Poster sharp at 2x and ≥ 1200 px long side | FAIL → fixed | At 2x the poster is 386×483 CSS px and loaded the 840 px rendition (sharp at 2x, 965 px needed) but the largest source was 840×1050, under 1200 px on its long side | `CharacterCard.astro` widths changed from 360/560/840 to 400/800/1200 (1200×1500 max) |
| B3 | Poster visible without JavaScript | PASS | `isVisible()` true with JS disabled | none |
| B4 | About: bio, background, education, goals | PASS | 3-line bio, four origin arcs, "IBA Karachi · BBA Marketing · Class of 2027", "Google Data Analytics certified", "Next quest: Product marketing at a tech company. Internships now, full-time from mid-2027." | none |
| B5 | Work: case studies, skills, campaign shelf | PASS | 6 case studies, skills lanes, 6 campaigns with 19 real creatives and 5 SEO-tool screenshots; 0 images without alt (24 of 24 have it); `npm run assets:check` lists only `ogDefault` (the /thanks/ and 404 preview) as a placeholder | none |
| B6 | Contact: email and LinkedIn as text and links | PASS | `aden.khan613@gmail.com` and `linkedin.com/in/adenkhank` visible, both are working links | none |
| B7 | Stats correct, count-up final once | PASS | Visible: −72%, +40%, $7K+, **4** ("Companies shipped for" reads 4). The "44" in a raw text dump is the screen-reader copy plus the aria-hidden ticker; `innerText` with JS off reads "4" twice for the same reason, one is `.sr-only` | none |
| B8 | Facts match docs/cv-source.md | NOTE | All copy comes from the owner's text in `src/data`; the copy test (`tests/e2e/copy.spec.ts`) guards the repeated facts. Not re-diffed line by line this round | none |

## C. SEO and mobile (1 mark)

| Item | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| C1 | Unique title ≤ 60, description ≤ 155 | PASS | Titles 39 / 48 / 47 / 35 chars; descriptions 138 / 137 / 143 / 122 | none |
| C2 | One H1 with a target keyword; H2s; keywords in body | PASS | H1s: "Aden Khan, Product Marketer"; "Origin arc of a product marketer"; "Product marketing missions"; "Open a channel / Contact Aden Khan, product marketer". H2s such as "Product marketing results in numbers", "Case studies", "Skills" | none |
| C3 | Alt text everywhere, OG images included | PASS | 0 `<img>` without an alt on all pages; every page has `og:image:alt` | none |
| C4 | Open Graph, Twitter card, JSON-LD on each page | FAIL → fixed | OG and `twitter:card=summary_large_image` on all four. JSON-LD present on Home (WebSite, Person), About (ProfilePage), Work (ItemList, SoftwareApplication) but **missing on Contact** | `contactJsonLd()` (ContactPage, main entity the Person) added to `/contact/` |
| C5 | No horizontal scroll at 360, 375, 390 | PASS | `scrollWidth` ≤ viewport on all 12 page/width pairs | none |
| C6 | Body text ≥ 16 px | PASS (body) / FAIL → fixed (labels) | Body 16 px everywhere. Content-bearing labels were 13–14 px: education chips, case company line, campaign client line, concept disclaimer. Decorative HUD labels ("PLAYER 01", format chips) stay at 13 px by design | Those four are now 16 px |
| C7 | Tap targets ≥ 44 px | FAIL → fixed | Every button and link measured ≥ 44 px except the "AK" logo link at 23×44 px (12 times, one per page and width) | `Nav.astro` logo `min-width: 44px` |
| C8 | Nav menu works on touch | PASS | 375 px: tapping "Menu" shows Home, About, Work, Contact, CV; tapping About lands on `/about/` | none |
| C9 | Viewport meta | PASS | `width=device-width, initial-scale=1, viewport-fit=cover…` on all pages | none |
| C10 | Lighthouse, live URL | PASS | Performance / Accessibility / Best practices / SEO: Home desktop 89/100/100/100, mobile 77/100/100/100; About 94/100/100/100, 69/100/100/100; Work 88/100/100/100, 79/96/100/100; Contact 89/100/100/100, 81/100/100/100. SEO and Accessibility are all ≥ 96 | none |
| C11 | axe: zero serious or critical | PASS | 0 serious or critical on all four pages (WCAG 2.0 to 2.2 A/AA) | none |

## D. Evaluation criteria

| Item | Check | Result | Evidence | Fix |
|---|---|---|---|---|
| D1 | Creativity and design: top 3 issues | NOTE | Judged from full-page captures of all four pages (the impeccable skill was not run in full, to save tokens). (1) 13 px mono labels in low-contrast grey on navy are hard to read (HUD tags, chips): bumped only where they carry content. (2) /contact/ is a narrow left column with an empty right half and a small avatar: the layout wastes its widest screen. (3) /work/ is very long (6 full-screen cases plus skills plus shelf) and the cases share one template, so it reads repetitive | Owner's call; none applied |
| D2 | Content quality (no-ai-slop, detect) | NOTE | Applied by hand to all visible copy. Flags: "Started making memes that sold. / Got curious about why they worked. / Now I work where product, data and marketing meet." (stacked short sentences, robotic rhythm, but the owner's own words); "Open a channel", "Next quest", "PLAYER 01" (gaming metaphor as labels, intentional brand voice). No banned words, binary contrasts, throat-clearing or recap endings | none (owner copy is kept word for word) |
| D3 | Keyboard-only walkthrough | PASS | Tab reaches 42 to 44 stops per page starting at "Skip to content", no focus traps. Work's case cards show their ring on the inner card (`.case:focus-visible .card`). CV dialog: opens on Enter, traps focus over 8 Tabs, closes on Esc, returns focus to the trigger | none |
| D4 | Reduced motion | PASS | `prefers-reduced-motion`: 0 pinned sections, 0 hidden headings or paragraphs, no intro overlay on every page | none |
| D5 | Throttled 375 px phone (4x CPU, 1.6 Mbps) | PASS | Load 1.9 s, LCP 1.9 s, H1 visible after 455 ms, 0 errors, no sideways scroll | none |
| D6 | Intro never blocks > 3 s, Skip works | PASS | First visit: intro cleared at 1.9 s, "Skip intro" visible; clicking it finishes in 179 ms | none |

## Final status

Pending the redeploy and recheck of B2, C4, C6, C7 (see the end of this file once rerun).
