export type Lane = "creative" | "data" | "both";
export type PageId = "home" | "about" | "work" | "contact" | "thanks" | "404";

export interface NavItem {
  label: string;
  href: "/" | `/${string}/`;
}

export interface Link {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteConfig {
  name: "Aden Khan";
  role: "Product Marketer";
  location: "Karachi, Pakistan";
  url: string;
  email: string;
  linkedin: string;
  github: string;
  nav: NavItem[];
  hudTag: string;
  cvLabel: string;
  cvPath: string;
  footer: { copyright: string };
}

export interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  display: string;
  label: string;
  lane: Lane;
}

export interface HomeCopy {
  line: string;
  missionsCta: Link;
  cvCta: string;
  /** Revealed one by one as the teaser orbs collide. */
  scrollWords: [string, string, string];
}

/** One Work case study: each field renders as a single line on desktop. */
export interface CaseStudy {
  id: string;
  order: number;
  title: string;
  company: string;
  problem: string;
  move: string;
  result: string;
  lane: Lane;
  evidence?: AssetKey;
}

export interface SkillLane {
  id: "product" | "growth" | "data" | "creative";
  label: string;
  lane: Lane;
  skills: string[];
}

/** One About arc: a period, a company, one line and a stat chip. */
export interface Arc {
  order: 1 | 2 | 3 | 4;
  id: string;
  period: string;
  org: string;
  line: string;
  chip: string;
  lane: Lane;
}

export interface AboutCopy {
  /** Three short lines, shown as separate lines. */
  bio: [string, string, string];
  /** Visually hidden headings: the structure needs them, the design shows none (docs/SEO.md §4). */
  arcsHeading: string;
  arcs: [Arc, Arc, Arc, Arc];
  chipsHeading: string;
  /** The only visible place BBA/IBA appears (CLAUDE.md §4a). */
  chips: [string, string];
  questLabel: string;
  quest: string;
  questLinks: [Link, Link];
}

export interface WorkCopy {
  /** Visually hidden. */
  missionsHeading: string;
  /** Visually hidden. */
  skillsHeading: string;
  galleryHeading: string;
  /** Screen-reader labels for each case-study line; the design marks them with icons. */
  caseLabels: { company: string; problem: string; move: string; result: string };
}

export interface ContactCopy {
  line: string;
  /** Visually hidden. */
  channelsHeading: string;
  /** Visually hidden. */
  messageHeading: string;
  form: {
    name: string;
    email: string;
    message: string;
    submit: string;
    errors: { name: string; email: string; emailFormat: string; message: string };
    /** Announced on a failed submit; {count} and {fields} are filled in. */
    summary: string;
    sending: string;
  };
  copy: { button: string; done: string; failed: string };
  thanks: { status: string; line: string; fallback: string };
}

export interface PageSeo {
  id: PageId;
  path: string;
  title: string;
  description: string;
  h1: string;
  h1Sub?: string;
  ogImageAlt: string;
  noindex?: boolean;
}

export type AssetKey = "avatar" | "ogDefault" | "cvPdf" | `mission-${string}` | `gallery-${string}`;

export interface AssetSlot {
  id: AssetKey;
  /** Path from the project root. Replace the file at this path to swap the asset. */
  path: string;
  width: number;
  height: number;
  format: "png" | "webp" | "pdf";
  alt: string;
  usedOn: string[];
}

export interface CvPreview {
  title: string;
  summary: string;
  education: string;
  roles: { org: string; title: string; dates: string }[];
  certification: string;
  download: string;
  open: string;
  close: string;
}
