// Fails the build when any page's JavaScript exceeds the budget (docs/ENGINEERING-PLAN.md §9).
// first load = module scripts and modulepreloads in the page's HTML, plus their static imports.
// + lazy    = chunks those files can import() later (for example the idle-loaded particles).
// The budget applies to first load + lazy. Excluded: three.js/postprocessing (lazy 3D) and the optional
// Lottie and Rive runtimes, which load only on user intent (hover or focus) and only when their asset
// files exist (docs/DECISIONS.md, p13). Idle-loaded code such as tsParticles still counts (p07).
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

const is3d = (code) => /three\.module|postprocessing|WebGLRenderer/.test(code);
const INTENT_ONLY = [/(^|\/)lottie_light\./, /(^|\/)rive\./];
const excluded = (file, code) => is3d(code) || INTENT_ONLY.some((re) => re.test(file));
const gz = (files) =>
  [...files].reduce((sum, file) => {
    const code = readFileSync(join(DIST, file));
    return excluded(file, code.toString("utf8")) ? sum : sum + gzipSync(code).length;
  }, 0);

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
  const total = firstKb + lazyKb;
  const ok = total <= BUDGET_KB;
  if (!ok) failed = true;
  const page = html
    .split("\\")
    .join("/")
    .replace(/^dist/, "")
    .replace(/index\.html$/, "");
  const fmt = (n) => n.toFixed(1).padStart(6);
  console.log(
    `${ok ? "ok  " : "FAIL"} first ${fmt(firstKb)} KB + lazy ${fmt(lazyKb)} KB = ${fmt(total)} KB  ${page}`,
  );
}

if (failed) {
  console.error(
    `\nJavaScript over ${BUDGET_KB} KB gzip (first load + lazy, excluding 3D) on at least one page.`,
  );
  process.exit(1);
}
console.log(`\nAll pages under ${BUDGET_KB} KB gzip (first load + lazy, excluding 3D).`);
