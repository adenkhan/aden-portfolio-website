import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { ImageMetadata } from "astro";
import { getSlot } from "@/data/assets";
import type { AssetKey } from "@/data/types";
import placeholderHashes from "@/data/placeholder-hashes.json";

const images = import.meta.glob<{ default: ImageMetadata }>("/src/assets/**/*.{png,webp}", {
  eager: true,
});

export function getImageFor(id: AssetKey): ImageMetadata {
  const slot = getSlot(id);
  const mod = images[`/${slot.path}`];
  if (!mod) throw new Error(`Missing image file for slot ${id}: ${slot.path}`);
  return mod.default;
}

/** True while the file at the slot's path is still the generated placeholder. Build-time only. */
export function isPlaceholder(id: AssetKey): boolean {
  const slot = getSlot(id);
  const expected = (placeholderHashes as Record<string, string>)[slot.path];
  if (!expected) return false;
  try {
    const hash = createHash("sha256").update(readFileSync(slot.path)).digest("hex");
    return hash === expected;
  } catch {
    return false;
  }
}
