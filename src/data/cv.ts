import type { CvPreview } from "./types";

// Preview card in the CV dialog. Every line is taken from docs/cv-source.md (no phone number).
export const cvPreview: CvPreview = {
  title: "Aden Khan, CV",
  summary: "Product Marketer · Karachi, Pakistan",
  education: "Institute of Business Administration (IBA), Karachi · BBA, Marketing · August 2023 – June 2027",
  roles: [
    { org: "10Pearls", title: "Marketing Automation Associate", dates: "Feb 2026 – May 2026" },
    { org: "Leasap.com", title: "Business Development Intern", dates: "Oct 2025 – Jan 2026" },
    { org: "Sadiq.ai", title: "Product Marketing Associate", dates: "Jun 2025 – Sep 2025" },
    { org: "Invest2Innovate (i2i)", title: "Marketing Associate", dates: "Feb 2025 – May 2025" },
  ],
  certification: "Google Data Analytics Specialization (Google via Coursera)",
  download: "Download PDF",
  open: "Open in new tab",
  close: "Close",
};
