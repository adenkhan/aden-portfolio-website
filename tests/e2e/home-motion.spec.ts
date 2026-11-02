import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const tickers = (page: Page) => page.locator("[data-count]");
const opacityOf = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

test("hero entrance ends fully visible and the stat bars fill", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
  for (const el of await page.locator('[data-reveal="rise"]').all()) {
    await expect.poll(() => el.evaluate((n) => Number(getComputedStyle(n).opacity))).toBe(1);
  }
  await expect
    .poll(() =>
      page
        .locator("[data-bar]")
        .evaluateAll((bars) => bars.every((b) => new DOMMatrix(getComputedStyle(b).transform).a > 0.99)),
    )
    .toBe(true);
});

test("stats count up once when scrolled into view and end on the real values", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 700 });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
  // Screen readers always get the real numbers.
  await expect(page.locator("[data-stat] dd .sr-only").first()).toHaveText("−72%");
  // The visual copy starts at zero before the strip is in view.
  await expect(tickers(page).first()).toHaveText("−0%");
  await page.locator("[data-stat]").first().scrollIntoViewIfNeeded();
  await expect(tickers(page)).toHaveText(["−72%", "+40%", "$7,000+", "4"], { timeout: 3000 });

  // Same session, second view: real values at once, no count.
  await page.reload();
  await expect(tickers(page).first()).toHaveText("−72%");
});

test("counting never shifts layout", async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceEntry[] &
        { value: number; hadRecentInput: boolean }[])
        if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto("/");
  await page.locator("[data-stat]").first().scrollIntoViewIfNeeded();
  await expect(tickers(page).first()).toHaveText("−72%", { timeout: 3000 });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01);
});

test("teaser: scrolling draws red and blue together into purple", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
  await page.locator("[data-collide]").evaluate((el) => el.scrollIntoView({ block: "start" }));
  await expect.poll(() => opacityOf(page, "[data-orb='purple']"), { timeout: 3000 }).toBeGreaterThan(0.9);
  const redX = await page
    .locator("[data-orb='red']")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  expect(redX).toBeGreaterThan(0);
});

test("character card tilts on hover (desktop)", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
  await page.waitForTimeout(900);
  const card = page.locator('[data-reveal="card"]');
  await card.hover({ position: { x: 20, y: 20 } });
  await page.mouse.move(30, 30, { steps: 2 });
  await card.hover({ position: { x: 380, y: 40 } });
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el).transform.startsWith("matrix3d")))
    .toBe(true);
});

test("optional Rive and Lottie stay off while their files are absent", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas.rive-avatar")).toHaveCount(0);
  await expect(page.locator('meta[name="ak-lottie-cv-burst"]')).toHaveCount(0);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("final state at once: hero, bars, numbers, teaser; no tilt", async ({ page }) => {
    await page.goto("/");
    for (const el of await page.locator('[data-reveal="rise"]').all()) {
      expect(await el.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    }
    expect(
      await page
        .locator("[data-bar]")
        .first()
        .evaluate((b) => getComputedStyle(b).transform),
    ).toBe("none");
    await expect(tickers(page)).toHaveText(["−72%", "+40%", "$7,000+", "4"]);
    await page.locator("[data-collide]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await page.locator("[data-orb='red']").evaluate((el) => getComputedStyle(el).transform)).toBe(
      "none",
    );
    const card = page.locator('[data-reveal="card"]');
    await card.hover({ position: { x: 380, y: 40 } });
    await page.waitForTimeout(300);
    expect(await card.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("numbers and hero copy are final and visible", async ({ page }) => {
    await page.goto("/");
    await expect(tickers(page)).toHaveText(["−72%", "+40%", "$7,000+", "4"]);
    await expect(page.locator('[data-reveal="rise"]').first()).toBeVisible();
    await expect(page.locator("[data-orb='purple']")).toBeAttached();
  });
});
