# Submission kit

Everything needed to write the assignment document for https://aden-portfolio-website.vercel.app. All captures are from the live site.

- `screenshots/desktop`: 1440×900 captures of the four pages: *-top (above the fold) and *-full (full page), plus the pinned or animated sections on their own: 01-home-teaser, 02-about-arcs, 03-work-case-01…06, 03-work-skills and 03-work-campaign-shelf (cases and arcs are shown in their finished, stacked state).
- `screenshots/mobile`: 390×844 captures at device scale 3 of the four pages, top and full page (the Work full page is scaled to about 1.9 because of the browser's 16,384 px image limit).
- `screenshots/interactions`: cv-dialog-open, lightbox-open (a carousel slide), mobile-menu-open, contact-form-filled (dummy text, not submitted) and 404-page.
- `screenshots/motion`: intro-1…4 (summon, spiral, charge, reveal), scrub-1…3 (the scroll-scrubbed Convergence with the avatar casting) and home-scroll-1440.mp4 (a 14 s screen recording of the Home scroll).
- `seo/seo-table.md`: Per page: exact title and description with character counts, H1, H2s, target keywords found and canonical URL, read from the live HTML.
- `seo/alt-text.md`: Every image on the site (and each Open Graph image) with its source file, page and alt text.
- `seo/lighthouse/lighthouse-summary.md`: Lighthouse scores (performance, accessibility, best practices, SEO) for four pages on mobile and desktop.
- `seo/lighthouse/`: Lighthouse JSON and HTML reports (<page>-<device>.report.json and .html) and score-circle screenshots (gauges-<page>-<device>.png).
- `seo/head-snippet.png`: The home page's head tags (title, description, canonical, Open Graph, Twitter card, JSON-LD) rendered from the live HTML.
- `seo/mobile-proof.png`: The four pages side by side at 390 px wide.
- `design/design-system.md`: Colour tokens with hex, role and contrast ratios; typography; type scale; spacing and radius; motion tokens; components and states; motion principles. Taken from the built CSS and DESIGN.md.
- `design/palette.png`: Rendered colour swatch board.
- `design/type-specimen.png`: Rendered type specimen in the site's three typefaces.
- `design/components.png`: Nav, buttons, stat strip, character card, manga panel, chips, terminal panel, form, campaign cards and footer in their real styles.
- `design/wireframes/`: Low-fidelity wireframes (SVG and PNG) of the four pages and the CV dialog, regenerated from the live layout.
- `design/motion-list.md`: Every motion moment: name, page, what it does, library.
- `overview/facts.md`: Live URL, repository, hosting, deploy date, exact tech versions, page list, and the purpose, audience and message copied word for word.
- `overview/rubric-audit.md`: The rubric audit of the live site (docs/RUBRIC-AUDIT.md).
- `overview/decisions.md`: The ten most important entries from docs/DECISIONS.md.

The markdown files in this kit are committed to the repository; the images, video, Lighthouse reports and the zip are not (see .gitignore).
