# Aden Khan Portfolio — Design Plan & Site Copy

> Status (p07): sections 4, 5 and 7 were starting suggestions. Final values live in `DESIGN.md` (palette, type, components), `docs/SEO.md` (SEO, including H1 sublines and the Home availability line), `docs/MOTION.md` and `docs/ENGINEERING-PLAN.md` (motion, stack, budgets). Wireframes per page: `docs/02-wireframes.md`. Changes are logged in `docs/DECISIONS.md`.

## 1. Website purpose
The site is a personal brand and job-application portfolio that positions Aden Khan as a product marketer for tech companies. It replaces an image-only portfolio (aden-portfolio-creative.vercel.app, ten stacked images with no indexable text) with a fast, searchable site that recruiters can skim in under a minute.
Three jobs:
- Get hired: support applications for product marketing roles (internships now, full-time after graduation in June 2027).
- Prove impact: show real results, such as a 72% cut in customer acquisition cost at Sadiq.ai and an SEO tool shipped at 10Pearls.
- Stand out: an anime-tech visual identity with motion graphics that makes the portfolio memorable.

Assignment rubric (graded, 4 marks): (1) design plan doc with purpose, audience and wireframe; (2) Home with professional intro, headline and high-quality image, About with bio, education and career goals, Portfolio/Skills page, Contact page with email and LinkedIn; (3) SEO: keywords in headings and content, meta descriptions, image alt text, mobile-friendly and readable; (4) live on a free host: GitHub Pages, Netlify or Wix.

## 2. Target audience and message
Core message: a product marketer who understands both the customer and the data, and can build the tools to connect them.
| Audience | What they need to see | Where on the site |
| --- | --- | --- |
| Recruiters and hiring managers at tech startups and SaaS companies | Role fit, measurable results, education, availability | Home headline, Work missions, CV download |
| Product and growth leads | Product thinking: positioning, onboarding, adoption, analytics | Work case studies, skills tree |
| Startup founders (freelance) | Proof of shipped campaigns and automations | Work, Contact |
| Course instructor | All four pages, SEO, mobile, live link | Whole site |
Brand idea: Creative × Data = Growth. A red energy orb (creative: storytelling, campaigns, content) and a blue orb (data: analytics, automation, SEO tooling) collide into a purple burst (growth). This is the signature motion moment and the site's argument in one image.
Tone: confident, playful and technical. Anime-flavored, never childish. First person, short sentences, numbers wherever possible.

## 3. Wireframe
Every page shares a top nav (logo left; Home, About, Work, Contact and a CV button right) and a footer (copyright, email, LinkedIn, GitHub). On phones each page stacks into one column.
- Home (/): intro sequence overlay (orbs collide, skip button) → hero (H1 + subhead, avatar in a character-select card with stat bars, Download CV and See my missions buttons) → stats strip (4 numbers) → Creative × Data teaser line
- About (/about): H1 + bio → origin-arc manga panels (2×2 grid, Arc 1–4) → education + certification → career goals
- Work (/work): H1 + intro → mission cards (9, grid) → skills tree → creative gallery (horizontal strip)
- Contact (/contact): H1 + intro line → terminal panel (email, LinkedIn, GitHub, CV link) → optional form

## 4. Visual theme and motion plan (starting suggestions; design skills may change them)
Look: "anime HUD": dark navy base, neon red and blue accents that resolve into purple, manga panel borders, halftone textures, monospace interface labels. The owner's original anime avatar is the brand character. No third-party anime characters, logos or named techniques anywhere.
Palette suggestion: background #0B0D1A · creative red #FF3B5C · data blue #2FA8FF · growth purple #9B5CFF · text #F2F3FA.
Type suggestion: bold condensed display (e.g. Bebas Neue or Anton), clean sans body (e.g. Inter), monospace HUD labels (e.g. JetBrains Mono).
Motion moments: intro orb collision on Home (under 3 s, skip button, once per session); CV reveal mini-burst; headline type-in with glitch; About manga panels assembling on scroll; Work stat count-ups; skills tree branches lighting up; ambient particles and cursor glow.
Guardrails: intro once per session; prefers-reduced-motion gets a calm static version; phones get lighter effects; 3D loads only after page text.
Hero image: the illustrated avatar (owner prefers no photo; known rubric risk).

## 5. SEO plan
Every page is real HTML text with its own title, meta description and one keyword-led H1.
Primary keywords: Aden Khan · product marketer · product marketing portfolio · tech product marketing.
Secondary keywords: product marketer Karachi · SaaS product marketing · go-to-market · product analytics (Amplitude) · marketing automation (HubSpot, n8n) · IBA marketing student.
| Page | Title tag | Meta description | H1 |
| --- | --- | --- | --- |
| / | Aden Khan, Product Marketer \| Portfolio | Aden Khan is a product marketer in Karachi blending storytelling, analytics and automation to drive adoption and growth for tech products. | Aden Khan, Product Marketer |
| /about | About Aden Khan, Product Marketing \| IBA Karachi | IBA Karachi BBA Marketing student focused on tech product marketing, product analytics and go-to-market. Background, education and goals. | The origin arc: from campaigns to products |
| /work | Product Marketing Projects & Skills \| Aden Khan | Product marketing case studies: 72% lower CAC at Sadiq.ai, an SEO content app at 10Pearls, automation in HubSpot and n8n, and more. | Product marketing missions, completed |
| /contact | Contact Aden Khan, Product Marketer | Hiring for product marketing? Reach Aden Khan by email or LinkedIn. Open to internships and full-time roles from mid-2027. | Open a channel |
Images: descriptive alt text on every image; compressed WebP with set width and height; lazy below the fold. Examples: avatar "Illustrated anime avatar of Aden Khan, product marketer"; ad creative "Meta ad creative for Sadiq.ai Blessed Friday sale, 89% off"; screenshot "Amplitude onboarding funnel dashboard for Sadiq.ai".
Technical: Open Graph and Twitter cards, sitemap, robots.txt, favicon, canonical URLs, Person JSON-LD (name, job title, LinkedIn).
Mobile: viewport meta, stack below 768px, body text ≥ 16px, high contrast, tap targets ≥ 44px. Lighthouse target 90+ for SEO and accessibility.

