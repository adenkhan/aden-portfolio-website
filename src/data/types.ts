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
  h1: string;
  subhead: string;
  availability: string;
  ctaPrimary: string;
  ctaSecondary: string;
  statBars: [string, string, string, string];
  teaserHeading: string;
  teaser: string;
  teaserLink: Link;
}

export interface Mission {
  id: string;
  order: number;
  title: string;
  org: string;
  role?: string;
  result: string;
  lane: Lane;
  related: Link;
  /** Short labels from the mission copy and skills list; not new claims. */
  tags: string[];
  evidence?: AssetKey;
}

export interface SkillLane {
  id: "product" | "growth" | "data" | "creative";
  label: string;
  lane: Lane;
  skills: string[];
}

export interface Arc {
  order: 1 | 2 | 3 | 4;
  id: string;
  title: string;
  period: string;
  text: string;
  lane: Lane;
}

export interface AboutCopy {
  h1: string;
  bio: string;
  arcsHeading: string;
  arcs: [Arc, Arc, Arc, Arc];
  educationHeading: string;
  education: {
    school: string;
    degree: string;
    years: string;
    courses: string[];
    certification: string;
  };
  goalsHeading: string;
  goals: string;
  goalsLinks: [Link, Link];
}

export interface WorkCopy {
  missionsHeading: string;
  skillsHeading: string;
  galleryHeading: string;
  galleryNote: string;
  closing: Link;
}

export interface ContactCopy {
  h1: string;
  line: string;
  workLink: Link;
  prompt: string;
  channelsHeading: string;
  messageHeading: string;
  form: {
    lead: string;
    name: string;
    email: string;
    message: string;
    submit: string;
  };
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
