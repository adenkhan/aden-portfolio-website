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

test.describe("r8b manga panels", () => {
  test("desktop: pinned; each step slams a panel, lights its node and shakes the camera; rest snaps to a beat", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      (window as unknown as { __hits: number[] }).__hits = [];
      addEventListener("ak:arc-lit", (e) =>
        (window as unknown as { __hits: number[] }).__hits.push(
          (e as CustomEvent<{ count: number }>).detail.count,
        ),
      );
      (window as unknown as { __impacts: number }).__impacts = 0;
      addEventListener("ak:impact", () => (window as unknown as { __impacts: number }).__impacts++);
    });
    await page.goto("/about/");
    await expect(page.locator(".pin-spacer [data-arc-panel]")).toHaveCount(4);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const pin = () =>
      page.evaluate(() => {
        const s = document.querySelector("[data-arc-panel]")!.closest(".pin-spacer")!;
        const top = s.getBoundingClientRect().top + window.scrollY;
        const inner = s.firstElementChild as HTMLElement;
        return {
          top: top + (inner.offsetHeight - innerHeight) / 2,
          len: s.clientHeight - inner.offsetHeight,
        };
      });
    const { top, len } = await pin();
    // Rest 30% of the way into the second step: it snaps to that step's beat.
    const y = top + len * 0.3;
    await page.evaluate(
      (t) => window.__akLenis?.scrollTo(t, { immediate: true }) ?? window.scrollTo(0, t),
      y,
    );
    await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
    await expect
      .poll(() => page.evaluate(() => Math.round(window.scrollY)), { timeout: 5000 })
      .toBeGreaterThan(Math.round(top + len * 0.375 - 6));
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBeLessThan(
      Math.round(top + len * 0.375 + 6),
    );
    // Two panels slammed: two node beats, two camera impacts; the later panels still wait.
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __hits: number[] }).__hits))
      .toEqual([1, 2]);
    expect(await page.evaluate(() => (window as unknown as { __impacts: number }).__impacts)).toBe(2);
    expect(
      await page
        .locator("[data-arc-panel]")
        .nth(3)
        .evaluate((n) => getComputedStyle(n).opacity),
    ).toBe("0");
    // Ink and invert are cleared once each slam ends.
    await expect(page.locator("[data-arc-panel].is-inking")).toHaveCount(0);
    expect(
      await page
        .locator("[data-arc-panel]")
        .first()
        .evaluate((n) => getComputedStyle(n).filter),
    ).toBe("none");
  });
});

test.describe("r8b reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("arcs: no pin, every panel already in place, no bursts", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about/");
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    for (const panel of await page.locator("[data-arc-panel]").all())
      expect(await panel.evaluate((n) => getComputedStyle(n).opacity)).toBe("1");
    expect(
      await page
        .locator("[data-chip-burst]")
        .first()
        .evaluate((n) => getComputedStyle(n).opacity),
    ).toBe("0");
  });
});
