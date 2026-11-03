import type { AboutCopy, ContactCopy, WorkCopy } from "./types";

// Round 2 copy (r2), word for word from the owner. H1s live in seo.ts.
export const about: AboutCopy = {
  bio: [
    "Started making memes that sold.",
    "Got curious about why they worked.",
    "Now I work where product, data and marketing meet.",
  ],
  arcsHeading: "Origin arc, 2025 to 2026",
  arcs: [
    {
      order: 1,
      id: "arc-invest2innovate",
      period: "2025",
      org: "Invest2Innovate",
      line: "Campaigns that got founders to notice an accelerator.",
      chip: "+40% reach",
      lane: "creative",
    },
    {
      order: 2,
      id: "arc-sadiq",
      period: "2025",
      org: "Sadiq.ai",
      line: "Onboarding, adoption and paid growth for a social commerce app.",
      chip: "−72% CAC",
      lane: "both",
    },
    {
      order: 3,
      id: "arc-leasap",
      period: "2025–26",
      org: "Leasap",
      line: "Go-to-market research and outreach for a U.S. proptech startup.",
      chip: "Pipeline built",
      lane: "data",
    },
    {
      order: 4,
      id: "arc-10pearls",
      period: "2026",
      org: "10Pearls",
      line: "Shipped an SEO app and automated the marketing funnel.",
      chip: "2 tools shipped",
      lane: "both",
    },
  ],
  chipsHeading: "Education and certification",
  chips: ["IBA Karachi · BBA Marketing · Class of 2027", "Google Data Analytics certified"],
  questLabel: "Next quest",
  quest: "Product marketing at a tech company. Internships now, full-time from mid-2027.",
  questLinks: [
    { label: "See the missions", href: "/work/" },
    { label: "Open a channel", href: "/contact/" },
  ],
};

export const work: WorkCopy = {
  missionsHeading: "Case studies",
  skillsHeading: "Skills",
  galleryHeading: "Creative drops",
  caseLabels: { company: "Company", problem: "Problem", move: "Move", result: "Result" },
  illustrative: "illustrative",
  sequenceLabel: "Case studies, scroll to move through them",
  takeover: { open: "Open full screen:", close: "Close case", dialog: "Case study" },
};

export const contact: ContactCopy = {
  line: "Hiring a product marketer? Say hi.",
  channelsHeading: "Email, LinkedIn, GitHub and CV",
  messageHeading: "Send a message",
  form: {
    name: "Name",
    email: "Email",
    message: "Message",
    submit: "Send message",
    errors: {
      name: "Enter your name.",
      email: "Enter your email address.",
      emailFormat: "Enter an email address like name@example.com.",
      message: "Write a message.",
    },
    summary: "Check {count}: {fields}.",
    sending: "Sending…",
  },
  copy: { button: "Copy email", done: "Email copied", failed: "Could not copy. The address is" },
  thanks: {
    status: "// message sent",
    line: "Thanks for getting in touch. I will reply by email.",
    fallback: "Prefer email? Write to",
  },
};
