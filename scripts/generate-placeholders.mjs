// Generates original placeholder images for every asset slot, the favicon set, and
// src/data/placeholder-hashes.json (used by `npm run assets:check` and the dev-only badge).
// Existing files are never overwritten unless --force is passed, so real assets are safe.
// Usage: node scripts/generate-placeholders.mjs [--force]
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";
import { assetSlots } from "../src/data/assets.ts";

const force = process.argv.includes("--force");
const C = {
  void: "#07080F",
  base: "#0B0D1A",
  surface: "#12152A",
  line: "#2A2F52",
  strong: "#6970B0",
  text: "#F2F3FA",
  muted: "#B4B9D6",
  red: "#FF4D6A",
  blue: "#3DB0FF",
  purple: "#A77CFF",
};
const laneColour = { creative: C.red, data: C.blue, both: C.purple };
// Mission lanes, same order as src/data/missions.ts.
const missionLanes = ["both", "data", "creative", "data", "data", "data", "both", "creative", "creative"];

const orbDefs = `
  <radialGradient id="red" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.red}" stop-opacity=".9"/><stop offset="1" stop-color="${C.red}" stop-opacity="0"/></radialGradient>
  <radialGradient id="blue" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.blue}" stop-opacity=".9"/><stop offset="1" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <radialGradient id="purple" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.purple}" stop-opacity=".95"/><stop offset="1" stop-color="${C.purple}" stop-opacity="0"/></radialGradient>
  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="${C.line}" stroke-width="1.5"/></pattern>
  <pattern id="dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2" fill="${C.text}" fill-opacity=".18"/></pattern>`;

// Neutral head-and-shoulders silhouette in front of the orb collision. Deliberately featureless.
function avatarSvg(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 1200 1500">
  <defs>${orbDefs}
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.surface}"/><stop offset="1" stop-color="${C.void}"/></linearGradient>
  </defs>
  <rect width="1200" height="1500" fill="${C.base}"/>
  <rect width="1200" height="1500" fill="url(#grid)" opacity=".5"/>
  <circle cx="330" cy="560" r="520" fill="url(#red)"/>
  <circle cx="870" cy="640" r="520" fill="url(#blue)"/>
  <circle cx="600" cy="600" r="360" fill="url(#purple)"/>
  <path d="M170 1500c20-330 200-520 430-520s410 190 430 520z" fill="url(#body)" stroke="${C.strong}" stroke-width="4"/>
  <rect x="535" y="830" width="130" height="190" rx="40" fill="url(#body)" stroke="${C.strong}" stroke-width="4"/>
  <ellipse cx="600" cy="640" rx="215" ry="250" fill="url(#body)" stroke="${C.strong}" stroke-width="4"/>
  <path d="M60 60h80M60 60v80M1140 1440h-80M1140 1440v-80" stroke="${C.text}" stroke-opacity=".6" stroke-width="6" fill="none"/>
</svg>`;
}

function cardSvg(w, h, colour, seed, halftone) {
  const cx = 0.25 * w + ((seed * 0.37) % 1) * 0.5 * w;
  const cy = 0.3 * h + ((seed * 0.61) % 1) * 0.4 * h;
  const r = Math.min(w, h) * 0.55;
  const id = colour === C.red ? "red" : colour === C.blue ? "blue" : "purple";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${orbDefs}</defs>
  <rect width="${w}" height="${h}" fill="${C.surface}"/>
  <rect width="${w}" height="${h}" fill="url(#grid)" opacity=".45"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>
  ${halftone ? `<rect x="${w * 0.55}" y="${h * 0.55}" width="${w * 0.45}" height="${h * 0.45}" fill="url(#dots)"/>` : ""}
  <path d="M${w * 0.08} ${h * 0.82}L${w * 0.32} ${h * 0.6}L${w * 0.5} ${h * 0.7}L${w * 0.78} ${h * 0.38}L${w * 0.92} ${h * 0.46}" fill="none" stroke="${colour}" stroke-width="${Math.max(4, w / 200)}" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="none" stroke="${C.strong}" stroke-width="4"/>
</svg>`;
}

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>${orbDefs}</defs>
  <rect width="1200" height="630" fill="${C.base}"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity=".45"/>
  <circle cx="470" cy="315" r="300" fill="url(#red)"/>
  <circle cx="730" cy="315" r="300" fill="url(#blue)"/>
  <circle cx="600" cy="315" r="190" fill="url(#purple)"/>
</svg>`;
}

// "AK" drawn as strokes so no font is needed.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${C.base}"/>
  <path d="M5 25 10.5 7 16 25M7.2 18.5h6.6" fill="none" stroke="${C.red}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
  <path d="M19.5 7v18M27.5 7l-8 9.5 8 8.5" fill="none" stroke="${C.blue}" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter"/>
</svg>
`;

function writeIfNeeded(path, buf) {
  if (existsSync(path) && !force) return console.log(`skip  ${path} (exists)`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  console.log(`wrote ${path}`);
}

async function render(svg, format) {
  const img = sharp(Buffer.from(svg));
  return format === "webp"
    ? img.webp({ quality: 82 }).toBuffer()
    : img.png({ compressionLevel: 9 }).toBuffer();
}

// PNG inside an ICO container (supported by every current browser).
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

for (const slot of assetSlots) {
  if (slot.format === "pdf") continue; // generated by scripts/make-cv-standin.py
  let svg;
  if (slot.id === "avatar") svg = avatarSvg(slot.width, slot.height);
  else if (slot.id === "ogDefault") svg = ogSvg();
  else {
    const n = Number(slot.id.split("-")[1]);
    const isMission = slot.id.startsWith("mission-");
    const lane = isMission ? missionLanes[n - 1] : ["creative", "data", "both"][n % 3];
    svg = cardSvg(slot.width, slot.height, laneColour[lane], n * 1.7, !isMission);
  }
  writeIfNeeded(slot.path, await render(svg, slot.format));
}

writeIfNeeded("public/favicon.svg", Buffer.from(faviconSvg));
const fav32 = await sharp(Buffer.from(faviconSvg)).resize(32, 32).png().toBuffer();
writeIfNeeded("public/favicon.ico", pngToIco(fav32, 32));
writeIfNeeded(
  "public/apple-touch-icon.png",
  await sharp(Buffer.from(faviconSvg)).resize(180, 180).png().toBuffer(),
);

// Record hashes only for files that are still the generated placeholders.
const hashFile = "src/data/placeholder-hashes.json";
const previous = existsSync(hashFile) ? JSON.parse(readFileSync(hashFile, "utf8")) : {};
const hashes = { ...previous };
for (const slot of assetSlots) {
  if (!existsSync(slot.path)) continue;
  const known = previous[slot.path];
  const current = createHash("sha256").update(readFileSync(slot.path)).digest("hex");
  // Keep the original placeholder hash once recorded, so a real file never gets marked as a placeholder.
  hashes[slot.path] = known && !force ? known : current;
}
writeFileSync(hashFile, JSON.stringify(hashes, null, 2) + "\n");
console.log(`wrote ${hashFile} (${Object.keys(hashes).length} slots)`);
