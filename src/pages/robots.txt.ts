import type { APIRoute } from "astro";
import { SITE_URL } from "@/data/site";

// Generated from SITE_URL so the origin lives in one place (docs/SEO.md §1).
export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap-index.xml\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
