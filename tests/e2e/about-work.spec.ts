import { expect, test, type Locator } from "@playwright/test";

const settled = (el: Locator) =>
  el.evaluate((n) => {
    const s = getComputedStyle(n);
    const m = new DOMMatrix(s.transform);
    return Number(s.opacity) === 1 && Math.abs(m.m41) < 0.5 && Math.abs(m.m42) < 0.5 && Math.abs(m.b) < 0.001;
  });

test("About: origin-arc panels assemble and settle; education and goals reveal", async ({ page }) => {
  await page.goto("/about/");
  for (const panel of await page.locator("[data-arc-panel]").all()) {
    await panel.scrollIntoViewIfNeeded();
    await expect.poll(() => settled(panel), { timeout: 3000 }).toBe(true);
  }
  for (const section of await page.locator('[data-reveal="section"]').all()) {
    await section.scrollIntoViewIfNeeded();
    await expect.poll(() => settled(section), { timeout: 3000 }).toBe(true);
  }
  // No pinning on About.
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});

test("Work: mission cards enter as a group; thumbnails never fade (LCP)", async ({ page }) => {
  await page.goto("/work/");
  const firstThumb = page.locator("[data-mission] img").first();
  expect(await firstThumb.evaluate((img) => getComputedStyle(img.closest("[data-mission]")!).opacity)).toBe(
    "1",
  );
  for (const card of (await page.locator("[data-mission]").all()).slice(0, 4)) {
    await card.scrollIntoViewIfNeeded();
    await expect.poll(() => settled(card), { timeout: 3000 }).toBe(true);
    await expect
      .poll(() => card.locator("[data-mission-result]").evaluate((n) => getComputedStyle(n).opacity))
      .toBe("1");
  }
});

test("Work: skills tree draws SVG branches; skills stay real text", async ({ page }) => {
  await page.goto("/work/");
  const tree = page.locator("[data-tree]");
  // The SVG is built when the tree comes near the viewport.
  await tree.scrollIntoViewIfNeeded();
  await expect(tree).toHaveClass(/svg-ready/);
  await expect(tree.locator("svg.tree-svg path")).toHaveCount(5); // trunk + 4 branches
  await expect
    .poll(
      () =>
        tree
          .locator("[data-tree-chip]")
          .last()
          .evaluate((n) => getComputedStyle(n).opacity),
      {
        timeout: 4000,
      },
    )
    .toBe("1");
  await expect(tree.getByText("Amplitude", { exact: true })).toBeVisible();
});

test("Work: gallery pins and scrolls sideways on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/");
  const gallery = page.locator("[data-gallery]");
  await expect(gallery).toHaveClass(/pinned/);
  const track = page.locator("[data-gallery-track]");
  // Scroll 600 px past the pin start; the strip should have moved sideways.
  await page.evaluate(() => {
    const top = document.querySelector("[data-gallery]")!.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + 600);
  });
  await expect
    .poll(() => track.evaluate((n) => new DOMMatrix(getComputedStyle(n).transform).m41), { timeout: 3000 })
    .toBeLessThan(-50);
  // Images are lazy and keep their slot alt text.
  const imgs = track.locator("img");
  await expect(imgs.first()).toHaveAttribute("loading", "lazy");
  await expect(imgs.first()).toHaveAttribute(
    "alt",
    "Meta ad creative for Sadiq.ai Blessed Friday sale, 89% off",
  );
});

test("Work: no pin on narrow screens; native swipe with scroll-snap", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/work/");
  await expect(page.locator("[data-gallery]")).not.toHaveClass(/pinned/);
  const track = page.locator("[data-gallery-track]");
  expect(await track.evaluate((n) => getComputedStyle(n).scrollSnapType)).toContain("x");
  expect(await track.evaluate((n) => getComputedStyle(n).overflowX)).toBe("auto");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("About and Work show their final state; CSS connectors, no pin", async ({ page }) => {
    await page.goto("/about/");
    for (const panel of await page.locator("[data-arc-panel]").all()) expect(await settled(panel)).toBe(true);
    await page.goto("/work/");
    expect(await settled(page.locator("[data-mission]").first())).toBe(true);
    await expect(page.locator("svg.tree-svg")).toHaveCount(0);
    await expect(page.locator("[data-tree] .connector").first()).toBeVisible();
    await expect(page.locator("[data-gallery]")).not.toHaveClass(/pinned/);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("everything is visible", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.locator("[data-arc-panel]").first()).toBeVisible();
    await page.goto("/work/");
    await expect(page.locator("[data-mission-result]").first()).toBeVisible();
    await expect(page.locator("[data-tree] .connector").first()).toBeVisible();
  });
});
