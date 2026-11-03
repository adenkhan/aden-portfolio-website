const { chromium } = require("@playwright/test");
const fs = require("fs");
const { execFileSync } = require("child_process");
const BASE = "https://aden-portfolio-website.vercel.app";
const KIT = "D:/IBA/aden/aden-portfolio-website/submission-kit/screenshots";
const FFMPEG = "C:/Users/Palize/AppData/Local/Temp/ff/node_modules/ffmpeg-static/ffmpeg.exe";
const HIDE = ".placeholder-badge,[data-dev-hud],[data-data-toggle]{display:none!important}";
const log = (...a) => console.log(...a);
const step = async (name, fn) => { try { await fn(); log("ok", name); } catch (e) { log("FAIL", name, String(e.message).split("\n")[0]); } };

async function ready(page, { avatar = false } = {}) {
  await page.addStyleTag({ content: HIDE }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 20000 }).catch(() => {});
  await page.waitForFunction(() => window.__akWorld && window.__akWorld.debug.frames > 8, null, { timeout: 25000 }).catch(() => {});
  if (avatar) {
    await page.mouse.move(100, 100); await page.mouse.move(140, 130);
    await page.waitForFunction(() => document.documentElement.dataset.avatar, null, { timeout: 90000 }).catch(() => log("avatar not live"));
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(1200);
}
const newCtx = (b, o = {}) => b.newContext({ viewport: { width: 1440, height: 900 }, ...o });
const skipIntro = (c) => c.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
const goto = (p, u, q = "world=force") => p.goto(BASE + u + (u.includes("?") ? "&" : "?") + q, { waitUntil: "load" });
const jump = (p, y) => p.evaluate((t) => { const l = window.__akLenis; if (l) l.scrollTo(t, { immediate: true }); else window.scrollTo(0, t); window.dispatchEvent(new Event("scroll")); }, y);

