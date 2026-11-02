/**
 * Runs `init` for the current page now and again for every page the client router swaps in
 * (astro:page-load), calling its cleanup on astro:before-swap. Component scripts run once per visit
 * under the router, so anything bound to page elements goes through this.
 */
export function onPage(init: () => void | (() => void)): void {
  let cleanup: void | (() => void) = init();
  // astro:page-load also fires once for the page that just ran init (on load, or after the swap
  // that executed this script for the first time); skip that one.
  let skip = true;
  document.addEventListener("astro:page-load", () => {
    if (skip) {
      skip = false;
      return;
    }
    cleanup?.();
    cleanup = init();
  });
  document.addEventListener("astro:before-swap", () => {
    cleanup?.();
    cleanup = undefined;
    skip = false;
  });
}
