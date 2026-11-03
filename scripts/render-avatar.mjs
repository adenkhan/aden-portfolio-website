#!/usr/bin/env node
/**
 * Renders the owner's VRoid avatar (public/models/avatar.vrm, never modified) to still images with
 * the same three-vrm setup the site uses (r9, docs/ASSETS.md):
 *   node scripts/render-avatar.mjs look     → scratch look-check render next to VRoid's own thumbnail
 *   node scripts/render-avatar.mjs poster   → src/assets/avatar/avatar.webp (1200×1500, transparent)
 *   node scripts/render-avatar.mjs og       → src/assets/og/<page>.png (1200×630 per page)
 *   node scripts/render-avatar.mjs tune <dir> '[[key, ambient], …]'  → face renders for light tuning
 *   node scripts/render-avatar.mjs all      → poster and og
 * LOOK RULE: her MToon materials are untouched and she is lit like VRoid Studio: one white directional
 * light plus ambient. The poster's red and blue rims are a glow composited around her silhouette in 2D,
 * so they never tint her skin.
 * A tiny static server hands the browser three and three-vrm straight from node_modules (import map).
 */
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { transform } from "esbuild";

const ROOT = resolve(import.meta.dirname, "..");
const mode = process.argv[2] ?? "all";
const outDir = process.argv[3];

const TYPES = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".vrm": "model/gltf-binary",
  ".html": "text/html",
};

const PAGE = /* html */ `<!doctype html>
<html><head><meta charset="utf-8">
<style>html,body{margin:0;background:transparent}canvas{display:block}</style>
<script type="importmap">{"imports":{
  "three":"/node_modules/three/build/three.module.js",
  "three/addons/":"/node_modules/three/examples/jsm/",
  "three/examples/jsm/":"/node_modules/three/examples/jsm/",
  "@pixiv/three-vrm":"/node_modules/@pixiv/three-vrm/lib/three-vrm.module.js"
}}</script></head><body>
<script type="module">
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { applyLook, relaxedPose, frame } from "/src/components/three/avatar/look.ts";

window.render = async (opts) => {
  const { width, height, shot, expression = {}, lookAtCamera = true, light } = opts;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  document.body.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, width / height, 0.1, 20);
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync("/public/models/avatar.vrm");
  const vrm = gltf.userData.vrm;
  VRMUtils.removeUnnecessaryVertices(gltf.scene);
  VRMUtils.combineSkeletons(gltf.scene);
  vrm.scene.traverse((o) => (o.frustumCulled = false));
  scene.add(vrm.scene);
  const lights = applyLook(scene);
  // Tuning only (mode "tune"): try other intensities against VRoid's thumbnail.
  if (light) {
    lights.key.intensity = light.key;
    lights.ambient.intensity = light.ambient;
  }
  relaxedPose(vrm);
  for (const [name, w] of Object.entries(expression)) vrm.expressionManager?.setValue(name, w);
  frame(camera, vrm, shot);
  if (lookAtCamera && vrm.lookAt) vrm.lookAt.target = camera;
  // Let the spring bones settle into the pose before the still is taken.
  for (let i = 0; i < 180; i++) vrm.update(1 / 60);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL("image/png");
};
window.ready = true;
</script></body></html>`;

