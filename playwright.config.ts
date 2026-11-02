import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Tests run against the production build. Skipped when BASE_URL points at a deployed site.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npx astro preview --port ${PORT} --force`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
