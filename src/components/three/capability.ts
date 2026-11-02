interface NavigatorHints extends Navigator {
  connection?: { saveData?: boolean };
}

/** WebGL without a major performance caveat (software rendering counts as unusable). */
export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const options = { failIfMajorPerformanceCaveat: true };
    const gl = canvas.getContext("webgl2", options) ?? canvas.getContext("webgl", options);
    if (!gl) return false;
    (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Low-power hints from the owner's p11 rule: few CPU cores or data saver. */
export function isLowPower(): boolean {
  const nav = navigator as NavigatorHints;
  return (nav.hardwareConcurrency ?? 8) <= 4 || nav.connection?.saveData === true;
}

export function isMobileViewport(): boolean {
  return window.innerWidth < 768 || !matchMedia("(hover: hover) and (pointer: fine)").matches;
}
