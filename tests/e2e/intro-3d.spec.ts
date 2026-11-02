import { expect, test } from "@playwright/test";

const overlay = "[data-intro]";

// Software WebGL (SwiftShader) so the 3D intro can run in headless CI. Real devices use their GPU.
test.use({
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  },
});
test("renders with WebGL, then disposes every geometry and texture and drops the context", async ({
  page,
}) => {
  await page.goto("/?intro=3d");
  // Software rendering is slow; the under-3 s timing is checked in intro.spec.ts.
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 12000 });
  test.skip(
    (await page.evaluate(() => document.documentElement.dataset.introMode)) !== "3d",
    "No WebGL in this browser; the 2D version ran instead.",
  );
  // Disposal runs at idle; software WebGL makes it slow, so allow time.
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.introGl), { timeout: 15000 })
    .toBe("disposed:0,0");
  await expect(page.locator("canvas.intro-canvas")).toHaveCount(0);
});
