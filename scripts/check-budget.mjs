// Fails the build when any page's entry JavaScript exceeds the budget (docs/ENGINEERING-PLAN.md §9).
// first load = module scripts and modulepreloads in the page's HTML, plus their static imports.
// lazy       = chunks those files can import() later (the 3D world, page moments), reported only.
// Round 2 (r1, built in r3): the 150 KB limit applies to first load only. Lazily loaded 3D and visual
// chunks have no size limit; Lighthouse judges them instead. The 3D chunk must stay lazy: a page
// whose first load contains three.js fails.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 150;
const DIST = "dist";
const STATIC_IMPORT = /(?:^|[;\s}])import(?:[^"'()]*?from)?\s*["']([^"']+\.js)["']/g;
// Vite emits dynamic imports with backticks: import(`./chunk.js`).
const DYNAMIC_IMPORT = /import\(\s*["'`]([^"'`]+\.js)["'`]\s*\)/g;

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? htmlFiles(path) : name.endsWith(".html") ? [path] : [];
  });
}

function resolve(file, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null;
  return spec.startsWith("/") ? spec.slice(1) : posix.join(posix.dirname(file), spec);
}

function closure(entries, seen, lazy) {
  const stack = [...entries];
  while (stack.length) {
    const file = stack.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const code = readFileSync(join(DIST, file), "utf8");
    for (const m of code.matchAll(STATIC_IMPORT)) {
      const target = resolve(file, m[1]);
      if (target) stack.push(target);
    }
    for (const m of code.matchAll(DYNAMIC_IMPORT)) {
      const target = resolve(file, m[1]);
      if (target) lazy.add(target);
    }
  }
}

const is3d = (file) => /WebGLRenderer/.test(readFileSync(join(DIST, file), "utf8"));
const gz = (files) => [...files].reduce((sum, file) => sum + gzipSync(readFileSync(join(DIST, file))).length, 0);

let failed = false;
for (const html of htmlFiles(DIST)) {
  const source = readFileSync(html, "utf8");
  const entries = [
    ...source.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
    ...source.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
  ].map((m) => m[1].replace(/^\//, ""));

  const first = new Set();
  const lazyEntries = new Set();
  closure(entries, first, lazyEntries);
  let inline = 0;
  for (const m of source.matchAll(/<script type="module">([\s\S]*?)<\/script>/g))
    inline += gzipSync(m[1]).length;

  // Lazy chunks keep following their own dynamic imports (a lazy chunk can load another).
  const lazy = new Set(first);
  let frontier = [...lazyEntries];
  while (frontier.length) {
    const next = new Set();
    closure(frontier, lazy, next);
    frontier = [...next].filter((f) => !lazy.has(f));
  }
  for (const f of first) lazy.delete(f);

  const firstKb = (gz(first) + inline) / 1024;
  const lazyKb = gz(lazy) / 1024;
  const threeInFirst = [...first].some(is3d);
  const ok = firstKb <= BUDGET_KB && !threeInFirst;
  if (!ok) failed = true;
  const page = html
    .split("\\")
    .join("/")
    .replace(/^dist/, "")
    .replace(/index\.html$/, "");
  const fmt = (n) => n.toFixed(1).padStart(6);
  console.log(
    `${ok ? "ok  " : "FAIL"} first ${fmt(firstKb)} KB (limit ${BUDGET_KB}) · lazy ${fmt(lazyKb)} KB (reported)${threeInFirst ? " · three.js in first load" : ""}  ${page}`,
  );
}

if (failed) {
  console.error(`\nFirst-load JavaScript over ${BUDGET_KB} KB gzip, or three.js in a first load, on a page.`);
  process.exit(1);
}
console.log(`\nAll pages: first load under ${BUDGET_KB} KB gzip, 3D lazy. Lazy chunks are reported, not limited.`);
