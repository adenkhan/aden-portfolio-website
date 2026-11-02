import type { PageId, PageSeo } from "./types";

export const seo: Record<PageId, PageSeo> = {
  home: {
    id: "home",
    path: "/",
    title: "Aden Khan, Product Marketer | Portfolio",
    description:
      "Aden Khan is a product marketer in Karachi blending storytelling, analytics and automation to drive adoption and growth for tech products.",
    h1: "Aden Khan, Product Marketer",
    ogImageAlt: "Aden Khan, Product Marketer: portfolio card with red and blue orbs meeting in purple",
  },
  about: {
    id: "about",
    path: "/about/",
    title: "About Aden Khan, Product Marketing | IBA Karachi",
    description:
      "IBA Karachi BBA Marketing student focused on tech product marketing, product analytics and go-to-market. Background, education and goals.",
    h1: "Origin arc of a product marketer",
    ogImageAlt: "The origin arc: Aden Khan's path from campaigns to products",
  },
  work: {
    id: "work",
    path: "/work/",
    title: "Product Marketing Projects & Skills | Aden Khan",
    description:
      "Product marketing case studies: 72% lower CAC at Sadiq.ai, an SEO content app at 10Pearls, automation in HubSpot and n8n, and more.",
    h1: "Product marketing missions",
    ogImageAlt: "Product marketing missions completed by Aden Khan",
  },
  contact: {
    id: "contact",
    path: "/contact/",
    title: "Contact Aden Khan, Product Marketer",
    description:
      "Hiring for product marketing? Reach Aden Khan by email or LinkedIn. Open to internships and full-time roles from mid-2027.",
    h1: "Open a channel",
    h1Sub: "Contact Aden Khan, product marketer",
    ogImageAlt: "Open a channel: contact Aden Khan, product marketer",
  },
  thanks: {
    id: "thanks",
    path: "/thanks/",
    title: "Message received | Aden Khan",
    description: "Thanks for getting in touch. Aden Khan will reply by email.",
    h1: "Message received",
    ogImageAlt: "Aden Khan, Product Marketer",
    noindex: true,
  },
  "404": {
    id: "404",
    path: "/404/",
    title: "Page not found | Aden Khan",
    description: "This page does not exist. Go to Aden Khan’s product marketing work or contact page.",
    h1: "Page not found",
    ogImageAlt: "Aden Khan, Product Marketer",
    noindex: true,
  },
};
