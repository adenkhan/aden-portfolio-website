import { expect, test, type Page } from "@playwright/test";

// The VRoid avatar (r9, docs/MOTION.md §24, docs/ASSETS.md).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const modelRequests = (page: Page) => {
  const hits: string[] = [];
  page.on("request", (r) => {
    if (r.url().endsWith("/models/avatar.vrm")) hits.push(r.url());
  });
  return hits;
};

test("the hero poster rendered from the model is the LCP image", async ({ page }) => {
  await page.goto("/?world=off");
  const poster = page.locator("img[data-avatar-poster]");
  await expect(poster).toHaveAttribute("alt", "3D anime avatar of Aden Khan, product marketer");
  await expect(poster).toHaveAttribute("fetchpriority", "high");
  await expect(poster).toBeVisible();
  expect(await poster.getAttribute("src")).toMatch(/avatar\..*webp/);
});

test.describe("live model", () => {
  test.setTimeout(120_000);
  test("loads after first paint, swaps in over the poster, has the expressions it uses, and keeps rendering through every pose", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on(
      "console",
      (m) => m.type() === "error" && !m.text().includes("GL Driver") && errors.push(m.text()),
    );
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?world=force");
    // She loads on the first interaction (or 6 s after load): a pointer move starts it.
    await page.mouse.move(40, 40);
    await page.mouse.move(60, 60);
    await expect(page.locator("html")).toHaveAttribute("data-avatar", "live", { timeout: 90_000 });
    await expect(page.locator("[data-avatar-clear]")).toHaveClass(/is-live/, { timeout: 10_000 });
    await expect
      .poll(() => page.locator("img[data-avatar-poster]").evaluate((n) => getComputedStyle(n).opacity))
      .toBe("0");
    const expressions = await page.evaluate(
      () =>
        (window.__akWorld!.world.overlay as unknown as { rig: { expressions: string[] } }).rig.expressions,
    );
    for (const name of ["happy", "surprised", "angry", "relaxed", "blink"])
      expect(expressions).toContain(name);
    // Regression: GSAP's _gsap key on the pose weights once threw every frame and froze the world.
    for (const pose of ["wave", "point", "castReady", "castCharge", "castRelease", "idle"]) {
      const before = await page.evaluate(() => window.__akWorld!.debug.frames);
      await page.evaluate(
        (n) =>
          (
            window.__akWorld!.world.overlay as unknown as { rig: { pose(n: string, d: number): void } }
          ).rig.pose(n, 0.05),
        pose,
      );
      await expect
        .poll(() => page.evaluate(() => window.__akWorld!.debug.frames), { timeout: 10_000 })
        .toBeGreaterThan(before + 2);
    }
    expect(errors).toEqual([]);
  });
});

test("without usable WebGL the poster stays and the model is never downloaded", async ({ page }) => {
  // Headless Chromium has only software WebGL, which the world treats as unusable unless forced.
  const hits = modelRequests(page);
  await page.goto("/");
  await page.waitForTimeout(3000);
  expect(hits).toEqual([]);
  await expect(page.locator("img[data-avatar-poster]")).toBeVisible();
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("poster only: no live model, no download", async ({ page }) => {
    const hits = modelRequests(page);
    await page.goto("/?world=force");
    await page.mouse.move(40, 40);
    await page.waitForTimeout(3000);
    expect(hits).toEqual([]);
    await expect(page.locator("html")).not.toHaveAttribute("data-avatar", /.+/);
    await expect(page.locator("img[data-avatar-poster]")).toBeVisible();
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the poster is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("img[data-avatar-poster]")).toBeVisible();
  });
});

test("each page has its own rendered social card", async ({ page }) => {
  for (const [path, name] of [
    ["/", "home"],
    ["/about/", "about"],
    ["/work/", "work"],
    ["/contact/", "contact"],
  ]) {
    await page.goto(path);
    expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain(`/${name}.`);
  }
});