function serve() {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    if (url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html" });
      return res.end(PAGE);
    }
    const path = normalize(join(ROOT, decodeURIComponent(url.pathname)));
    if (!path.startsWith(ROOT)) return res.writeHead(403).end();
    try {
      const body = await readFile(path);
      // Site TypeScript (the shared look) is transpiled on the fly.
      if (extname(path) === ".ts") {
        const { code } = await transform(body.toString(), { loader: "ts", format: "esm" });
        res.writeHead(200, { "content-type": "text/javascript" });
        return res.end(code);
      }
      res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

/** Composites a soft red rim on the left and a blue one on the right, outside her silhouette only. */
const RIM = (dataUrl, width, height) => `(async () => {
  const img = new Image(); img.src = ${JSON.stringify(dataUrl)}; await img.decode();
  const c = document.createElement("canvas"); c.width = ${width}; c.height = ${height};
  const g = c.getContext("2d");
  const tint = (color, dx) => {
    const t = document.createElement("canvas"); t.width = c.width; t.height = c.height;
    const tg = t.getContext("2d");
    tg.drawImage(img, 0, 0); tg.globalCompositeOperation = "source-in"; tg.fillStyle = color; tg.fillRect(0, 0, t.width, t.height);
    g.save(); g.filter = "blur(10px)"; g.globalAlpha = 0.9; g.drawImage(t, dx, 0); g.restore();
  };
  tint("rgb(255 77 109)", -9);
  tint("rgb(56 182 255)", 9);
  g.drawImage(img, 0, 0);
  return c.toDataURL("image/webp", 0.9);
})()`;

const toBuffer = (dataUrl) => Buffer.from(dataUrl.split(",")[1], "base64");

/** Open Graph card: the site's navy, a soft red and blue orb meeting in the page's accent, her on the right. No text. */
const OG_ACCENT = { home: "#a77cff", about: "#ff4d6a", work: "#3db0ff", contact: "#a77cff" };
const OG = (dataUrl, accent, meet = false) => `(async () => {
  const img = new Image(); img.src = ${JSON.stringify(dataUrl)}; await img.decode();
  const c = document.createElement("canvas"); c.width = 1200; c.height = 630;
  const g = c.getContext("2d");
  g.fillStyle = "#0b0d1a"; g.fillRect(0, 0, 1200, 630);
  const glow = (x, y, r, color, a) => {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color); grad.addColorStop(1, "transparent");
    g.globalAlpha = a; g.fillStyle = grad; g.fillRect(0, 0, 1200, 630); g.globalAlpha = 1;
  };
  glow(${meet ? 340 : 250}, 330, 260, "#ff4d6a", 0.55);
  glow(${meet ? 400 : 470}, 300, 260, "#3db0ff", 0.55);
  glow(780, 320, 380, ${JSON.stringify(accent)}, 0.45);
  g.drawImage(img, 0, 0);
  return c.toDataURL("image/png");
})()`;

/** VRoid's own thumbnail (stored in the VRM) beside our render, for the LOOK RULE check. */
async function vroidThumbnail() {
  const b = await readFile(join(ROOT, "public/models/avatar.vrm"));
  const len = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + len).toString());
  const img = json.images[json.extensions.VRMC_vrm.meta.thumbnailImage];
  const view = json.bufferViews[img.bufferView];
  const start = 20 + len + 8 + (view.byteOffset ?? 0);
  return `data:${img.mimeType};base64,${b.subarray(start, start + view.byteLength).toString("base64")}`;
}
const SIDE_BY_SIDE = (left, right) => `(async () => {
  const load = async (src) => { const i = new Image(); i.src = src; await i.decode(); return i; };
  const [a, b] = await Promise.all([load(${JSON.stringify(left)}), load(${JSON.stringify(right)})]);
  const c = document.createElement("canvas"); c.width = 2048; c.height = 1024;
  const g = c.getContext("2d"); g.fillStyle = "#ececec"; g.fillRect(0, 0, 2048, 1024);
  g.drawImage(a, 0, 0, 1024, 1024); g.drawImage(b, 1024, 0, 1024, 1024);
  return c.toDataURL("image/png");
})()`;

const server = await serve();
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error("[page]", e.message));
  await page.goto(base);
  await page.waitForFunction(() => window.ready);
  const render = (opts) => page.evaluate((o) => window.render(o), opts);

  if (mode === "look") {
    const dir = outDir ?? join(ROOT, "docs/screens/round4");
    await mkdir(dir, { recursive: true });
    const face = await render({ width: 1024, height: 1024, shot: "face" });
    await writeFile(join(dir, "look-face.png"), toBuffer(face));
    const compare = await page.evaluate(SIDE_BY_SIDE(await vroidThumbnail(), face));
    await writeFile(join(dir, "look-compare.png"), toBuffer(compare));
    const body = await render({ width: 1200, height: 1500, shot: "poster" });
    await writeFile(join(dir, "look-poster.png"), toBuffer(body));
    console.log("look renders in", dir);
  }

  if (mode === "tune") {
    const dir = outDir ?? join(ROOT, "docs/screens/round4");
    for (const [key, ambient] of JSON.parse(process.argv[4] ?? "[[2,1]]")) {
      const face = await render({ width: 1024, height: 1024, shot: "face", light: { key, ambient } });
      await writeFile(join(dir, `tune-${key}-${ambient}.png`), toBuffer(face));
    }
  }

  if (mode === "poster" || mode === "all") {
    const raw = await render({ width: 1200, height: 1500, shot: "poster", expression: { happy: 0.15 } });
    const webp = await page.evaluate(RIM(raw, 1200, 1500));
    await writeFile(join(ROOT, "src/assets/avatar/avatar.webp"), toBuffer(webp));
    console.log("src/assets/avatar/avatar.webp");
  }

  if (mode === "og" || mode === "all") {
    for (const [name, accent] of Object.entries(OG_ACCENT)) {
      const raw = await render({ width: 1200, height: 630, shot: `og-${name}`, expression: { happy: 0.18 } });
      // Contact: the orbs meet (a channel opened); every card differs, so each page gets its own file.
      const png = await page.evaluate(OG(raw, accent, name === "contact"));
      await writeFile(join(ROOT, `src/assets/og/${name}.png`), toBuffer(png));
      console.log(`src/assets/og/${name}.png`);
    }
  }
} finally {
  await browser.close();
  server.close();
}
