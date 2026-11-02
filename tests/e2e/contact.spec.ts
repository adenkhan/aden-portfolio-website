import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const EMAIL = "aden.khan613@gmail.com";

test("built HTML carries Netlify's expected form markup", () => {
  const html = readFileSync("dist/contact/index.html", "utf8");
  expect(html).toMatch(/<form[^>]*name="contact"[^>]*>/);
  expect(html).toMatch(/<form[^>]*data-netlify="true"/);
  expect(html).toMatch(/<form[^>]*netlify-honeypot="bot-field"/);
  expect(html).toMatch(/<form[^>]*action="\/thanks\/"/);
  expect(html).toMatch(/<input type="hidden" name="form-name" value="contact"/);
  expect(html).toContain('name="bot-field"');
});

test("keyboard only: empty submit announces errors, focuses the first field, then submits", async ({
  page,
}) => {
  let posted = "";
  await page.route("**/thanks/", async (route) => {
    if (route.request().method() === "POST") {
      posted = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Message received</h1>" });
    } else await route.continue();
  });
  await page.goto("/contact/");

  const name = page.getByRole("textbox", { name: "Name" });
  const email = page.getByRole("textbox", { name: "Email" });
  const message = page.getByRole("textbox", { name: "Message" });
  await name.focus();
  await page.keyboard.press("Tab");
  await expect(email).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(message).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Send message" })).toBeFocused();

  // Empty submit: errors appear, are linked to their fields, are announced, and focus goes to Name.
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Check" })).toHaveText(
    "Check 3 fields: Name, Email, Message.",
  );
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAccessibleDescription("Enter your name.");
  await expect(email).toHaveAccessibleDescription("Enter your email address.");
  await expect(message).toHaveAccessibleDescription("Write a message.");

  // Fix as you go; an invalid email gets a specific message.
  await page.keyboard.type("Aleksandra Wiśniewska-Kowalczyk");
  await expect(name).toHaveAttribute("aria-invalid", "false");
  await page.keyboard.press("Tab");
  await page.keyboard.type("aleksandra@");
  await page.keyboard.press("Tab");
  await expect(email).toHaveAccessibleDescription("Enter an email address like name@example.com.");
  await email.fill("aleksandra@example.com");
  await message.fill("Hello! Are you open to a product marketing internship?");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");

  await page.waitForURL("**/thanks/");
  expect(posted).toContain("form-name=contact");
  expect(posted).toContain("email=aleksandra%40example.com");
  expect(posted).toContain("bot-field=");
});

test("terminal: links are real and named from the start; the typed copy ends on the real text", async ({
  page,
}) => {
  await page.goto("/contact/", { waitUntil: "domcontentloaded" });
  const terminal = page.locator(".terminal");
  await expect(terminal.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
  await expect(terminal.getByRole("link", { name: "linkedin.com/in/adenkhank" })).toBeAttached();
  await expect(terminal.getByRole("link", { name: "Download CV (PDF)" })).toBeAttached();
  const copies = page.locator(".terminal [data-type]");
  await expect(copies.nth(1)).toHaveText(EMAIL, { timeout: 3000 });
  await expect(copies.last()).toHaveText("Download CV (PDF)", { timeout: 3000 });
});

test("copy-email button copies and confirms with a toast", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/contact/");
  await page.getByRole("button", { name: "Copy email" }).click();
  await expect(page.locator("[data-toast]")).toHaveText("Email copied");
  await expect(page.locator("[data-toast]")).toHaveClass(/visible/);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
});

test("the thanks page shows the themed success state", async ({ page }) => {
  await page.goto("/thanks/");
  await expect(page.getByText("// message sent")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Message received" })).toBeVisible();
  await expect(page.locator("main").getByRole("link", { name: EMAIL })).toHaveAttribute(
    "href",
    `mailto:${EMAIL}`,
  );
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("no typing: the terminal shows its final text at once", async ({ page }) => {
    await page.goto("/contact/");
    await expect(page.locator(".terminal [data-type]").nth(1)).toHaveText(EMAIL, { timeout: 200 });
    await expect(page.locator(".terminal [data-type]").first()).toHaveText("$ open --channel");
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("native validation, real links, no copy button", async ({ page }) => {
    await page.goto("/contact/");
    const form = page.locator("form[name='contact']");
    expect(await form.evaluate((f: HTMLFormElement) => f.noValidate)).toBe(false);
    for (const label of ["Name", "Email", "Message"])
      await expect(page.getByRole("textbox", { name: label })).toHaveAttribute("required", "");
    await expect(page.getByRole("button", { name: "Copy email" })).toBeHidden();
    await expect(page.locator(".terminal [data-type]").nth(1)).toHaveText(EMAIL);
    await expect(page.locator(".terminal").getByRole("link", { name: EMAIL })).toBeVisible();
  });
});
