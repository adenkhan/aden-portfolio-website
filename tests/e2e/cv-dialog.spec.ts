import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const dialog = (page: Page) => page.getByRole("dialog", { name: "Aden Khan, CV" });
/** Tab from the top of the page until the element with the given accessible name has focus. */
async function tabTo(page: Page, name: RegExp, max = 25) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el ? (el.getAttribute("aria-label") ?? el.textContent ?? "").trim() : "";
    });
    if (name.test(label)) return;
  }
  throw new Error(`Could not reach ${name} with Tab`);
}

test("keyboard only: open from the nav, focus trapped, Esc closes, focus returns", async ({ page }) => {
  await page.goto("/about/");
  await tabTo(page, /Download CV \(PDF\)/);
  await page.keyboard.press("Enter");

  await expect(dialog(page)).toBeVisible();
  // Focus moved inside the dialog.
  expect(await page.evaluate(() => !!document.activeElement?.closest("[data-cv-dialog]"))).toBe(true);
  // Tab cycles inside the dialog only (the page behind is inert).
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("[data-cv-dialog]"))).toBe(true);
  }
  await expect(page.locator("html")).toHaveClass(/dialog-open/);

  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator("html")).not.toHaveClass(/dialog-open/);
  expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toBe(
    "Download CV (PDF)",
  );
});

test("keyboard only: open from the Home hero, Close button closes, focus returns", async ({ page }) => {
  await page.goto("/");
  await tabTo(page, /^Get my CV$/);
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toBeVisible();

  await page.getByRole("button", { name: "Close" }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toBeHidden();
  expect(await page.evaluate(() => document.activeElement?.textContent?.trim())).toBe("Get my CV");
});

test("dialog offers the PDF download and a new-tab link", async ({ page }) => {
  await page.goto("/");
  await page.locator("[data-cv-trigger]").first().click();
  const download = dialog(page).getByRole("link", { name: "Download PDF" });
  await expect(download).toHaveAttribute("href", "/cv/aden-khan-cv.pdf");
  await expect(download).toHaveAttribute("download", "");
  const open = dialog(page).getByRole("link", { name: "Open in new tab" });
  await expect(open).toHaveAttribute("target", "_blank");
  await expect(open).toHaveAttribute("rel", "noopener");
  const response = await page.request.get("/cv/aden-khan-cv.pdf");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("pdf");
});

test("the burst plays on click and is loaded only after hover or focus", async ({ page }) => {
  const scripts: string[] = [];
  page.on("request", (request) => request.url().includes("cv-burst") && scripts.push(request.url()));
  await page.goto("/about/");
  await page.waitForLoadState("networkidle");
  expect(scripts).toEqual([]);

  const trigger = page.locator(".cv-button");
  await trigger.hover();
  await expect.poll(() => scripts.length).toBeGreaterThan(0);
  await trigger.click();
  // Burst layer appears before the dialog opens.
  await expect(page.locator("body > div[aria-hidden='true']").last()).toBeAttached();
  await expect(dialog(page)).toBeVisible();
});

test("background scroll is locked while the dialog is open", async ({ page }) => {
  await page.goto("/work/");
  await page.locator(".cv-button").click();
  await expect(dialog(page)).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no burst; the dialog fades in", async ({ page }) => {
    const scripts: string[] = [];
    page.on("request", (request) => request.url().includes("cv-burst") && scripts.push(request.url()));
    await page.goto("/");
    await page.locator("[data-cv-trigger]").first().focus();
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toBeVisible();
    const style = await dialog(page).evaluate((el) => {
      const s = getComputedStyle(el);
      return { transform: s.transform, duration: s.transitionDuration };
    });
    expect(style.transform).toBe("none");
    expect(style.duration).toContain("0.15s");
    // The module may be prefetched on focus, but no burst layer is ever added.
    await expect(page.locator("body > div[aria-hidden='true'][style*='position:fixed']")).toHaveCount(0);
    void scripts;
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("CV buttons are plain links to the PDF", async ({ page }) => {
    await page.goto("/");
    for (const link of await page.locator("[data-cv-trigger]").all()) {
      await expect(link).toHaveAttribute("href", "/cv/aden-khan-cv.pdf");
      await expect(link).toHaveAttribute("download", "");
    }
    await expect(page.locator("[data-cv-dialog]")).toBeHidden();
  });
});
