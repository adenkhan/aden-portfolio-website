import { expect, test, type Locator } from "@playwright/test";

const settled = (el: Locator) =>
  el.evaluate((n) => {
    const s = getComputedStyle(n);
    const m = new DOMMatrix(s.transform);
    return Number(s.opacity) === 1 && Math.abs(m.m41) < 0.5 && Math.abs(m.m42) < 0.5 && Math.abs(m.b) < 0.001;
  });

/** Steps down the whole page (through any pin), letting each step's triggers fire. */
const scrollThrough = async (page: import("@playwright/test").Page) => {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 250) {
    await page.evaluate(
      (top) => window.__akLenis?.scrollTo(top, { immediate: true }) ?? window.scrollTo(0, top),
      y,
    );
    await page.waitForTimeout(60);
  }
};

test("About: origin-arc panels slam in through the pin and settle; education and goals reveal", async ({
  page,
}) => {
  await page.goto("/about/");
  // Desktop (1280×720): the arcs pin while the panels slam in one step at a time (r8b).
  await expect(page.locator(".pin-spacer [data-arc-panel]")).toHaveCount(4);
  await scrollThrough(page);
  for (const panel of await page.locator("[data-arc-panel]").all())
    await expect.poll(() => settled(panel), { timeout: 3000 }).toBe(true);
  for (const section of await page.locator('[data-reveal="section"]').all()) {
    await section.scrollIntoViewIfNeeded();
    await expect.poll(() => settled(section), { timeout: 3000 }).toBe(true);
  }
});

test("About phone: no pin, each panel slams as it scrolls in", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/about/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  for (const panel of await page.locator("[data-arc-panel]").all()) {
    // Centred, as a reader scrolls it, so its top passes the 70% trigger line.
    await panel.evaluate((n) => n.scrollIntoView({ block: "center" }));
    await expect.poll(() => settled(panel), { timeout: 3000 }).toBe(true);
  }
});

const caseScroll = (page: import("@playwright/test").Page, index: number) =>
  page.evaluate((i) => {
    // The pinned sequence moves one case per (viewport width) of scroll.
    const section = document.querySelector<HTMLElement>("[data-cases]")!;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + i * document.documentElement.clientWidth);
  }, index);

test("Work desktop: cases pin and move sideways; each plays its beats and counts to the real value", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/?world=off");
  const section = page.locator("[data-cases]");
  await expect(section).toHaveClass(/is-sequence/);
  const cases = page.locator("[data-case-study]");
  await expect(cases).toHaveCount(6);

  // Case 1 plays as the section scrolls up to the pin.
  await caseScroll(page, 0);
  const first = cases.first();
  await expect
    .poll(() => first.locator('[data-beat="3"]').evaluate((n) => getComputedStyle(n).opacity), {
      timeout: 4000,
    })
    .toBe("1");
  await expect(first.locator("[data-count]")).toHaveText("−72%", { timeout: 4000 });
  // Screen readers get the real value from the start.
  await expect(first.locator(".lead .sr-only")).toHaveText("−72%");

  // Scrolling moves the strip sideways (not the page content down).
  await caseScroll(page, 5);
  await expect
    .poll(
      () =>
        page.locator("[data-cases-track]").evaluate((n) => new DOMMatrix(getComputedStyle(n).transform).m41),
      { timeout: 4000 },
    )
    .toBeLessThan(-1000);
  await expect(cases.nth(5).locator("[data-count]")).toHaveText("$7,000+", { timeout: 4000 });
  await expect(cases.nth(5).locator("[data-viz-count]").nth(2)).toHaveText("+1,500");
});

test("Work desktop: every case is keyboard-reachable; focusing one scrolls it into view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/?world=off");
  // Wait for the motion layer to build the sequence (it attaches the focus handlers).
  await expect(page.locator("[data-cases]")).toHaveClass(/is-sequence/);
  const third = page.locator("[data-case-study]").nth(2);
  await third.focus();
  await expect(third).toBeFocused();
  await expect
    .poll(() => third.evaluate((n) => Math.round(n.getBoundingClientRect().left)), { timeout: 4000 })
    .toBeLessThan(20);
  await expect(third).toHaveAccessibleName("An SEO writer’s cockpit");
});

test("Work phones: cases stack vertically and each plays as it enters", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/work/?world=off");
  await expect(page.locator("[data-cases]")).not.toHaveClass(/is-sequence/);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  const fifth = page.locator("[data-case-study]").nth(4);
  await fifth.scrollIntoViewIfNeeded();
  await expect(fifth.locator("[data-count]")).toHaveText("+40%", { timeout: 4000 });
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

test("Work: the gallery drags with momentum on desktop and keeps native scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/?world=off");
  const track = page.locator("[data-gallery-track]");
  await track.scrollIntoViewIfNeeded();
  await expect(track).toHaveClass(/is-draggable/);
  const box = (await track.boundingBox())!;
  await page.mouse.move(box.x + 600, box.y + 150);
  await page.mouse.down();
  await page.mouse.move(box.x + 300, box.y + 150, { steps: 6 });
  await page.mouse.up();
  // Momentum carries it past the 300 px dragged.
  await expect.poll(() => track.evaluate((n) => n.scrollLeft), { timeout: 3000 }).toBeGreaterThan(300);
  expect(await track.evaluate((n) => getComputedStyle(n).overflowX)).toBe("auto");
  // Images are lazy and keep their slot alt text.
  const imgs = track.locator("img");
  await expect(imgs.first()).toHaveAttribute("loading", "lazy");
  await expect(imgs.first()).toHaveAttribute(
    "alt",
    "Meta ad creative for Sadiq.ai Blessed Friday sale, 89% off",
  );
});

test.describe("touch phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test("Work: the gallery is a native swipe strip with scroll-snap", async ({ page }) => {
    await page.goto("/work/");
    const track = page.locator("[data-gallery-track]");
    expect(await track.evaluate((n) => getComputedStyle(n).scrollSnapType)).toContain("x");
    expect(await track.evaluate((n) => getComputedStyle(n).overflowX)).toBe("auto");
    await expect(track).not.toHaveClass(/is-draggable/);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("About and Work show their final state; CSS connectors, no pin", async ({ page }) => {
    await page.goto("/about/");
    for (const panel of await page.locator("[data-arc-panel]").all()) expect(await settled(panel)).toBe(true);
    await page.goto("/work/");
    // Cases stack, unpinned, every visual in its end state and every count on its real value.
    await expect(page.locator("[data-cases]")).not.toHaveClass(/is-sequence/);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator("[data-count]").first()).toHaveText("−72%");
    await expect(page.locator("[data-case-visual] svg").first()).toBeVisible();
    await expect(page.locator("svg.tree-svg")).toHaveCount(0);
    await expect(page.locator("[data-tree] .connector").first()).toBeVisible();
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("everything is visible", async ({ page }) => {
    await page.goto("/about/");
    await expect(page.locator("[data-arc-panel]").first()).toBeVisible();
    await page.goto("/work/");
    await expect(page.locator("[data-mission-result]").first()).toBeVisible();
    await expect(page.locator("[data-case-visual] svg").first()).toBeVisible();
    await expect(page.locator("[data-count]").first()).toHaveText("−72%");
    await expect(page.locator("[data-tree] .connector").first()).toBeVisible();
  });
});
