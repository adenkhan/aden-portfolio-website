// Fails the build when any page's first-load JavaScript exceeds the budget (docs/ENGINEERING-PLAN.md §9).
// First load = every module script and modulepreload in the page's HTML, plus their static imports.
// Excluded: chunks that contain three.js or postprocessing (lazy 3D only).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 150;
const DIST = "dist";

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : name.endsWith(".html") ? [path] : [];
  });
}

function staticImports(file, seen) {
  if (seen.has(file)) return;
  seen.add(file);
  const code = readFileSync(join(DIST, file), "utf8");
  // Static `import ... from "./x.js"` and bare `import "./x.js"`; dynamic import() is lazy and skipped.
  for (const match of code.matchAll(/(?:^|[;\s}])import(?:[^"'()]*?from)?\s*["']([^"']+\.js)["']/g)) {
    const spec = match[1];
    if (!spec.startsWith(".") && !spec.startsWith("/")) continue;
    const target = spec.startsWith("/") ? spec.slice(1) : posix.join(posix.dirname(file), spec);
    staticImports(target, seen);
  }
}

let failed = false;
for (const html of htmlFiles(DIST)) {
  const source = readFileSync(html, "utf8");
  const entries = [
    ...source.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
    ...source.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
  ].map((m) => m[1].replace(/^\//, ""));
  const files = new Set();
  for (const entry of entries) staticImports(entry, files);

  let bytes = 0;
  for (const file of files) {
    const code = readFileSync(join(DIST, file));
    if (/three\.module|postprocessing/i.test(code.toString("utf8", 0, 4000))) continue;
    bytes += gzipSync(code).length;
  }
  // Inline module scripts count too.
  for (const m of source.matchAll(/<script type="module">([\s\S]*?)<\/script>/g))
    bytes += gzipSync(m[1]).length;

  const kb = bytes / 1024;
  const page = html
    .split("\\")
    .join("/")
    .replace(/^dist/, "")
    .replace(/index\.html$/, "");
  const ok = kb <= BUDGET_KB;
  if (!ok) failed = true;
  console.log(`${ok ? "ok  " : "FAIL"} ${kb.toFixed(1).padStart(6)} KB  ${page}`);
}

if (failed) {
  console.error(`\nFirst-load JS over ${BUDGET_KB} KB gzip on at least one page.`);
  process.exit(1);
}
console.log(`\nAll pages under ${BUDGET_KB} KB gzip first-load JS.`);
