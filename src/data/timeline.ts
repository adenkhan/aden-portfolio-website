import type { AboutCopy, ContactCopy, WorkCopy } from "./types";

export const about: AboutCopy = {
  h1: "The origin arc: from campaigns to products",
  bio: "I'm a BBA Marketing student at IBA Karachi who fell for the product side of marketing. I started with social campaigns and memes that converted, then moved into analytics, automation and go-to-market work for tech startups. Today I care about one question: why do people adopt a product, and how do we help more of them get there?",
  arcsHeading: "From storytelling to product analytics",
  arcs: [
    {
      order: 1,
      id: "arc-storyteller",
      title: "Storyteller",
      period: "2025",
      text: "Ran LinkedIn and Instagram campaigns for the i2iScale accelerator program, raising awareness 40%.",
      lane: "creative",
    },
    {
      order: 2,
      id: "arc-growth",
      title: "Growth",
      period: "2025",
      text: "At Sadiq.ai, used Amplitude to improve onboarding, retention and feature adoption, and ran Meta campaigns that cut acquisition cost 72%.",
      lane: "both",
    },
    {
      order: 3,
      id: "arc-go-to-market",
      title: "Go-to-market",
      period: "2025–26",
      text: "Researched partners and investors for Leasap, a U.S. proptech startup, and built its outreach pipelines.",
      lane: "data",
    },
    {
      order: 4,
      id: "arc-builder",
      title: "Builder",
      period: "2026",
      text: "At 10Pearls, shipped an SEO content app and automated marketing workflows in HubSpot and n8n.",
      lane: "both",
    },
  ],
  educationHeading: "Education: BBA Marketing at IBA Karachi",
  education: {
    school: "Institute of Business Administration (IBA), Karachi",
    degree: "BBA, Marketing",
    years: "2023–2027",
    courses: [
      "Tech Product Marketing",
      "Tech Product Development",
      "Marketing Analytics",
      "Product Analytics",
      "Machine Learning",
    ],
    certification: "Google Data Analytics Specialization",
  },
  goalsHeading: "Career goals in tech product marketing",
  goals:
    "Join a tech or SaaS company as a product marketer, owning positioning, launches and adoption. Open to internships now and full-time roles from mid-2027.",
  goalsLinks: [
    { label: "See the missions", href: "/work/" },
    { label: "Open a channel", href: "/contact/" },
  ],
};

export const work: WorkCopy = {
  missionsHeading: "Case studies from SaaS and tech startups",
  skillsHeading: "Skills: go-to-market, product analytics and marketing automation",
  galleryHeading: "Creative gallery: campaigns and ad creatives",
  galleryNote: "Ad creatives and campaign results.",
  closing: { label: "Open a channel", href: "/contact/" },
};

export const contact: ContactCopy = {
  h1: "Open a channel",
  line: "Hiring a product marketer, or need help with a launch? My inbox is open.",
  workLink: { label: "See the missions behind this", href: "/work/" },
  prompt: "$ open --channel",
  channelsHeading: "Email, LinkedIn and GitHub",
  messageHeading: "Send a message",
  form: {
    lead: "Prefer email? Write to",
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
  },
  copy: { button: "Copy email", done: "Email copied", failed: "Could not copy. The address is" },
  thanks: { status: "// message sent", line: "Thanks for getting in touch. I will reply by email." },
};
