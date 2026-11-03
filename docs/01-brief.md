# Creative Brief — Aden Khan Portfolio

Status: draft 1, 2026-11-02. Inputs: `docs/00-design-plan.md`, `docs/cv-source.md`, `CLAUDE.md`.
Fixed: audience, positioning, page list, copy, IP rule, rubric. Open: look and feel, motion intensity, how the Creative × Data = Growth idea appears. Colours and fonts are NOT decided here (prompt 3).

## 1. Positioning statement
Aden Khan is a product marketer, not a designer or a developer, who joins what customers feel to what the data shows and builds the systems that scale it. He has cut customer acquisition cost 72% at Sadiq.ai, shipped an SEO content tool at 10Pearls and grown program awareness 40% at i2i. This site is built the way he works: the story is the creative side, the numbers are the data side, and the page is where they meet. The anime-HUD look is a signature, not the pitch. A recruiter should leave knowing what he did and what it produced, then remember the style second.

## 2. Audience and the single takeaway
| Segment | Takeaway (one sentence) |
|---|---|
| Recruiters and hiring managers at tech and SaaS startups | "He has real, measured results across four roles and can start now." |
| Product and growth leads | "He thinks in positioning, onboarding and adoption, and he uses analytics to prove it." |
| Startup founders (freelance) | "He ships things: campaigns, automations and an internal tool, not just decks." |
| Course instructor | "All four pages exist, the SEO basics are done, it works on a phone, and it is live." |

## 3. Brand personality
Each trait has a "this, not that" pair.

1. **Confident**: states a result and moves on. This: "−72% customer acquisition cost." Not: "Passionate about driving growth."
2. **Playful**: the game language is a wink, used in labels and microcopy. This: a "// PLAYER 01" tag over a serious H1. Not: a joke in every section or fake game dialogue.
3. **Technical**: precise, labelled, measured. This: a monospace stat label with the source role beside it. Not: decorative code or fake terminal noise with no meaning.
4. **Specific**: numbers, tool names, dates. This: "HubSpot and n8n workflows for lead capture, enrichment and CRM handoff." Not: "Strong marketing and automation skills."
5. **Warm**: first person, short sentences, no jargon pile-ups. This: "I care about one question: why do people adopt a product?" Not: a wall of buzzwords or a cold corporate voice.

## 4. Creative concept
**Creative × Data = Growth.** Red is storytelling, campaigns and content. Blue is analytics, automation and SEO tooling. Purple is what happens when they meet. This is both the visual system and the argument of the site.

Rules for the idea:
- The two orbs are an original effect and are never named after any franchise.
- Colour carries meaning everywhere. Creative work is red-tinged, data work is blue-tinged, and anything showing both is purple. Don't use red or blue for decoration only.
- The collision is the hero moment and is rare. Everything else is a quieter echo of it.

| Page | How the idea shows up |
|---|---|
| Home | The collision is the signature moment: a short intro (skippable, once per session, and absent for reduced motion) that resolves into the hero. After that, the stat bars on the avatar card and the teaser line carry the idea. The Download CV button triggers a small purple burst as a reward. |
| About | Four manga-style panels, one per origin arc. Early arcs lean red (storytelling), later arcs lean blue (analytics, automation), and the final panel is purple. The reader sees Aden's path from creative to data to both. |
| Work | The 9 missions are tagged by lane: creative, data or both. Each card carries its result number up front. The skills tree lights up in the lane colour as it enters view, and the creative gallery is the red end of the page. |
| Contact | The quietest page. A terminal panel with real contact details, plain and fast. Purple is used only for the call to action. |

## 5. Mood references (in words only)
General aesthetics, never specific franchise assets.
- A cockpit or game HUD: thin lines, corner brackets, small uppercase labels and meters, with generous empty space.
- Manga page layout: bordered panels of different sizes, hard shadows, a single dramatic panel per spread, halftone dot texture.
- Developer-tool marketing sites: crisp type, one strong idea per screen, restrained gradients, real numbers.
- A character-select screen: one hero figure, stat bars beside it, a confident idle state.
- Print-style editorial pacing: a big number, a short sentence, then whitespace.
- Night-time interface light: glow used as a highlight on a few elements, not as a wash over the whole page.

## 6. Success criteria
**Recruiter test (30 seconds, first visit, phone or laptop).** The viewer can say:
1. Who he is: Aden Khan, product marketer in Karachi.
2. One number: the 72% CAC drop.
3. Where he studies and when he is available: IBA, internships now, full-time from mid-2027.
4. How to reach him, within one click of any page.
The viewer should also recall that the site "looks like a game HUD", and should not say it was hard to read or slow.

