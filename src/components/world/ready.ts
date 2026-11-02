import type { World } from "./scene";

/**
 * Resolves with the running world, or null when it cannot run (no usable WebGL, an error).
 * Light on purpose: the intro imports this to wait for the world without pulling in three.js.
 */
let settle: (world: World | null) => void = () => {};
export const worldReady: Promise<World | null> = new Promise((resolve) => (settle = resolve));

export function resolveWorld(world: World | null): void {
  settle(world);
}
