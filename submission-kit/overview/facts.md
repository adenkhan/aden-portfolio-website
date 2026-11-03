# Facts

| | |
| --- | --- |
| Live URL | https://aden-portfolio-website.vercel.app |
| GitHub repository | https://github.com/adenkhan/aden-portfolio-website (branch `main`) |
| Hosting | Vercel (free). Every push to `main` deploys automatically; the contact form is a Vercel serverless function (`api/contact.js`). |
| Latest deploy | 2026-11-03, from commit 079fe65 |
| Framework | Astro (static output), React islands, Tailwind CSS v4 |
| Node | >=22.23.4 |

## Pages

| Route | Page | Indexed |
| --- | --- | --- |
| `/` | Home: introduction, headline, avatar, results strip, CREATIVE · DATA · GROWTH | yes |
| `/about/` | About: bio, origin arcs, education, career goals | yes |
| `/work/` | Work: six case studies, skills, campaign shelf | yes |
| `/contact/` | Contact: email, LinkedIn, GitHub, CV, message form | yes |
| `/thanks/` | Form confirmation | no (noindex) |
| any other path | 404 | n/a |

## Tech stack (exact installed versions)

| Package | Version |
| --- | --- |
| @astrojs/check | 0.9.12 |
| @astrojs/react | 7.1.2 |
| @astrojs/sitemap | 3.7.4 |
| @axe-core/playwright | 4.14.0 |
| @base-ui/react | 1.9.0 |
| @fontsource-variable/big-shoulders-display | 5.3.0 |
| @fontsource-variable/instrument-sans | 5.3.0 |
| @fontsource-variable/jetbrains-mono | 5.3.0 |
| @pixiv/three-vrm | 3.5.5 |
| @pixiv/three-vrm-animation | 3.5.5 |
| @playwright/test | 1.64.1 |
| @rive-app/canvas | 2.49.0 |
| @tailwindcss/vite | 4.3.3 |
| @types/react | 19.3.0 |
| @types/react-dom | 19.3.0 |
| @types/three | 0.187.0 |
| astro | 7.4.4 |
| class-variance-authority | 0.7.1 |
| cn | 0.5.2 |
| gsap | 3.15.0 |
| lenis | 1.3.27 |
| lottie-web | 5.13.0 |
| lucide-react | 1.66.0 |
| motion | 14.9.0 |
| postprocessing | 6.39.6 |
| prettier | 3.9.10 |
| prettier-plugin-astro | 1.1.2 |
| react | 19.3.1 |
| react-dom | 19.3.1 |
| shadcn | 4.23.0 |
| sharp | 0.35.5 |
| tailwindcss | 4.3.3 |
| three | 0.187.0 |
| tw-animate-css | 1.4.0 |
| typescript | 6.0.3 |

## Purpose, audience and message (word for word)

The text below is copied unchanged from docs/00-design-plan.md and docs/01-brief.md.

### docs/00-design-plan.md

#### 1. Website purpose
The site is a personal brand and job-application portfolio that positions Aden Khan as a product marketer for tech companies. It replaces an image-only portfolio (aden-portfolio-creative.vercel.app, ten stacked images with no indexable text) with a fast, searchable site that recruiters can skim in under a minute.
Three jobs:
- Get hired: support applications for product marketing roles (internships now, full-time after graduation in June 2027).
- Prove impact: show real results, such as a 72% cut in customer acquisition cost at Sadiq.ai and an SEO tool shipped at 10Pearls.
- Stand out: an anime-tech visual identity with motion graphics that makes the portfolio memorable.

Assignment rubric (graded, 4 marks): (1) design plan doc with purpose, audience and wireframe; (2) Home with professional intro, headline and high-quality image, About with bio, education and career goals, Portfolio/Skills page, Contact page with email and LinkedIn; (3) SEO: keywords in headings and content, meta descriptions, image alt text, mobile-friendly and readable; (4) live on a free host (the owner chose Vercel).

#### 2. Target audience and message
Core message: a product marketer who understands both the customer and the data, and can build the tools to connect them.
| Audience | What they need to see | Where on the site |
| --- | --- | --- |
| Recruiters and hiring managers at tech startups and SaaS companies | Role fit, measurable results, education, availability | Home headline, Work missions, CV download |
| Product and growth leads | Product thinking: positioning, onboarding, adoption, analytics | Work case studies, skills tree |
| Startup founders (freelance) | Proof of shipped campaigns and automations | Work, Contact |
| Course instructor | All four pages, SEO, mobile, live link | Whole site |
Brand idea: Creative × Data = Growth. A red energy orb (creative: storytelling, campaigns, content) and a blue orb (data: analytics, automation, SEO tooling) collide into a purple burst (growth). This is the signature motion moment and the site's argument in one image.
Tone: confident, playful and technical. Anime-flavored, never childish. First person, short sentences, numbers wherever possible.

### docs/01-brief.md

#### 1. Positioning statement
Aden Khan is a product marketer, not a designer or a developer, who joins what customers feel to what the data shows and builds the systems that scale it. He has cut customer acquisition cost 72% at Sadiq.ai, shipped an SEO content tool at 10Pearls and grown program awareness 40% at i2i. This site is built the way he works: the story is the creative side, the numbers are the data side, and the page is where they meet. The anime-HUD look is a signature, not the pitch. A recruiter should leave knowing what he did and what it produced, then remember the style second.

#### 2. Audience and the single takeaway
| Segment | Takeaway (one sentence) |
|---|---|
| Recruiters and hiring managers at tech and SaaS startups | "He has real, measured results across four roles and can start now." |
| Product and growth leads | "He thinks in positioning, onboarding and adoption, and he uses analytics to prove it." |
| Startup founders (freelance) | "He ships things: campaigns, automations and an internal tool, not just decks." |
| Course instructor | "All four pages exist, the SEO basics are done, it works on a phone, and it is live." |
