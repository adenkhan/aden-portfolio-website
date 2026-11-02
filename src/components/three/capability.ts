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

/**
 * True when the GPU is a software rasteriser (SwiftShader, llvmpipe, Microsoft Basic Render).
 * Such devices draw every frame on the CPU, so the 3D world would starve the page: they get the
 * CSS/2D versions instead (a capability limit, docs/MOTION.md §0). Some report no caveat, hence this.
 */
export function isSoftwareRenderer(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ?? canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return true;
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
