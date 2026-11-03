import { expect, test, type Page } from "@playwright/test";
import { campaigns } from "../../src/data/campaigns";
import { seoToolShots } from "../../src/data/assets";

// Real creatives and the SEO tool (r10, docs/MOTION.md §25).
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const shelf = (page: Page) => page.locator("[data-campaigns]");

test("every shelf image is the owner's file with its exact alt text, loads, and shifts nothing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { __cls: number }).__cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as PerformanceEntry[] & { value: number; hadRecentInput: boolean }[])
        if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/?world=off&avatar=off");
  await shelf(page).scrollIntoViewIfNeeded();
  const cards = shelf(page).locator("[data-campaign]");
  await expect(cards).toHaveCount(campaigns.length);
  for (const [i, c] of campaigns.entries()) {
    const card = cards.nth(i);
    await card.scrollIntoViewIfNeeded();
    await expect(card.locator("h3")).toHaveText(c.title);
    await expect(card.locator("figcaption .caption")).toHaveText(c.caption);
    const imgs = card.locator("img");
    await expect(imgs).toHaveCount(c.slides.length);
    for (const [k, s] of c.slides.entries()) {
      const img = imgs.nth(k);
      await expect(img).toHaveAttribute("alt", s.alt);
      await expect(img).toHaveAttribute("width", String(s.width));
      await expect(img).toHaveAttribute("height", String(s.height));
      await expect(img).toHaveAttribute("loading", "lazy");
      // AVIF and WebP sources, 400/800/1200 widths.
      const sources = await img.evaluate((n) =>
        [...n.parentElement!.querySelectorAll("source")].map((x) => x.type),
      );
      expect(sources).toEqual(["image/avif", "image/webp"]);
      // Lazy: a carousel slide loads once it is scrolled into view (as a swipe would).
      await img.evaluate((n) => n.scrollIntoView({ block: "nearest", inline: "center" }));
      await expect
        .poll(() => img.evaluate((n: HTMLImageElement) => n.complete && n.naturalWidth), { timeout: 10_000 })
        .toBeGreaterThan(0);
    }
  }
  await expect(
    shelf(page).getByText("Concept / spec work, not affiliated with any brand or franchise"),
  ).toBeVisible();
  await expect(shelf(page).getByText("Carousel · 4 selected slides")).toBeVisible();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01);
});

test("the lightbox works with the keyboard only: open, arrows, Esc, focus back", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/?world=off&avatar=off");
  const first = shelf(page).locator("[data-lightbox-open]").first();
  await first.scrollIntoViewIfNeeded();
  await first.focus();
  await page.keyboard.press("Enter");
  const box = page.locator("[data-lightbox]");
  await expect(box).toHaveAttribute("open", "");
  const c = campaigns[0];
  await expect(box.locator("[data-lb-alt]")).toHaveText(c.slides[0].alt);
  await expect(box.locator("[data-lb-campaign]")).toHaveText(c.title);
  await expect(box.locator("img")).toHaveAttribute("alt", c.slides[0].alt);
  expect(await page.evaluate(() => window.__akLenis?.isStopped)).toBe(true);
  await page.keyboard.press("ArrowRight");
  await expect(box.locator("[data-lb-alt]")).toHaveText(c.slides[1].alt);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(box.locator("[data-lb-alt]")).toHaveText(c.slides.at(-1)!.alt);
  // Focus never reaches the page behind the modal (Chrome may hand it to its own UI between laps).
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => {
        const a = document.activeElement;
        return !a || a === document.body || !!a.closest("[data-lightbox]");
      }),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(box).not.toHaveAttribute("open", "");
  await expect(first).toBeFocused();
  expect(await page.evaluate(() => window.__akLenis?.isStopped)).toBe(false);
});

test("desktop: a carousel drags with the mouse and lands on a slide; arrows and counter follow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/?world=off&avatar=off");
  const carousel = shelf(page).locator("[data-carousel]").first();
  await carousel.scrollIntoViewIfNeeded();
  const track = carousel.locator("[data-track]");
  const counter = carousel.locator("[data-counter]");
  await expect(counter).toHaveText("1 / 4");
  const b = (await track.boundingBox())!;
  await page.mouse.move(b.x + b.width * 0.8, b.y + b.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width * 0.2, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(counter).toHaveText("2 / 4", { timeout: 3000 });
  // A drag never opens the lightbox.
  await expect(page.locator("[data-lightbox]")).not.toHaveAttribute("open", "");
  await carousel.locator("[data-next]").click();
  await expect(counter).toHaveText("3 / 4", { timeout: 3000 });
  // The selected-slides carousel counts with the slides' own numbers.
  await expect(shelf(page).locator("[data-carousel]").nth(1).locator("[data-counter]")).toHaveText("01 / 08");
});

