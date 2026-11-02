import { expect, test } from "@playwright/test";

// The Home intro has its own spec (intro.spec.ts); here it is marked as already seen this session.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const pages = [
  { route: "/", h1: "Aden Khan, Product Marketer" },
  { route: "/about/", h1: "Origin arc of a product marketer" },
  { route: "/work/", h1: "Product marketing missions" },
  { route: "/contact/", h1: "Open a channel" },
];

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  for (const { route, h1 } of pages) {
    test(`${route}: no reveal, no smooth scroll, text visible at once`, async ({ page }) => {
      await page.goto(route);
      const html = page.locator("html");
      await expect(html).toHaveAttribute("data-motion", "reduced");
      await expect(html).not.toHaveClass(/motion-pending/);
      await expect(html).not.toHaveClass(/\blenis\b/);
      const heading = page.locator("main h1");
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(h1);
      // SplitText never ran: the heading has no generated line or word wrappers.
      await expect(heading.locator("div")).toHaveCount(0);
    });
  }

  test("home: no particles and no pointer glow", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);
    await expect(page.locator("[data-ambient-particles] canvas")).toHaveCount(0);
    await page.locator("[data-pointer-glow-host]").hover();
    await expect(page.locator("[data-pointer-glow]")).toHaveCSS("opacity", "0");
  });
});

test.describe("full motion (desktop)", () => {
  for (const { route, h1 } of pages) {
    test(`${route}: headline reveals and keeps its accessible name`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
      await expect(page.locator("html")).toHaveClass(/\blenis\b/);
      await expect(page.getByRole("heading", { level: 1, name: new RegExp(h1.slice(0, 20)) })).toBeVisible();
      // Words end at their resting position.
      await expect
        .poll(() =>
          page.evaluate(() => {
            const words = [...document.querySelectorAll<HTMLElement>("main h1 div div")];
            return (
              words.length > 0 &&
              words.every(
                (w) =>
                  getComputedStyle(w).transform === "none" ||
                  w.style.transform.includes("translate(0px, 0px)") ||
                  w.style.transform === "",
              )
            );
          }),
        )
        .toBe(true);
    });
  }

  test("home: particles load at idle and the pointer glow follows the cursor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-ambient-particles] canvas")).toHaveCount(1, { timeout: 5000 });
    const card = page.locator("[data-pointer-glow-host]");
    await card.hover({ position: { x: 60, y: 80 } });
    await expect
      .poll(async () =>
        Number(await page.locator("[data-pointer-glow]").evaluate((el) => getComputedStyle(el).opacity)),
      )
      .toBeGreaterThan(0.5);
  });

  test("headline stays readable when the motion bundle fails to load", async ({ page }) => {
    await page.route(/BaseLayout\.astro_astro_type_script.*\.js$/, (route) => route.abort());
    await page.goto("/about/");
    // The inline gate removes html.motion-pending after 2.5 s even if motion never boots.
    await expect(page.locator("main h1")).toBeVisible({ timeout: 4000 });
  });

  test("the dev FPS overlay is not in the production build", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1200);
    await expect(page.getByText(/\d+ fps ·/)).toHaveCount(0);
  });
});
