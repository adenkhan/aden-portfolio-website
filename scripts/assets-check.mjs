// Lists which asset slots still hold the generated placeholder.
// A slot counts as replaced as soon as its file's hash differs from the recorded placeholder hash.
// Usage: npm run assets:check            (always exits 0)
//        npm run assets:check -- --strict  (exits 1 while any placeholder remains)
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { assetSlots } from "../src/data/assets.ts";

const hashes = JSON.parse(readFileSync("src/data/placeholder-hashes.json", "utf8"));
const rows = assetSlots.map((slot) => {
  if (!existsSync(slot.path)) return { slot, status: "MISSING" };
  const hash = createHash("sha256").update(readFileSync(slot.path)).digest("hex");
  return { slot, status: hashes[slot.path] === hash ? "placeholder" : "real" };
});

const width = Math.max(...rows.map((r) => r.slot.path.length));
for (const { slot, status } of rows)
  console.log(`${status.padEnd(12)} ${slot.path.padEnd(width)}  ${slot.id}`);

const pending = rows.filter((r) => r.status !== "real");
console.log(
  `\n${rows.length - pending.length}/${rows.length} slots hold real files; ${pending.length} still to replace.`,
);
if (process.argv.includes("--strict") && pending.length > 0) process.exit(1);