test.describe("touch phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  test("carousels are swipeable scroll-snap tracks; the counter follows a swipe; no sideways page scroll", async ({
    page,
  }) => {
    await page.goto("/work/?world=off&avatar=off");
    const carousel = shelf(page).locator("[data-carousel]").first();
    await carousel.scrollIntoViewIfNeeded();
    const track = carousel.locator("[data-track]");
    expect(await track.evaluate((n) => getComputedStyle(n).scrollSnapType)).toContain("x mandatory");
    expect(await track.evaluate((n) => getComputedStyle(n).overflowX)).toBe("auto");
    // A swipe is a native scroll of the track; snap lands it on the next slide.
    await track.evaluate((n) => n.scrollBy({ left: n.clientWidth * 0.7 }));
    await expect(carousel.locator("[data-counter]")).toHaveText("2 / 4", { timeout: 3000 });
    await carousel.locator("[data-next]").tap();
    await expect(carousel.locator("[data-counter]")).toHaveText("3 / 4", { timeout: 3000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    // Fans spread once in view (no hover on touch).
    const fan = shelf(page).locator("[data-fan]").first();
    await fan.scrollIntoViewIfNeeded();
    await expect(fan).toHaveClass(/is-spread/);
  });
});

test("case 3 shows the real tool: screenshots with alt text, the playbook, a live link, no illustrative tag", async ({
  page,
}) => {
  await page.goto("/work/?world=off&avatar=off");
  const study = page.locator("#mission-an-seo-writers-cockpit");
  const shots = study.locator("[data-tool-shot] img");
  await expect(shots).toHaveCount(seoToolShots.length);
  for (const [i, s] of seoToolShots.entries()) await expect(shots.nth(i)).toHaveAttribute("alt", s.alt);
  await expect(study.locator("[data-tool-step]")).toHaveText([
    "Configure",
    "Research",
    "AI visibility check",
    "Brief",
    "Write",
  ]);
  const link = study.getByRole("link", { name: /Open the tool/ });
  await expect(link).toHaveAttribute("href", "https://internal-tool-seo-g8de.vercel.app/create");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(study.locator(".tag")).toHaveCount(0);
  await expect(study.locator("iframe")).toHaveCount(0);
});

test("/work metadata: description, the collage card and valid JSON-LD for the campaigns and the tool", async ({
  page,
  request,
}) => {
  await page.goto("/work/");
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toContain("campaigns");
  expect(description!.length).toBeLessThanOrEqual(155);
  expect(await page.locator('meta[property="og:image"]').getAttribute("content")).toContain("/work.");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const graph = blocks.map((b) => JSON.parse(b)).flatMap((d) => d["@graph"] ?? [d]);
  const list = graph.find((n) => n["@type"] === "ItemList");
  expect(list.itemListElement).toHaveLength(campaigns.length);
  for (const [i, el] of list.itemListElement.entries()) {
    expect(el.item["@type"]).toBe("CreativeWork");
    expect(el.item.name).toBe(campaigns[i].title);
    expect(el.item.description).toBe(campaigns[i].caption);
    expect(el.item.about.name).toBe(campaigns[i].client);
    expect(el.item.creator["@id"]).toMatch(/#person$/);
    // The cover is a real built image (served locally under the same path).
    const path = new URL(el.item.image).pathname;
    expect((await request.get(path)).status()).toBe(200);
  }
  const app = graph.find((n) => n["@type"] === "SoftwareApplication");
  expect(app).toMatchObject({
    name: "SEO Tool",
    applicationCategory: "BusinessApplication",
    url: "https://internal-tool-seo-g8de.vercel.app/create",
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the shelf is complete: captions, images and scrollable carousels", async ({ page }) => {
    await page.goto("/work/");
    await expect(shelf(page).locator("[data-campaign]")).toHaveCount(campaigns.length);
    await expect(shelf(page).locator("img").first()).toBeVisible();
    await expect(shelf(page).locator("[data-controls]").first()).toBeHidden();
  });
});