**Grader rubric (4 marks).** All four routes exist with real HTML text; Home has intro, headline and a high-quality image; About has bio, education and goals; Work shows projects and skills; Contact shows email and LinkedIn; each page has keywords in its H1 and content, a meta description and alt text; the site is readable on mobile; and it is live on a free host (Vercel).

**Lighthouse (mobile, production build).** Performance 85+, Accessibility 95+, Best Practices 95+, SEO 95+ (aim 100). Performance is deliberately a little lower than the others because of the motion layer; the text must still render fast (LCP under 2.5 s, no layout shift from the intro).

**Other checks.** Readable with JavaScript off. Works at 360px with no horizontal scroll. Reduced-motion gets a calm version. No franchise terms anywhere.

## 7. Decisions made
Answers to the brainstorming questions, chosen to serve a recruiter at a tech startup.

| # | Question | Answer and why |
|---|---|---|
| 1 | What is the site actually for? | Getting an interview. The style is there to be remembered, but the proof does the persuading. Every flourish must be justified by that. |
| 2 | Who is the first reader, and how long do they give it? | A recruiter or hiring manager skimming on a phone or laptop, with under a minute. So the first screen has the name, role, one proof number and a way to reach him. |
| 3 | What must they remember after 30 seconds? | Name and role, the 72% CAC cut, and the Creative × Data idea. In that order. If the style outshines the proof, we have failed. |
| 4 | How loud or restrained should the motion be? | Loud in exactly one place (the intro collision and the CV burst), restrained everywhere else. Between those moments motion explains something (a count-up, a panel assembling, a branch lighting up) or it is cut. Nothing loops attention-grabbing animation on a reading area. |
| 5 | Does the anime influence stay or go? | It stays as general aesthetics (HUD, manga panels, character select) because it is part of his identity and makes the site memorable. It never uses franchise characters, logos, names or techniques. |
| 6 | What aesthetic references do we use? | Game HUDs, manga page layout, developer-tool marketing sites, character-select screens and editorial pacing (section 5). Described in words only. |
| 7 | What would feel cringe? | Fan-art of a known franchise; the orbs named after a franchise move; "gamer" slang in the body copy; a long forced intro; typewriter text that blocks reading; glitch on every heading; unexplained skill bars (80% "Creativity"); fake terminal output; a robot-voiced AI-sounding bio; stock-photo handshakes; auto-playing sound. |
| 8 | Is the intro a good idea at all? | Yes, but short (under 3 s), skippable, once per session, and never blocking the H1 text from existing in the HTML. It is absent for reduced-motion and for visitors with JavaScript off. |
| 9 | Should we use a photo? | No. By the owner's choice the hero is an illustrated avatar. We accept the known rubric risk and make the image high-resolution with strong alt text. |
| 10 | Do the stat bars on the avatar show real numbers? | No invented percentages. The four bars (Positioning, Analytics, Automation, Paid growth) are labelled only, or tied to real proof elsewhere. Unexplained ratings read as fake. |
| 11 | How far do we gamify the language? | Labels and microcopy only (HUD tag, "missions", "open a channel"). Headlines and body stay professional so a recruiter never has to decode them. |
| 12 | Is purple a third brand colour or a state? | A state. It appears only where creative and data are shown together, which keeps the metaphor honest. |
| 13 | What is the contact flow? | Email and LinkedIn first, one click from every page. The optional form (the Vercel contact function (api/contact.js)) is secondary and may be left out. |
| 14 | Does the 3D layer carry content? | No. Three.js and particles are decoration that loads after the page text. All content is in HTML. |
| 15 | What happens when assets are missing? | Build to placeholder slots and ship. The avatar, screenshots and CV PDF arrive later and must never block a task. |

## 8. Open questions
Logged because they need real input or a later decision. None blocks progress.
1. Will the owner supply the illustrated avatar as a high-resolution file with a transparent background, and is there a second pose for the CV burst?
2. Which of the 9 missions can be backed by a real screenshot or ad creative? Missions with no evidence should be flagged on the card, not faked.
3. Is the phone number in `docs/cv-source.md` meant to stay off the site? (Current plan: yes. The repo is public, so it is already visible there.)
4. The old portfolio on Vercel (aden-portfolio-creative.vercel.app) is still live. Should it be taken down or redirected once the Vercel site is up?
5. Should Contact include the optional form, or email and LinkedIn only?
6. Is a short voiced or sound element wanted at all? (Current plan: no sound.)
7. Is the avatar original art the owner made or commissioned, with no resemblance to an existing franchise character? (Needed for the IP rule before launch.)
8. Final palette, type and the exact visual weight of the HUD framing are for prompt 3, which may revise anything in the design plan's suggestions.
