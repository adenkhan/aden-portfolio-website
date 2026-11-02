import { expect, test } from "@playwright/test";

// The Home intro has its own spec (intro.spec.ts); here it is marked as already seen this session.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const routes = [
  { route: "/", name: "home" },
  { route: "/about/", name: "about" },
  { route: "/work/", name: "work" },
  { route: "/contact/", name: "contact" },
];
const widths = [360, 375, 768, 1440];

for (const { route, name } of routes) {
  for (const width of widths) {
    test(`${route} has no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);

      // SAVE_SCREENS=1 writes the reference screenshots kept in docs/screens/.
      if (process.env.SAVE_SCREENS && (width === 375 || width === 1440)) {
        // Let the headline reveal and HUD scramble finish so the screenshot shows the resting state.
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `docs/screens/${name}-${width}.png`, fullPage: true });
      }
    });
  }
}