(async () => {
  const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

  // ---------- desktop ----------
  const pages = [["01-home", "/", true], ["02-about", "/about/", true], ["03-work", "/work/", false], ["04-contact", "/contact/", true]];
  for (const [name, url, avatar] of pages) {
    await step("desktop " + name, async () => {
      const c = await newCtx(b); await skipIntro(c);
      const p = await c.newPage();
      await goto(p, url, "world=force" + (avatar ? "" : "&avatar=off"));
      await ready(p, { avatar });
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.screenshot({ path: `${KIT}/desktop/${name}-top.png` });
      await p.screenshot({ path: `${KIT}/desktop/${name}-full.png`, fullPage: true });
      if (name === "01-home") {
        const top = await p.evaluate(() => { const s = document.querySelector("[data-teaser]").closest(".pin-spacer") || document.querySelector("[data-teaser]"); return s.getBoundingClientRect().top + scrollY; });
        await jump(p, top + 0.9 * 1.5 * 900); await p.waitForTimeout(110);
        await p.screenshot({ path: `${KIT}/desktop/01-home-teaser.png` });
      }
      if (name === "02-about") {
        const y = await p.evaluate(() => { const s = document.querySelector("[data-arc-panel]").closest(".pin-spacer"); return s ? s.getBoundingClientRect().bottom + scrollY - innerHeight : 0; });
        await jump(p, y); await p.waitForTimeout(2200);
        await p.screenshot({ path: `${KIT}/desktop/02-about-arcs.png` });
      }
      if (name === "03-work") {
        const top = await p.evaluate(() => document.querySelector("[data-cases]").getBoundingClientRect().top + scrollY);
        for (let i = 0; i < 6; i++) {
          await jump(p, top + i * (await p.evaluate(() => document.documentElement.clientWidth))); await p.waitForTimeout(2200);
          await p.screenshot({ path: `${KIT}/desktop/03-work-case-0${i + 1}.png` });
        }
        for (const [id, file] of [["skills", "03-work-skills"], ["campaigns", "03-work-campaign-shelf"]]) {
          await p.locator("#" + id).evaluate((e) => e.scrollIntoView({ block: "start" })); await p.waitForTimeout(1800);
          await p.locator("#" + id).screenshot({ path: `${KIT}/desktop/${file}.png` });
        }
      }
      await c.close();
    });
  }

  // ---------- mobile ----------
  for (const [name, url, avatar] of pages) {
    await step("mobile " + name, async () => {
      const o = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
      let c = await b.newContext(o); await skipIntro(c);
      let p = await c.newPage();
      await goto(p, url, "world=force" + (name === "01-home" ? "" : "&avatar=off"));
      await ready(p, { avatar: name === "01-home" });
      await p.screenshot({ path: `${KIT}/mobile/${name}-top.png` });
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      let dsf = 3;
      if (h * 3 > 16000) {
        dsf = Math.max(1, Math.floor((16000 / h) * 10) / 10);
        await c.close();
        c = await b.newContext({ ...o, deviceScaleFactor: dsf }); await skipIntro(c);
        p = await c.newPage(); await goto(p, url, "world=force&avatar=off"); await ready(p);
      }
      await p.screenshot({ path: `${KIT}/mobile/${name}-full.png`, fullPage: true });
      log(name, "mobile full dsf", dsf, "height", h);
      await c.close();
    });
  }

  // ---------- interactions ----------
  await step("cv dialog", async () => {
    const c = await newCtx(b); await skipIntro(c); const p = await c.newPage();
    await goto(p, "/", "world=force&avatar=off"); await ready(p);
    await p.locator("[data-cv-trigger]").first().click(); await p.waitForTimeout(1400);
    await p.screenshot({ path: `${KIT}/interactions/cv-dialog-open.png` }); await c.close();
  });
  await step("lightbox", async () => {
    const c = await newCtx(b); await skipIntro(c); const p = await c.newPage();
    await goto(p, "/work/", "world=force&avatar=off"); await ready(p);
    const open = p.locator("[data-carousel] .open").nth(1);
    await open.evaluate((e) => e.scrollIntoView({ block: "center" })); await p.waitForTimeout(1200);
    await open.click({ force: true });
    await p.waitForFunction(() => { const i = document.querySelector("[data-lightbox] img"); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${KIT}/interactions/lightbox-open.png` }); await c.close();
  });
  await step("mobile menu", async () => {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }); await skipIntro(c); const p = await c.newPage();
    await goto(p, "/", "world=force&avatar=off"); await ready(p);
    await p.locator("header").getByText("Menu", { exact: true }).first().tap(); await p.waitForTimeout(900);
    await p.screenshot({ path: `${KIT}/interactions/mobile-menu-open.png` }); await c.close();
  });
  await step("contact form", async () => {
    const c = await newCtx(b); await skipIntro(c); const p = await c.newPage();
    await goto(p, "/contact/", "world=force&avatar=off"); await ready(p);
    const f = p.locator("form[name=contact]");
    await f.getByLabel("Name").fill("Sample Recruiter");
    await f.getByLabel("Email").fill("recruiter@example.com");
    await f.getByLabel("Message").fill("Hi Aden, we have a product marketing internship open. This is dummy text for the submission kit; the form is not submitted.");
    await f.evaluate((e) => e.scrollIntoView({ block: "center" })); await p.waitForTimeout(900);
    await p.screenshot({ path: `${KIT}/interactions/contact-form-filled.png` }); await c.close();
  });
  await step("404", async () => {
    const c = await newCtx(b); await skipIntro(c); const p = await c.newPage();
    await goto(p, "/this-page-does-not-exist/", "world=force&avatar=off"); await ready(p);
    await p.screenshot({ path: `${KIT}/interactions/404-page.png` }); await c.close();
  });

  // ---------- motion: intro frames ----------
  await step("intro frames", async () => {
    const c = await newCtx(b); const p = await c.newPage();
    const t0 = Date.now();
    await p.goto(BASE + "/?world=force&avatar=off&intro=replay", { waitUntil: "commit" });
    const marks = [["1-summon", 900], ["2-spiral", 1800], ["3-charge", 2700], ["4-reveal", 3700]];
    for (const [n, at] of marks) {
      const wait = at - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait);
      await p.screenshot({ path: `${KIT}/motion/intro-${n}.png` });
    }
    log("intro mode", await p.evaluate(() => document.documentElement.dataset.introMode || "n/a"));
    await c.close();
  });

  // ---------- motion: scrub frames ----------
  await step("scrub frames", async () => {
    const c = await newCtx(b); await skipIntro(c); const p = await c.newPage();
    await goto(p, "/"); await ready(p, { avatar: true });
    const top = await p.evaluate(() => { const s = document.querySelector("[data-teaser]").closest(".pin-spacer") || document.querySelector("[data-teaser]"); return s.getBoundingClientRect().top + scrollY; });
    for (const [n, f] of [["1-summon", 0.1], ["2-charge", 0.55], ["3-release", 0.9]]) {
      await jump(p, top + f * 1.5 * 900); await p.waitForTimeout(110);
      await p.screenshot({ path: `${KIT}/motion/scrub-${n}.png` });
      await jump(p, 0); await p.waitForTimeout(500);
    }
    await c.close();
  });

  // ---------- motion: video ----------
  await step("video", async () => {
    const dir = KIT + "/motion/_video";
    fs.rmSync(dir, { recursive: true, force: true });
    const tCtx = Date.now();
    const c = await newCtx(b, { recordVideo: { dir, size: { width: 1440, height: 900 } } }); await skipIntro(c);
    const p = await c.newPage();
    await goto(p, "/"); await ready(p, { avatar: true });
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1200);
    const start = (Date.now() - tCtx) / 1000 - 0.8;
    for (let i = 0; i < 125; i++) { await p.mouse.wheel(0, 16); await p.waitForTimeout(100); }
    await p.waitForTimeout(1500);
    await c.close();
    const webm = fs.readdirSync(dir).find((f) => f.endsWith(".webm"));
    execFileSync(FFMPEG, ["-y", "-ss", String(Math.max(0, start)), "-t", "14", "-i", `${dir}/${webm}`, "-vf", "scale=1440:900", "-c:v", "libx264", "-crf", "30", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-an", `${KIT}/motion/home-scroll-1440.mp4`], { stdio: "ignore" });
    fs.rmSync(dir, { recursive: true, force: true });
  });

  await b.close();
  log("DONE");
})();
