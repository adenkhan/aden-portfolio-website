import type { Material, Object3D, Texture, WebGLRenderer } from "three";

interface Disposable {
  dispose(): void;
}

/** Frees every GPU resource the intro created, then drops the WebGL context (docs/ENGINEERING-PLAN.md §6). */
export function disposeScene(
  root: Object3D,
  renderer: WebGLRenderer,
  composer: Disposable,
  textures: Texture[],
): { geometries: number; textures: number } {
  root.traverse((node) => {
    const mesh = node as Object3D & { geometry?: Disposable; material?: Material | Material[] };
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) material.dispose();
  });
  for (const texture of textures) texture.dispose();
  composer.dispose();

  const left = { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures };
  renderer.dispose();
  renderer.forceContextLoss();
  renderer.domElement.remove();
  return left;
}
