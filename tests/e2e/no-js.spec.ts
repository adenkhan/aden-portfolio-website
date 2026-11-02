import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

const pages = [
  { route: "/", texts: ["Aden Khan, Product Marketer", "BBA Marketing student at IBA Karachi", "−72%"] },
  {
    route: "/about/",
    texts: ["The origin arc", "Storyteller (2025)", "Google Data Analytics Specialization"],
  },
  { route: "/work/", texts: ["Lower the cost of growth", "Fund a society", "Data and automation"] },
  { route: "/contact/", texts: ["Open a channel", "aden.khan613@gmail.com", "Send message"] },
];

for (const { route, texts } of pages) {
  test(`${route} is fully readable with JavaScript disabled`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main h1")).toBeVisible();
    for (const text of texts) await expect(page.locator("main").getByText(text).first()).toBeVisible();
    // Nav links are real links, and the mobile menu is a <details> element that opens without JS.
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Work" }).first(),
    ).toBeAttached();
  });
}

test("mobile menu opens without JavaScript", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.locator("summary", { hasText: "Menu" }).click();
  await expect(page.locator(".links-mobile").getByRole("link", { name: "Contact" })).toBeVisible();
});

test("contact form is a static Netlify form with a honeypot", async ({ page }) => {
  await page.goto("/contact/");
  const form = page.locator('form[name="contact"]');
  await expect(form).toHaveAttribute("data-netlify", "true");
  await expect(form).toHaveAttribute("netlify-honeypot", "bot-field");
  await expect(form).toHaveAttribute("action", "/thanks/");
  await expect(form.locator('input[name="form-name"]')).toHaveValue("contact");
  for (const label of ["Name", "Email", "Message"]) await expect(form.getByLabel(label)).toBeVisible();
});
