const { chromium } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const fs = require("fs");
const BASE = process.env.LIVE;
const OUT = process.env.OUT;
const PAGES = ["/", "/about/", "/work/", "/contact/"];
const R = {};
const rec = (k, v) => (R[k] = v);

(async () => {
  const browser = await chromium.launch();
  const ctx = async (o = {}) => browser.newContext({ viewport: { width: 1440, height: 900 }, ...o });

  // A. status codes in fresh contexts, HTTPS, canonical/og/sitemap/robots hosts
  const status = {};
  for (const p of [...PAGES, "/this-page-does-not-exist/"]) {
    const c = await ctx();
    const r = await (await c.newPage()).goto(BASE + p);
    status[p] = r.status();
    await c.close();
  }
  rec("status", status);
  rec("https", BASE.startsWith("https://"));
  const meta = {};
  const c0 = await ctx();
  const p0 = await c0.newPage();
  for (const p of PAGES) {
    await p0.goto(BASE + p, { waitUntil: "domcontentloaded" });
    meta[p] = await p0.evaluate(() => {
      const g = (s, a) => document.querySelector(s)?.getAttribute(a) ?? null;
      const imgs = [...document.querySelectorAll("img")];
      return {
        title: document.title,
        titleLen: document.title.length,
        desc: g('meta[name="description"]', "content"),
        canonical: g('link[rel="canonical"]', "href"),
        ogUrl: g('meta[property="og:url"]', "content"),
        ogImage: g('meta[property="og:image"]', "content"),
        ogAlt: g('meta[property="og:image:alt"]', "content"),
        twCard: g('meta[name="twitter:card"]', "content"),
        twImage: g('meta[name="twitter:image"]', "content"),
        viewport: g('meta[name="viewport"]', "content"),
        h1s: [...document.querySelectorAll("h1")].map((h) => h.textContent.replace(/\s+/g, " ").trim()),
        h2s: [...document.querySelectorAll("h2")].map((h) => h.textContent.replace(/\s+/g, " ").trim()).slice(0, 8),
        imgsNoAlt: imgs.filter((i) => !i.hasAttribute("alt")).map((i) => i.currentSrc || i.src),
        imgCount: imgs.length,
        jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
          try { const d = JSON.parse(s.textContent); return (d["@graph"] || [d]).map((n) => n["@type"]); } catch { return "INVALID"; }
        }),
      };
    });
  }
  rec("meta", meta);
  await c0.close();
  const fetchText = async (u) => { try { const r = await fetch(BASE + u); return { s: r.status, t: await r.text() }; } catch (e) { return { s: 0, t: String(e) } } };
  const robots = await fetchText("/robots.txt");
  const smi = await fetchText("/sitemap-index.xml");
  const sm0 = await fetchText("/sitemap-0.xml");
  rec("robots", { status: robots.s, body: robots.t.slice(0, 300) });
  rec("sitemap", { status: smi.s, locs: [...(smi.t + sm0.t).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) });

  // A. links (internal + CV + mailto + external), form, console errors during full scroll
  const links = { checked: [], bad: [], external: [] };
  const seen = new Set();
  const consoleErrs = {};
  for (const p of PAGES) {
    const c = await ctx();
    const pg = await c.newPage();
    consoleErrs[p] = [];
    pg.on("console", (m) => m.type() === "error" && !m.text().includes("GL Driver") && consoleErrs[p].push(m.text().slice(0, 160)));
    pg.on("pageerror", (e) => consoleErrs[p].push("PAGEERROR " + e.message.slice(0, 160)));
    pg.on("requestfailed", (r) => consoleErrs[p].push("REQFAILED " + r.url().slice(0, 120)));
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    await pg.goto(BASE + p, { waitUntil: "load" });
    const h = await pg.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= h; y += 500) { await pg.evaluate((t) => window.scrollTo(0, t), y); await pg.waitForTimeout(120); }
    const hrefs = await pg.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => ({ href: a.href, text: a.textContent.trim().slice(0, 30), mailto: a.getAttribute("href") })));
    for (const l of hrefs) {
      if (seen.has(l.href)) continue;
      seen.add(l.href);
      if (l.href.startsWith(BASE)) {
        const r = await fetch(l.href.split("#")[0], { method: "GET" });
        links.checked.push([l.href, r.status, r.headers.get("content-type")]);
        if (r.status >= 400) links.bad.push([l.href, r.status]);
      } else links.external.push([l.href, l.text]);
    }
    await c.close();
  }
  for (const [u] of links.external.filter((x) => /linkedin|github/.test(x[0]))) {
    try { const r = await fetch(u, { redirect: "follow", headers: { "user-agent": "Mozilla/5.0" } }); links.external.push(["CHECK " + u, r.status]); } catch (e) { links.external.push(["CHECK " + u, "ERR"]); }
  }
  rec("links", links);
  rec("consoleErrs", consoleErrs);

  // A. contact form submit (one POST; arrival cannot be confirmed from outside)
  {
    const c = await ctx();
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    await pg.goto(BASE + "/contact/");
    const form = await pg.evaluate(() => { const f = document.querySelector("form"); return f && { name: f.getAttribute("name"), method: f.method, action: f.getAttribute("action"), netlify: f.hasAttribute("data-netlify") }; });
    let res = null;
    pg.on("response", (r) => { if (r.request().method() === "POST") res = [r.url(), r.status()]; });
    await pg.getByLabel("Name").fill("Audit test (r11)");
    await pg.getByLabel("Email").fill("audit-test@example.com");
    await pg.getByLabel("Message").fill("Automated rubric audit; please ignore.");
    await pg.getByRole("button", { name: /send/i }).click();
    await pg.waitForTimeout(3500);
    rec("form", { form, post: res, finalUrl: pg.url(), bodyHas404: /404|not found/i.test(await pg.locator("body").innerText()) });
    await c.close();
  }

  // B. home poster (2x), JS off, stats, count-up
  {
    const c = await ctx({ deviceScaleFactor: 2 });
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    await pg.goto(BASE + "/", { waitUntil: "load" });
    await pg.waitForTimeout(2500);
    rec("poster", await pg.evaluate(() => {
      const i = document.querySelector("img[data-avatar-poster]");
      if (!i) return null;
      const r = i.getBoundingClientRect();
      const widths = (i.parentElement.querySelector("source")?.srcset || i.srcset || "").split(",").map((s) => parseInt(s.trim().split(/\s+/)[1])).filter(Boolean);
      return { alt: i.alt, cssW: Math.round(r.width), cssH: Math.round(r.height), natW: i.naturalWidth, natH: i.naturalHeight, current: i.currentSrc.split("/").pop(), srcsetWidths: widths, dpr: devicePixelRatio, longSideNeeded: Math.round(Math.max(r.width, r.height) * devicePixelRatio) };
    }));
    rec("stats", await pg.evaluate(() => [...document.querySelectorAll("[data-stat]")].map((s) => s.textContent.replace(/\s+/g, " ").trim())));
    await c.close();
    const c2 = await ctx({ javaScriptEnabled: false });
    const p2 = await c2.newPage();
    await p2.goto(BASE + "/");
    rec("posterNoJs", { visible: await p2.locator("img[data-avatar-poster]").isVisible().catch(() => false), stats: await p2.locator("[data-stat]").allInnerTexts() });
    await c2.close();
  }

  // C. mobile: no h-scroll, font size, tap targets, nav, viewport
  const mobile = {};
  for (const w of [360, 375, 390]) {
    for (const p of PAGES) {
      const c = await ctx({ viewport: { width: w, height: 800 }, hasTouch: true, isMobile: true });
      const pg = await c.newPage();
      await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
      await pg.goto(BASE + p, { waitUntil: "load" });
      await pg.waitForTimeout(800);
      const m = await pg.evaluate(() => {
        const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && !e.closest(".sr-only,[hidden]"); };
        const small = [...document.querySelectorAll("a[href],button,input,textarea,select,summary")].filter((e) => vis(e) && !e.closest("p, li:not([class])")).map((e) => { const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || e.tagName).trim().slice(0, 24), w: Math.round(r.width), h: Math.round(r.height), cls: e.className?.toString().slice(0, 20) }; }).filter((x) => x.w < 44 || x.h < 44);
        const body = parseFloat(getComputedStyle(document.body).fontSize);
        const paras = [...document.querySelectorAll("main p, main li, main dd")].filter(vis).map((e) => parseFloat(getComputedStyle(e).fontSize));
        return { sw: document.documentElement.scrollWidth, small, body, minPara: Math.min(...paras) };
      });
      mobile[`${w}${p}`] = { overflow: m.sw > w, sw: m.sw, body: m.body, minPara: m.minPara, small: m.small.slice(0, 8), smallCount: m.small.length };
      await c.close();
    }
  }
  rec("mobile", mobile);
  {
    const c = await ctx({ viewport: { width: 375, height: 800 }, hasTouch: true, isMobile: true });
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    await pg.goto(BASE + "/");
    await pg.getByRole("button", { name: /menu/i }).tap();
    await pg.waitForTimeout(600);
    const open = await pg.evaluate(() => [...document.querySelectorAll("nav a")].filter((a) => { const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((a) => a.textContent.trim()));
    await pg.getByRole("link", { name: "About" }).first().tap();
    await pg.waitForURL(/about/, { timeout: 8000 }).catch(() => {});
    rec("navTouch", { linksShown: open, landed: pg.url() });
    await c.close();
  }

  // C. axe
  const axe = {};
  for (const p of PAGES) {
    const c = await ctx();
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    await pg.goto(BASE + p, { waitUntil: "load" });
    await pg.waitForTimeout(1500);
    const res = await new AxeBuilder({ page: pg }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    axe[p] = res.violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id} (${v.impact}) x${v.nodes.length} ${v.nodes[0].target}`);
    await c.close();
  }
  rec("axe", axe);

  // D. keyboard walkthrough, CV dialog, reduced motion, intro, throttled phone
  const kb = {};
  for (const p of PAGES) {
    const c = await ctx();
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    await pg.goto(BASE + p, { waitUntil: "load" });
    await pg.waitForTimeout(1200);
    const stops = [], noFocusRing = [];
    for (let i = 0; i < 45; i++) {
      await pg.keyboard.press("Tab");
      const s = await pg.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return null; const cs = getComputedStyle(a); const ring = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 || cs.boxShadow !== "none"; return { t: (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 28), ring, off: a.getBoundingClientRect().bottom < 0 }; });
      if (!s) continue;
      stops.push(s.t);
      if (!s.ring) noFocusRing.push(s.t);
    }
    kb[p] = { stops: stops.length, first: stops.slice(0, 4), noFocusRing: [...new Set(noFocusRing)].slice(0, 6) };
    await c.close();
  }
  rec("keyboard", kb);
  {
    const c = await ctx();
    const pg = await c.newPage();
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    await pg.goto(BASE + "/");
    await pg.waitForTimeout(1200);
    const trig = pg.locator("[data-cv-trigger]").first();
    await trig.focus();
    await pg.keyboard.press("Enter");
    await pg.waitForTimeout(800);
    const open = await pg.locator("dialog[open]").count();
    let trapped = true;
    for (let i = 0; i < 8; i++) { await pg.keyboard.press("Tab"); if (!(await pg.evaluate(() => !!document.activeElement?.closest("dialog")))) trapped = false; }
    await pg.keyboard.press("Escape");
    await pg.waitForTimeout(500);
    rec("cvDialog", { opened: open, trapped, closedOnEsc: (await pg.locator("dialog[open]").count()) === 0, focusBack: await pg.evaluate(() => !!document.activeElement?.closest("[data-cv-trigger]") || document.activeElement?.hasAttribute("data-cv-trigger")) });
    await c.close();
  }
  {
    const rm = {};
    for (const p of PAGES) {
      const c = await ctx({ reducedMotion: "reduce" });
      const pg = await c.newPage();
      await pg.goto(BASE + p, { waitUntil: "load" });
      await pg.waitForTimeout(1500);
      rm[p] = await pg.evaluate(() => ({ pins: document.querySelectorAll(".pin-spacer").length, intro: !!document.querySelector(".intro-overlay,[data-intro]:not([hidden])"), hidden: [...document.querySelectorAll("main h1,main h2:not(.sr-only),main p")].filter((e) => getComputedStyle(e).opacity === "0" || getComputedStyle(e).visibility === "hidden").length }));
      await c.close();
    }
    rec("reducedMotion", rm);
  }
  {
    const c = await ctx();
    const pg = await c.newPage();
    const t0 = Date.now();
    await pg.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const skipVisible = await pg.getByRole("button", { name: /skip intro/i }).isVisible().catch(() => false);
    const overlayAt = await pg.locator("[data-intro-overlay], .intro, #intro").count();
    let gone = null;
    const start = Date.now();
    while (Date.now() - start < 9000) {
      const blocking = await pg.evaluate(() => { const o = [...document.querySelectorAll("body *")].find((e) => /intro/i.test(e.className?.toString() || "") && getComputedStyle(e).position === "fixed" && e.getBoundingClientRect().width > innerWidth * 0.9 && getComputedStyle(e).opacity !== "0" && getComputedStyle(e).display !== "none"); return !!blocking || document.documentElement.classList.contains("intro"); });
      if (!blocking) { gone = Date.now() - t0; break; }
      await pg.waitForTimeout(100);
    }
    rec("intro", { skipVisible, overlayPresent: overlayAt, blockedMs: gone, html: await pg.evaluate(() => document.documentElement.className) });
    await c.close();
    const c2 = await ctx();
    const p2 = await c2.newPage();
    await p2.goto(BASE + "/", { waitUntil: "domcontentloaded" });
    const sk = p2.getByRole("button", { name: /skip intro/i });
    let skipWorks = null;
    if (await sk.isVisible().catch(() => false)) { const t = Date.now(); await sk.click(); await p2.waitForFunction(() => !document.documentElement.classList.contains("intro"), null, { timeout: 4000 }).catch(() => {}); skipWorks = Date.now() - t; }
    rec("skip", { clickToDoneMs: skipWorks });
    await c2.close();
  }
  {
    const c = await ctx({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const pg = await c.newPage();
    const cdp = await c.newCDPSession(pg);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    const errs = [];
    pg.on("pageerror", (e) => errs.push(e.message.slice(0, 120)));
    await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
    const t0 = Date.now();
    await pg.goto(BASE + "/", { waitUntil: "load", timeout: 90000 });
    const load = Date.now() - t0;
    const h1 = await pg.locator("h1").first().isVisible();
    const lcp = await pg.evaluate(() => new Promise((res) => { new PerformanceObserver((l) => res(Math.round(l.getEntries().at(-1).startTime))).observe({ type: "largest-contentful-paint", buffered: true }); setTimeout(() => res(null), 1500); }));
    rec("throttledPhone", { loadMs: load, lcpMs: lcp, h1Visible: h1, errors: errs, overflow: await pg.evaluate(() => document.documentElement.scrollWidth > 375) });
    await pg.screenshot({ path: OUT + "/throttled-phone.png" });
    await c.close();
  }

  // D. visible copy for no-ai-slop
  {
    const c = await ctx();
    const pg = await c.newPage();
    const copy = {};
    for (const p of PAGES) {
      await pg.addInitScript(() => { try { sessionStorage.setItem("ak.intro", "1"); } catch {} });
      await pg.goto(BASE + p, { waitUntil: "load" });
      copy[p] = await pg.evaluate(() => [...document.querySelectorAll("main h1,main h2:not(.sr-only),main h3,main p,main dd,main li")].filter((e) => e.getBoundingClientRect().width > 0 && !e.closest(".sr-only,[aria-hidden=true],[data-marquee]")).map((e) => e.textContent.replace(/\s+/g, " ").trim()).filter((t, i, a) => t && a.indexOf(t) === i));
    }
    rec("copy", copy);
    await c.close();
  }

  fs.writeFileSync(OUT + "/audit.json", JSON.stringify(R, null, 1));
  console.log("done");
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
