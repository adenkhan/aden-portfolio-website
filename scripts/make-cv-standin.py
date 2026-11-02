"""Generate the stand-in CV at public/cv/aden-khan-cv.pdf from docs/cv-source.md facts.

Needs reportlab (pip install reportlab). The owner's real CV replaces the PDF later; this
script is only for regenerating the stand-in. The phone number is left out on purpose:
the site never publishes it (CLAUDE.md).
"""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

OUT = Path(__file__).resolve().parent.parent / "public" / "cv" / "aden-khan-cv.pdf"
INK = HexColor("#0B0D1A")
MUTED = HexColor("#4A4F6E")
ACCENT = HexColor("#C2185B")

name = ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=20, leading=23, textColor=INK)
role = ParagraphStyle("role", fontName="Helvetica", fontSize=10.5, leading=14, textColor=MUTED)
h2 = ParagraphStyle("h2", fontName="Helvetica-Bold", fontSize=10, leading=13, textColor=ACCENT,
                    spaceBefore=8, spaceAfter=3)
job = ParagraphStyle("job", fontName="Helvetica-Bold", fontSize=9.5, leading=12.5, textColor=INK,
                     spaceBefore=4)
body = ParagraphStyle("body", fontName="Helvetica", fontSize=9, leading=12, textColor=INK)
bullet = ParagraphStyle("bullet", parent=body, leftIndent=9, bulletIndent=0)
note = ParagraphStyle("note", fontName="Helvetica-Oblique", fontSize=7.5, leading=10, textColor=MUTED)


def b(text: str) -> Paragraph:
    return Paragraph(text, bullet, bulletText="•")


story = [
    Paragraph("Aden Khan", name),
    Paragraph("Product Marketer · Karachi, Pakistan", role),
    Paragraph("aden.khan613@gmail.com · linkedin.com/in/adenkhank · github.com/adenkhan", role),
    Spacer(1, 4),
    Paragraph("Education", h2),
    Paragraph("Institute of Business Administration (IBA), Karachi: BBA, Marketing, "
              "August 2023 – June 2027", job),
    Paragraph("Relevant courses: Tech Product Marketing, Tech Product Development, Marketing "
              "Analytics, Machine Learning, Product Analytics.", body),
    Paragraph("Experience", h2),
    Paragraph("10Pearls, Karachi: Marketing Automation Associate, Feb 2026 – May 2026", job),
    b("Built and maintained marketing automation workflows in HubSpot and n8n, connecting lead "
      "capture, enrichment, lifecycle emails and CRM handoffs to cut manual work for the "
      "marketing team."),
    b("Designed and shipped an internal SEO content application for article writing, integrating "
      "Ahrefs keyword recommendations and competitor research into a single drafting workflow."),
    b("Developed a keyword cannibalization checker that flags overlapping search intent against "
      "existing pages before publishing, protecting rankings on priority topics."),
    Paragraph("Leasap.com, Remote (USA): Business Development Intern, Oct 2025 – Jan 2026", job),
    b("Outbound business development and partnerships research across U.S. MLS organizations, "
      "proptech founders, real estate operators and data vendors to support early GTM efforts."),
    b("Built and managed structured outreach pipelines in LinkedIn Sales Navigator targeting VC "
      "partners, real estate coaches, brokers, property managers and potential customers."),
    b("Researched and tracked accelerator, incubator and investor programs in a centralized "
      "funding master sheet, targeting 1–2 applications per week."),
    Paragraph("Sadiq.ai, Karachi: Product Marketing Associate, Jun 2025 – Sep 2025", job),
    b("Used Amplitude to boost onboarding, retention and feature adoption across web and mobile."),
    b("Produced pitch decks, sales enablement assets and user research insights to support "
      "platform monetization."),
    b("Created whitepapers and case studies positioning Sadiq.ai as a growth partner for online "
      "sellers."),
    b("Launched performance-driven B2C Meta ad campaigns, reducing customer acquisition cost by 72%."),
    Paragraph("Invest2Innovate (i2i), Karachi: Marketing Associate, Feb 2025 – May 2025", job),
    b("Designed and ran LinkedIn and Instagram campaigns for i2iScale targeting founders and LPs."),
    b("Increased program awareness by 40% through reels, carousels and storytelling assets."),
    b("Led campaign reporting, performance analysis and stakeholder alignment across 3 concurrent "
      "initiatives."),
    Paragraph("Certification", h2),
    Paragraph("Google Data Analytics Specialization (Google via Coursera): analytics lifecycle, "
              "SQL, R, spreadsheets, Tableau.", body),
    Paragraph("Extracurricular", h2),
    Paragraph("IBA Animation and Pop Culture Society: Marketing and Outreach Manager", job),
    b("Secured $7,000+ in sponsorship funding through 15+ tailored partnership proposals."),
    b("Drove 1,500+ follower growth in six months with $300 monthly campaigns and targeted content."),
    Paragraph("Skills", h2),
    Paragraph("<b>Growth, marketing and automation:</b> performance marketing, B2B and B2C lead "
              "generation, CRO, social media strategy, Meta Ads, Google Ads, LinkedIn Ads, TikTok "
              "Ads, HubSpot, Mailchimp, Apollo.io, ManyChat, n8n, Zapier.", body),
    Spacer(1, 2),
    Paragraph("<b>Analytics, reporting and content:</b> Google Analytics 4, Amplitude, Google Tag "
              "Manager, Looker Studio, Sprout Social, Canva, Adobe Photoshop, CapCut, Premiere Pro "
              "(basic), Figma (basic).", body),
    Spacer(1, 8),
    Paragraph("Stand-in CV generated from the portfolio's source facts. The final CV will replace "
              "this file.", note),
]

OUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm,
                        topMargin=14 * mm, bottomMargin=12 * mm, title="Aden Khan CV",
                        author="Aden Khan", subject="Product Marketer CV")
doc.build(story)
print(f"wrote {OUT}")
