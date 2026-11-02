import { expect, test, type Locator, type Page } from "@playwright/test";

// The persistent 3D world (docs/MOTION.md §13). Headless CI only has software WebGL, which the site
// treats as unusable, so these tests force the world on with ?world=force (kept for the session).
test.use({
  launchOptions: {
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  },
});
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

const ready = (page: Page) =>
  expect(page.locator("[data-world]")).toHaveAttribute("data-state", /ready|static/, { timeout: 15000 });
/** Scrolls an element to the middle of the viewport, past the ScrollTrigger start lines. */
const centre = (el: Locator) => el.evaluate((node) => node.scrollIntoView({ block: "center" }));
const debug = (page: Page) => page.evaluate(() => window.__akWorld!.debug);
const nav = (page: Page, name: string) =>
  page.getByRole("navigation", { name: "Main" }).getByRole("link", { name, exact: true }).first().click();

test("one canvas survives every navigation: no new WebGL contexts, no growing GPU memory", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto("/?world=force");
  await ready(page);
  const id = await page.locator("canvas.world-canvas").getAttribute("data-world-canvas");

  const stations: Record<string, string> = { About: "about", Work: "work", Contact: "contact", Home: "home" };
  const geometries: number[] = [];
  for (let lap = 0; lap < 2; lap++) {
    for (const [link, station] of Object.entries(stations)) {
      await nav(page, link);
      await expect.poll(() => debug(page).then((d) => d.station), { timeout: 10000 }).toBe(station);
      await expect(page.locator("canvas")).toHaveCount(1);
      expect(await page.locator("canvas.world-canvas").getAttribute("data-world-canvas")).toBe(id);
      expect((await debug(page)).running).toBe(true);
    }
    geometries.push((await debug(page)).geometries);
  }
  // Every station has been visited once by the end of lap 1; lap 2 must allocate nothing new.
  expect(geometries[1]).toBe(geometries[0]);
  expect(errors).toEqual([]);
});

test("the CSS orbs stand in until the canvas draws, and stay without WebGL", async ({ page }) => {
  await page.goto("/?world=off");
  await expect(page.locator("[data-world]")).toHaveAttribute("data-state", "fallback");
  await expect(page.locator("[data-world] canvas")).toHaveCount(0);
  expect(
    await page.locator("[data-world] .fb-red").evaluate((el) => Number(getComputedStyle(el).opacity)),
  ).toBeGreaterThan(0);
});

test("pausing: a hidden tab stops the render loop", async ({ page }) => {
  await page.goto("/?world=force");
  await ready(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect((await debug(page)).running).toBe(false);
  const frames = (await debug(page)).frames;
  await page.waitForTimeout(500);
  expect((await debug(page)).frames).toBe(frames);
});

test("Work: case studies pull the camera to their formation; skills light the constellation", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/?world=force");
  await ready(page);
  await centre(page.locator("[data-case-study]").nth(2));
  await expect
    .poll(() => page.evaluate(() => window.__akWorld!.world.input.activeCase), { timeout: 8000 })
    .toBe(2);
  await centre(page.locator("[data-tree]"));
  await expect
    .poll(() => page.evaluate(() => window.__akWorld!.world.input.skills), { timeout: 8000 })
    .toBe(true);
  // Labels are the real HTML lanes: hovering one selects its cluster.
  await page.locator("[data-tree-lane]").nth(1).hover();
  await expect.poll(() => page.evaluate(() => window.__akWorld!.world.input.laneHover)).toBe(1);
  await expect(page.locator("[data-tree-lane]").nth(1).getByRole("heading")).toHaveText("Growth");
});

test("About: each arc lights its node as it scrolls past", async ({ page }) => {
  await page.goto("/about/?world=force");
  await ready(page);
  await centre(page.locator("[data-arc-panel]").last());
  await expect
    .poll(() => page.evaluate(() => window.__akWorld!.world.input.arcsLit), { timeout: 8000 })
    .toBe(4);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("the world is a still frame: no loop, and it re-renders once per page", async ({ page }) => {
    await page.goto("/?world=force");
    await expect(page.locator("[data-world]")).toHaveAttribute("data-state", "static", { timeout: 15000 });
    const before = await debug(page);
    expect(before.running).toBe(false);
    await page.waitForTimeout(800);
    expect((await debug(page)).frames).toBe(before.frames);
    await nav(page, "About");
    await expect.poll(() => debug(page).then((d) => d.station)).toBe("about");
    expect((await debug(page)).running).toBe(false);
  });
});
