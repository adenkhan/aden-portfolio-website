import type { SiteConfig } from "./types";

/** The only place the site origin is written. Prompt 21 replaces it with the live URL. */
export const SITE_URL = "https://aden-khan-portfolio.netlify.app";

export const site: SiteConfig = {
  name: "Aden Khan",
  role: "Product Marketer",
  location: "Karachi, Pakistan",
  url: SITE_URL,
  email: "aden.khan613@gmail.com",
  linkedin: "https://www.linkedin.com/in/adenkhank/",
  github: "https://github.com/adenkhan",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about/" },
    { label: "Work", href: "/work/" },
    { label: "Contact", href: "/contact/" },
  ],
  hudTag: "// PLAYER 01 · PRODUCT MARKETER · KARACHI",
  cvLabel: "Download CV",
  // The file always exists: a generated stand-in until the real CV replaces it (docs/ASSETS.md).
  cvPath: "/cv/aden-khan-cv.pdf",
  footer: { copyright: "© 2026 Aden Khan · Product Marketer · Karachi, Pakistan" },
};
