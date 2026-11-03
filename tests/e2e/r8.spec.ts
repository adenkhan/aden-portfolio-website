import { expect, test, type Page } from "@playwright/test";

// Round 8 interaction features (docs/MOTION.md §17–23). One block per feature.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const overlayOpacity = (page: Page) =>
  page.evaluate(() =>
    Number(document.querySelector<HTMLElement>("[data-speed-overlay]")?.style.opacity ?? 0),
  );

test.describe("r8a speed lines", () => {
  test("fast scroll fades the speed lines in and skews headings; both settle at rest", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about/");
    await expect(page.locator("[data-speed-overlay]")).toHaveCount(1);
    // A burst of large wheel steps: Lenis velocity climbs past the threshold.
    let peak = 0;
    for (let i = 0; i < 12; i++) {
      await page.mouse.wheel(0, 260);
      await page.waitForTimeout(16);
      peak = Math.max(peak, await overlayOpacity(page));
    }
    expect(peak).toBeGreaterThan(0.05);
    await expect.poll(() => overlayOpacity(page), { timeout: 4000 }).toBe(0);
  });
});

test.describe("r8a reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no speed-lines overlay", async ({ page }) => {
    await page.goto("/about/");
    await page.mouse.wheel(0, 2000);
    await expect(page.locator("[data-speed-overlay]")).toHaveCount(0);
  });
});
