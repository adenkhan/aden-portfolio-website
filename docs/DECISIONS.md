# Decisions Log

Running log of project decisions. Newest entries at the bottom. Update this file whenever a decision changes.

Format:
```
## YYYY-MM-DD — <short title>
- Decision: what was decided
- Why: reason
- Source: prompt / doc
- Supersedes: earlier entry, if any
```

## 2026-11-02 — Intro is rare, short and optional
- Decision: Intro orb collision runs under 3 s, once per session, with a skip button. It does not run for reduced-motion or no-JS visitors, and it never delays real text in the HTML.
- Why: A recruiter has under a minute. The collision is the signature moment but must not cost reading time.
- Source: p02, `docs/01-brief.md` decisions 4 and 8.

## 2026-11-02 — Motion is loud once, restrained elsewhere
- Decision: Large motion is limited to the intro collision and the CV-download burst. Elsewhere motion must explain something (count-up, panel assembly, skills branch lighting) or be cut.
- Why: Keeps proof ahead of style.
- Source: p02, `docs/01-brief.md` decision 4.

## 2026-11-02 — Colour carries meaning
- Decision: Red marks creative work, blue marks data work, purple appears only where both are shown together. Specific hex values stay open until prompt 3.
- Why: Keeps the Creative × Data = Growth metaphor honest.
- Source: p02, `docs/01-brief.md` decision 12.

## 2026-11-02 — No invented stat-bar numbers
- Decision: The avatar's stat bars (Positioning, Analytics, Automation, Paid growth) show labels only, or are tied to real proof. No made-up percentages.
- Why: Unexplained ratings read as fake and conflict with the "never invent beyond cv-source" rule.
- Source: p02, `docs/01-brief.md` decision 10.

## 2026-11-02 — Gamified language is limited to labels
- Decision: Game vocabulary ("missions", "player 01", "open a channel") is allowed in labels and microcopy. Headlines and body copy stay professional.
- Why: A recruiter should never have to decode the page.
- Source: p02, `docs/01-brief.md` decision 11.

## 2026-11-02 — 3D and particles are decoration only
- Decision: Three.js, postprocessing and tsParticles carry no content and load after the page text.
- Why: Content must be readable without JavaScript and render fast.
- Source: p02, `docs/01-brief.md` decision 14.

## 2026-11-02 — Lighthouse targets
- Decision: Mobile production build targets Performance 85+, Accessibility 95+, Best Practices 95+, SEO 100, with LCP under 2.5 s and no layout shift from the intro.
- Why: The design plan asks for 90+ on SEO and accessibility. Performance gets a small allowance for the motion layer.
- Source: p02, `docs/01-brief.md` section 6.
- Supersedes: the "Lighthouse target 90+ for SEO and accessibility" line in `docs/00-design-plan.md` (raised for SEO and accessibility, performance added).

## 2026-11-02 — Unresolved items stay open
- Decision: The open questions in `docs/01-brief.md` section 8 (avatar file, mission evidence, phone number, old Vercel site, contact form, sound) are logged and do not block work.
- Why: CLAUDE.md autonomy rule: build to placeholders and keep going.
- Source: p02, `docs/01-brief.md` section 8.
