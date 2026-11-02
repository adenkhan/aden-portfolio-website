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
  // Since p16 the stats sit in the hero, so a short viewport keeps them below the fold.
  await page.setViewportSize({ width: 1440, height: 480 });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
  // Screen readers always get the real numbers.
  await expect(page.locator("[data-stat] dd .sr-only").first()).toHaveText("−72%");
  // The visual copy starts at zero before the strip is in view.
  await expect(tickers(page).first()).toHaveText("−0%");
  await page.locator("[data-stat]").first().scrollIntoViewIfNeeded();
  await expect(tickers(page)).toHaveText(["−72%", "+40%", "$7K+", "4"], { timeout: 3000 });

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

// Convergence scrub (r7): the section pins for 1.5 screens; the collision lands near the end.
const pinTop = (page: Page) =>
  page.evaluate(() => {
    const st = (window as unknown as { ScrollTrigger?: unknown }).ScrollTrigger;
    void st;
    const spacer =
      document.querySelector("[data-teaser]")!.closest(".pin-spacer") ??
      document.querySelector("[data-teaser]")!;
    return spacer.getBoundingClientRect().top + window.scrollY;
  });

test("teaser: the pinned scroll draws red and blue together into purple", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
  await expect(page.locator(".pin-spacer [data-teaser]")).toHaveCount(1);
  const top = await pinTop(page);
  await page.evaluate(
    (y) => window.__akLenis?.scrollTo(y, { immediate: true }) ?? window.scrollTo(0, y),
    top + 1.5 * 900,
  );
  await expect.poll(() => opacityOf(page, "[data-orb='purple']"), { timeout: 4000 }).toBeGreaterThan(0.9);
  const redX = await page
    .locator("[data-orb='red']")
    .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  expect(redX).toBeGreaterThan(0);
});

test("teaser: resting mid-collision snaps to the start or the end", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/motion-pending/, { timeout: 2000 });
  await expect(page.locator(".pin-spacer [data-teaser]")).toHaveCount(1);
  // Let fonts and the hero settle first: they move the pin's position.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const middle = (await pinTop(page)) + 0.4 * 1.5 * 900;
  await page.evaluate((y) => {
    if (window.__akLenis) window.__akLenis.scrollTo(y, { immediate: true });
    else window.scrollTo(0, y);
  }, middle);
  await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
  // Distance from the nearest end of the pin, measured live.
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const spacer = document.querySelector("[data-teaser]")!.closest(".pin-spacer")!;
          const start = spacer.getBoundingClientRect().top + window.scrollY;
          return Math.round(
            Math.min(Math.abs(window.scrollY - start), Math.abs(window.scrollY - (start + 1350))),
          );
        }),
      { timeout: 5000 },
    )
    .toBeLessThan(4);
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
    await expect(tickers(page)).toHaveText(["−72%", "+40%", "$7K+", "4"]);
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
    await expect(tickers(page)).toHaveText(["−72%", "+40%", "$7K+", "4"]);
    await expect(page.locator('[data-reveal="rise"]').first()).toBeVisible();
    await expect(page.locator("[data-orb='purple']")).toBeAttached();
  });
});
