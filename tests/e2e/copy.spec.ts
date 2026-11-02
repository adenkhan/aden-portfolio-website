import { expect, test, type Locator } from "@playwright/test";

// Round 2 copy rules (CLAUDE.md §4a): word budgets and the facts that may appear only once.
test.use({ reducedMotion: "reduce" });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

/** Visible words: text not inside .sr-only, hidden elements or a closed dialog; tokens with a letter or digit. */
const visibleWords = (root: Locator) =>
  root.evaluate((el) => {
    const hidden = (node: Element | null) => {
      for (let n = node; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === "none" || cs.visibility === "hidden" || n.classList.contains("sr-only"))
          return true;
        if (n instanceof HTMLDialogElement && !n.open) return true;
      }
      return false;
    };
    let text = "";
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const parent = walker.currentNode.parentElement;
      if (parent && !hidden(parent) && !["SCRIPT", "STYLE"].includes(parent.tagName))
        text += ` ${walker.currentNode.textContent}`;
    }
    return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  });

const budgets = [
  { route: "/", max: 80 },
  { route: "/about/", max: 160 },
  { route: "/contact/", max: 40 },
];

for (const { route, max } of budgets) {
  test(`${route} stays within ${max} visible words`, async ({ page }) => {
    await page.goto(route);
    expect((await visibleWords(page.locator("main"))).length).toBeLessThanOrEqual(max);
  });
}

test("each Work case study stays within 60 visible words", async ({ page }) => {
  await page.goto("/work/");
  const studies = page.locator("[data-case-study]");
  await expect(studies).toHaveCount(6);
  for (const study of await studies.all()) expect((await visibleWords(study)).length).toBeLessThanOrEqual(60);
});

test("BBA, IBA Karachi and the availability line appear once, in About", async ({ page }) => {
  const counts = { BBA: 0, "IBA Karachi": 0, "mid-2027": 0 };
  for (const route of ["/", "/about/", "/work/", "/contact/"]) {
    await page.goto(route);
    const text = (await visibleWords(page.locator("main"))).join(" ");
    for (const key of Object.keys(counts) as (keyof typeof counts)[]) {
      const found = text.split(key).length - 1;
      if (found && route !== "/about/") throw new Error(`${key} appears on ${route}`);
      counts[key] += found;
    }
  }
  expect(counts).toEqual({ BBA: 1, "IBA Karachi": 1, "mid-2027": 1 });
});

test("case-study lines each stay on one line on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/");
  const multiLine = await page
    .locator("[data-case-study]")
    .evaluateAll((studies) =>
      studies.flatMap((study) =>
        [study.querySelector("h3")!, ...study.querySelectorAll("dd")]
          .filter(
            (el) => el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * 1.5,
          )
          .map((el) => el.textContent?.trim()),
      ),
    );
  expect(multiLine).toEqual([]);
});
