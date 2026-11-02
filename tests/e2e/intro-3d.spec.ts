import { expect, test } from "@playwright/test";

const overlay = "[data-intro]";

// Software WebGL (SwiftShader) in headless CI, so the world is forced on (?world=force). Real devices
// use their GPU; on software-only devices the 2D intro runs, which intro.spec.ts covers.
test.use({
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  },
});

test("the intro plays through the persistent world, then hands the canvas back to the page", async ({
  page,
}) => {
  await page.goto("/?world=force&intro=replay");
  // Software rendering is slow; the under-3 s timing is checked in intro.spec.ts.
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 15000 });
  test.skip(
    (await page.evaluate(() => document.documentElement.dataset.introMode)) !== "3d",
    "The world was not ready within 600 ms on this machine; the 2D version ran instead.",
  );
  // One canvas, the world's: the intro made no WebGL context of its own.
  await expect(page.locator("canvas")).toHaveCount(1);
  await expect(page.locator("canvas.world-canvas")).toHaveCount(1);
  // Back behind the page, running as the ambient Home scene.
  await expect(page.locator("html")).not.toHaveClass(/intro-world/);
  expect(await page.locator("[data-world]").evaluate((el) => getComputedStyle(el).zIndex)).toBe("-1");
  expect(await page.evaluate(() => window.__akWorld?.debug.station)).toBe("home");
});
