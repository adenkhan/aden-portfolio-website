import { SITE_URL, site } from "@/data/site";

const personId = `${SITE_URL}/#person`;

/** Home: one @graph with WebSite and Person (docs/SEO.md §7). */
export function homeJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: "Aden Khan, Product Marketer",
        inLanguage: "en",
        publisher: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: site.name,
        jobTitle: site.role,
        url: `${SITE_URL}/`,
        email: `mailto:${site.email}`,
        address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
        alumniOf: { "@type": "CollegeOrUniversity", name: "Institute of Business Administration, Karachi" },
        sameAs: [site.linkedin, site.github],
      },
    ],
  };
}

/** About: ProfilePage whose main entity is the Person defined on Home. */
export function aboutJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${SITE_URL}/about/`,
    mainEntity: { "@id": personId },
  };
}
