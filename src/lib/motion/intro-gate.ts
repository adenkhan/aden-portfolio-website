const INTRO_WAIT_MS = 3000;

/**
 * On Home's first visit the hero is revealed by the intro: wait for its reveal beat.
 * Resolves `instant: true` when the intro was skipped, so the hero shows its final state at once.
 * Resolves immediately when no intro is playing.
 */
export function introGate(): Promise<{ instant: boolean }> {
  if (!document.documentElement.classList.contains("intro")) return Promise.resolve({ instant: false });
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ instant: true }), INTRO_WAIT_MS);
    window.addEventListener(
      "ak:intro-reveal",
      (event) => {
        clearTimeout(timer);
        resolve({ instant: Boolean((event as CustomEvent<{ instant: boolean }>).detail?.instant) });
      },
      { once: true },
    );
  });
}
