import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { seo } from "../../src/data/seo";

const routes = ["/", "/about/", "/work/", "/contact/", "/thanks/"];

for (const route of routes) {
  test(`${route} loads with one h1, description, canonical and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
    page.on("pageerror", (err) => errors.push(String(err)));

    const response = await page.goto(route);
    expect(response?.status()).toBe(200);

    await expect(page.locator("h1")).toHaveCount(1);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.trim().length).toBeGreaterThan(0);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https:\/\/.+\/$/);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);

    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });
}

// SEO (docs/SEO.md §3): titles and descriptions are fixed values; every indexed H1 holds a target keyword.
const KEYWORDS = /product market(er|ing)|aden khan/i;
for (const meta of Object.values(seo).filter((s) => !s.noindex)) {
  test(`${meta.path} has its SEO.md title, description and a keyword H1`, async ({ page }) => {
    await page.goto(meta.path);
    await expect(page).toHaveTitle(meta.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", meta.description);
    const h1 = page.locator("h1");
    await expect(h1).toContainText(meta.h1);
    // textContent, not innerText: on a first visit the Home H1 sits under the intro overlay.
    await expect(h1).toContainText(KEYWORDS);
  });
}

test("unknown route returns 404 with one h1", async ({ page }) => {
  const response = await page.goto("/this-route-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("the phone number from cv-source.md never appears in the built site", () => {
  const source = readFileSync("docs/cv-source.md", "utf8");
  const phone = source.match(/\+92-\d{3}-\d{7}/)?.[0];
  expect(phone).toBeTruthy();
  const digits = phone!.replace(/\D/g, "").slice(-7);

  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? files(path) : /\.(html|txt|xml)$/.test(name) ? [path] : [];
    });
  for (const file of files("dist")) {
    expect(readFileSync(file, "utf8").replace(/\D/g, ""), file).not.toContain(digits);
  }
});