## 6. Site copy (use word for word; keep keywords in headings)
### Home
- HUD label: // PLAYER 01 · PRODUCT MARKETER · KARACHI
- H1: Aden Khan, Product Marketer
- Subhead: I connect what customers feel with what the data shows, then build the systems that scale it.
- Buttons: Download CV (triggers the purple burst) · See my missions
- Hero image: high-resolution illustrated avatar in a "character select" frame with stat bars: Positioning · Analytics · Automation · Paid growth
- Stats strip: −72% customer acquisition cost · +40% program awareness · $7,000+ sponsorships secured · 4 marketing roles since 2025
- Teaser: Creative × Data = Growth. Red is storytelling. Blue is analytics and automation. Purple is what happens when they collide.
### About
- H1: The origin arc: from campaigns to products
- Bio: I'm a BBA Marketing student at IBA Karachi who fell for the product side of marketing. I started with social campaigns and memes that converted, then moved into analytics, automation and go-to-market work for tech startups. Today I care about one question: why do people adopt a product, and how do we help more of them get there?
- Arc 1, Storyteller (2025): Ran LinkedIn and Instagram campaigns for the i2iScale accelerator program, raising awareness 40%.
- Arc 2, Growth (2025): At Sadiq.ai, used Amplitude to improve onboarding, retention and feature adoption, and ran Meta campaigns that cut acquisition cost 72%.
- Arc 3, Go-to-market (2025–26): Researched partners and investors for Leasap, a U.S. proptech startup, and built its outreach pipelines.
- Arc 4, Builder (2026): At 10Pearls, shipped an SEO content app and automated marketing workflows in HubSpot and n8n.
- Education: Institute of Business Administration (IBA), Karachi · BBA, Marketing · 2023–2027. Relevant courses: Tech Product Marketing, Tech Product Development, Marketing Analytics, Product Analytics, Machine Learning. Certified: Google Data Analytics Specialization.
- Career goals: Join a tech or SaaS company as a product marketer, owning positioning, launches and adoption. Open to internships now and full-time roles from mid-2027.
### Work
- H1: Product marketing missions, completed
- Mission cards (mission | where | result):
  1. Lower the cost of growth | Sadiq.ai, Product Marketing Associate | Performance-driven Meta campaigns cut customer acquisition cost by 72%
  2. Drive feature adoption | Sadiq.ai | Amplitude analysis guided onboarding, retention and adoption fixes across web and mobile
  3. Arm the sales team | Sadiq.ai | Pitch decks, sales enablement assets, whitepapers and case studies for online sellers
  4. Ship an SEO writing tool | 10Pearls, Marketing Automation Associate | Internal app combining Ahrefs keyword data and competitor research in one drafting flow
  5. Stop keyword cannibalization | 10Pearls | Checker that flags overlapping search intent before publishing
  6. Automate the funnel | 10Pearls | HubSpot and n8n workflows for lead capture, enrichment, lifecycle email and CRM handoff
  7. Build a GTM pipeline | Leasap.com, Business Development Intern | Outreach pipelines in LinkedIn Sales Navigator; a funding tracker targeting 1–2 applications a week
  8. Grow a program's reach | Invest2Innovate, Marketing Associate | +40% awareness for i2iScale across 3 concurrent initiatives
  9. Fund a society | IBA Animation and Pop Culture Society | $7,000+ in sponsorships from 15+ proposals; 1,500+ new followers in six months
- Skills tree:
  - Product marketing: positioning, go-to-market, sales enablement, pitch decks, whitepapers, case studies, user research
  - Growth: Meta, Google, LinkedIn and TikTok Ads, B2B and B2C lead generation, CRO, social strategy
  - Data and automation: Amplitude, Google Analytics 4, Google Tag Manager, Looker Studio, SQL, R, Tableau, HubSpot, n8n, Zapier, Apollo.io
  - Creative: Canva, Photoshop, CapCut, Premiere Pro, Figma
- Creative gallery: horizontal strip of ad creatives and campaign results (real screenshots added later by the owner).
### Contact
- H1: Open a channel
- Line: Hiring a product marketer, or need help with a launch? My inbox is open.
- Email: aden.khan613@gmail.com · LinkedIn: https://www.linkedin.com/in/adenkhank/ · GitHub: https://github.com/adenkhan · Download CV
- Footer: © 2026 Aden Khan · Product Marketer · Karachi, Pakistan

## 7. Tech stack and deployment
Astro (static pages) + React islands + Tailwind v4; GSAP (ScrollTrigger, SplitText, DrawSVG; all plugins free for commercial use since 2025) + Lenis; Three.js + postprocessing for the orbs; tsParticles; optional Rive or Lottie avatar animation. Hosting: Netlify (free), GitHub Pages as backup. Never Vercel: not an approved host for the assignment.
