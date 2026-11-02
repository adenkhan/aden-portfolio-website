// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE_URL } from "./src/data/site.ts";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  build: { format: "directory" },
  integrations: [react(), sitemap({ filter: (page) => !/\/(thanks|404)\/?$/.test(page) })],
  vite: {
    plugins: [tailwindcss()],
  },
});
