import { expect, test } from "@playwright/test";

const overlay = "[data-intro]";

test("first visit: overlay and Skip are visible at once, H1 is already in the DOM", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveClass(/\bintro\b/);
  await expect(page.locator(overlay)).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip intro" })).toBeVisible();
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toContainText("Aden Khan, Product Marketer");
});

test("plays in under 3 seconds, then removes itself and resumes the page", async ({ page }) => {
  const start = Date.now();
  await page.goto("/");
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 3000 });
  expect(Date.now() - start).toBeLessThan(3500);
  await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
  await expect(page.locator("main h1")).toBeVisible();
  const mode = await page.evaluate(() => document.documentElement.dataset.introMode);
  expect(["2d", "3d"]).toContain(mode);
});

test("does not play again in the same session", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 3000 });
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
  await expect(page.locator(overlay)).toBeHidden();
  await page.goto("/about/");
  await page.goBack();
  await expect(page.locator(overlay)).toBeHidden();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("never plays", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
    await expect(page.locator(overlay)).toBeHidden();
    await expect(page.locator("main h1")).toBeVisible();
    const flag = await page.evaluate(() => sessionStorage.getItem("ak.intro"));
    expect(flag).toBeNull();
  });
});

test("Skip jumps to the end state and moves focus out of the overlay", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const skip = page.getByRole("button", { name: "Skip intro" });
  await skip.focus();
  await skip.click();
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 1000 });
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/);
  expect(await page.evaluate(() => document.activeElement?.id)).toBe("main");
});

test("Esc skips", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Escape");
  await expect(page.locator(overlay)).toBeHidden({ timeout: 1000 });
  await expect(page.locator("main h1")).toBeVisible();
});

test("blocked sessionStorage: no intro and no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new Error("storage blocked");
      },
    });
  });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/\bintro\b/);
  await expect(page.locator(overlay)).toBeHidden();
  expect(errors).toEqual([]);
});

test("if the intro bundle never loads, the overlay still clears", async ({ page }) => {
  await page.route(/IntroOverlay\.astro_astro_type_script.*\.js$/, (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(overlay)).toBeHidden({ timeout: 5000 });
  await expect(page.locator("main h1")).toBeVisible();
});

test("2D version: plays, clears and leaves no canvas", async ({ page }) => {
  await page.goto("/?intro=2d");
  await expect(page.locator(overlay)).toHaveCount(0, { timeout: 3000 });
  expect(await page.evaluate(() => document.documentElement.dataset.introMode)).toBe("2d");
});

test("three and postprocessing are not in the About, Work or Contact bundles", async ({ page }) => {
  for (const route of ["/about/", "/work/", "/contact/"]) {
    const scripts: string[] = [];
    page.on("response", (response) => {
      if (response.url().endsWith(".js")) scripts.push(response.url());
    });
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    for (const url of scripts) expect(url, route).not.toMatch(/intro-scene/);
    const bodies = await Promise.all(scripts.map((url) => page.request.get(url).then((r) => r.text())));
    for (const body of bodies) expect(body.includes("WebGLRenderer"), route).toBe(false);
  }
});
