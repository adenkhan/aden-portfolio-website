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

/**
 * Work (r10): the campaign shelf as an ItemList of CreativeWork (what is on the page: name, caption,
 * cover image, client) and the SEO tool from case study 3 as a SoftwareApplication. Nothing beyond
 * what the page shows: no dates, ratings or results.
 */
export function workJsonLd(
  works: Array<{ name: string; description: string; image: string; client: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/work/#campaigns`,
        name: "Campaign shelf",
        itemListElement: works.map((w, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            name: w.name,
            description: w.description,
            image: w.image,
            creator: { "@id": personId },
            about: { "@type": "Thing", name: w.client },
          },
        })),
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/work/#seo-tool`,
        name: "SEO Tool",
        applicationCategory: "BusinessApplication",
        url: "https://internal-tool-seo-g8de.vercel.app/create",
        creator: { "@id": personId },
      },
    ],
  };
}
