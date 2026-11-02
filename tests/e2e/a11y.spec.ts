import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("ak.intro", "1");
    } catch {}
  });
});

for (const route of ["/", "/about/", "/work/", "/contact/", "/thanks/"]) {
  test(`${route} has no axe violations (WCAG 2.2 A/AA)`, async ({ page }) => {
    await page.goto(route);
    await page.waitForTimeout(1500); // let reveals settle so axe sees the resting state
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target}`,
    );
    expect(summary).toEqual([]);
  });
}
