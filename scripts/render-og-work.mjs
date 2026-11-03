#!/usr/bin/env node
/**
 * The /work Open Graph card (r10): a 1200×630 collage of the owner's creatives with the page title.
 *   node scripts/render-og-work.mjs   → src/assets/og/work.png
 * The creatives keep their own colours on the site's navy; the title uses the site's display face.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const ROOT = resolve(import.meta.dirname, "..");
const dataUrl = (path, type) => `data:${type};base64,${readFileSync(join(ROOT, path)).toString("base64")}`;
const creative = (file) => dataUrl(`src/assets/work/creative/${file}`, "image/webp");
const font = dataUrl(
  "node_modules/@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2",
  "font/woff2",
);

// Five pieces, one per campaign, fanned on the right; the tall concept poster sits behind.
const pieces = [
  { src: creative("good-liar-02-blend-in.webp"), w: 230, x: 930, y: 40, r: 9 },
  { src: creative("sadiq-blysmo-bundles-02-bb-night-cream-set.webp"), w: 250, x: 560, y: 300, r: -8 },
  { src: creative("sadiq-psychology-01-add-to-cart-syndrome.webp"), w: 270, x: 660, y: 120, r: -3 },
  { src: creative("sadiq-eid-02-totes-and-knots-10-off.webp"), w: 240, x: 830, y: 320, r: 6 },
  { src: creative("sadiq-social-commerce-01-what-is-social-commerce.webp"), w: 260, x: 840, y: 90, r: 4 },
];

const html = `<!doctype html><html><head><style>
@font-face { font-family: "Display"; src: url(${font}) format("woff2"); font-weight: 100 900; }
html, body { margin: 0; }
.card { position: relative; width: 1200px; height: 630px; overflow: hidden; background: #0b0d1a; font-family: "Display", sans-serif; }
.glow { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .55; }
.piece { position: absolute; border-radius: 10px; box-shadow: 0 18px 40px rgb(0 0 0 / .5); }
h1 { position: absolute; left: 64px; top: 150px; width: 470px; margin: 0; color: #f2f3fa; font-size: 92px; line-height: .95; font-weight: 900; letter-spacing: -.01em; }
p { position: absolute; left: 66px; top: 470px; margin: 0; color: #a9aecb; font: 500 26px/1.3 system-ui, sans-serif; }
.bar { position: absolute; left: 66px; top: 118px; width: 120px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #ff4d6a, #a77cff, #3db0ff); }
</style></head><body><div class="card">
<div class="glow" style="left:560px;top:120px;width:360px;height:360px;background:#ff4d6a"></div>
<div class="glow" style="left:820px;top:200px;width:360px;height:360px;background:#3db0ff"></div>
${pieces.map((p) => `<img class="piece" src="${p.src}" style="left:${p.x}px;top:${p.y}px;width:${p.w}px;transform:rotate(${p.r}deg)">`).join("")}
<div class="bar"></div>
<h1>Product marketing missions</h1>
<p>Aden Khan · campaigns and case studies</p>
</div></body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.locator(".card").screenshot({ type: "png" });
  writeFileSync(join(ROOT, "src/assets/og/work.png"), png);
  console.log("src/assets/og/work.png");
} finally {
  await browser.close();
}
