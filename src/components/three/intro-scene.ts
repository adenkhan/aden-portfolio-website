import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  HalfFloatType,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import {
  BloomEffect,
  ChromaticAberrationEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";
import { disposeScene } from "./dispose";
import { LANE, orbSizeFor, type IntroStage, type IntroState, type StageGeometry } from "./stage";

/** Soft round sprite shared by the orbs and the core. */
function glowTexture(): CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.75)");
  g.addColorStop(0.55, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * The 3D intro: two glowing orbs collide into a purple core, a shockwave ring and a particle burst,
 * lit by bloom. Orthographic camera in viewport pixels, so the 2D and 3D versions share coordinates.
 */
export function createIntroScene(host: HTMLElement, g: StageGeometry): IntroStage {
  const renderer = new WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, g.mobile ? 1.5 : 2));
  renderer.setSize(g.width, g.height);
  // Pure black: a dark non-zero clear colour comes out grey after the colour-space round trip.
  renderer.setClearColor(0x000000, 1);
  renderer.domElement.className = "intro-canvas";
  host.append(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera(0, g.width, 0, -g.height, -10, 10);
  const texture = glowTexture();
  const orbSize = orbSizeFor(g);
  const ringSize = Math.max(g.width, g.height) * 0.35;

  const sprite = (colour: string, size: number) => {
    const mesh = new Mesh(
      new PlaneGeometry(size, size),
      new MeshBasicMaterial({
        map: texture,
        color: new Color(colour),
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    );
    scene.add(mesh);
    return mesh;
  };
  const red = sprite(LANE.creative, orbSize);
  const blue = sprite(LANE.data, orbSize);
  const core = sprite(LANE.growth, orbSize * 1.6);

  const ring = new Mesh(
    new RingGeometry(ringSize * 0.48, ringSize * 0.5, 128),
    new MeshBasicMaterial({
      color: new Color(LANE.growth),
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(ring);

  // Burst particles: fixed directions and speeds, positioned from the burst progress each frame.
  const count = g.mobile ? 80 : 160;
  const directions = new Float32Array(count * 2);
  const positions = new Float32Array(count * 3);
  const colours = new Float32Array(count * 3);
  const palette = [LANE.creative, LANE.data, LANE.growth].map((c) => new Color(c));
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.35 + Math.random() * 0.65;
    directions[i * 2] = Math.cos(angle) * speed;
    directions[i * 2 + 1] = Math.sin(angle) * speed;
    palette[i % 3].toArray(colours, i * 3);
  }
  const burstGeometry = new BufferGeometry();
  burstGeometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  burstGeometry.setAttribute("color", new Float32BufferAttribute(colours, 3));
  const burstMaterial = new PointsMaterial({
    size: g.mobile ? 2.5 : 3,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const burst = new Points(burstGeometry, burstMaterial);
  scene.add(burst);

  const composer = new EffectComposer(renderer, { frameBufferType: HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({
    intensity: 1,
    luminanceThreshold: 0.1,
    luminanceSmoothing: 0.3,
    mipmapBlur: true,
    resolutionScale: g.mobile ? 0.5 : 1,
  });
  composer.addPass(new EffectPass(camera, bloom));
  const aberration = g.mobile
    ? null
    : new ChromaticAberrationEffect({
        offset: new Vector2(0, 0),
        radialModulation: false,
        modulationOffset: 0,
      });
  if (aberration) composer.addPass(new EffectPass(camera, aberration));

  const reach = Math.max(g.width, g.height) * 0.6;
  const at = (mesh: Mesh, x: number, y: number, scale: number, opacity: number) => {
    mesh.position.set(x, -y, 0);
    mesh.scale.setScalar(Math.max(scale, 0.0001));
    (mesh.material as MeshBasicMaterial).opacity = opacity;
    mesh.visible = opacity > 0.001;
  };

  return {
    mode: "3d",
    orbSize,
    render(s: IntroState) {
      at(red, s.redX, s.redY, s.orbScale, s.orbOpacity);
      at(blue, s.blueX, s.blueY, s.orbScale, s.orbOpacity);
      at(core, g.x, g.y, s.coreScale, s.coreOpacity);
      at(ring, g.x, g.y, s.ringScale, s.ringOpacity);

      const attr = burstGeometry.getAttribute("position") as Float32BufferAttribute;
      const distance = s.burst * reach;
      for (let i = 0; i < count; i++) {
        attr.array[i * 3] = g.x + directions[i * 2] * distance;
        attr.array[i * 3 + 1] = -g.y + directions[i * 2 + 1] * distance;
      }
      attr.needsUpdate = true;
      burstMaterial.opacity = s.burst > 0 ? 1 - s.burst : 0;
      burst.visible = s.burst > 0 && s.burst < 1;

      bloom.intensity = 0.4 + s.bloom * 2.2;
      aberration?.offset.set(s.aberration, s.aberration * 0.6);
      composer.render();
    },
    dispose() {
      const left = disposeScene(scene, renderer, composer, [texture]);
      document.documentElement.dataset.introGl = `disposed:${left.geometries},${left.textures}`;
    },
  };
}
