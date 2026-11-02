import { AdditiveBlending, Color, Group, Vector2, Vector3 } from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

/**
 * Procedural lightning for Convergence (r7, docs/MOTION.md §16). Each bolt is built by recursive
 * midpoint displacement (depth 4–8 by quality tier) with random branches, drawn as thick additive
 * lines that the bloom pass lights up. Bolts regenerate every 50–90 ms so they flicker.
 * Buffers are allocated once per bolt and rewritten in place: regenerating never allocates GPU memory.
 */
const MAX_BOLTS = 10;
const BRANCH_CHANCE = 0.25;

interface Bolt {
  line: LineSegments2;
  data: Float32Array;
  maxSegments: number;
  next: number;
}

export class Lightning {
  readonly group = new Group();
  private readonly bolts: Bolt[] = [];
  private readonly material: LineMaterial;
  private readonly tmp = new Vector3();
  private readonly perp = new Vector3();
  /** Set to 1 on a major strike; the world turns it into a white-hot flash and decays it. */
  strike = 0;

  constructor(
    private depth: number,
    resolution: Vector2,
  ) {
    this.material = new LineMaterial({
      color: new Color(1.6, 1.5, 2.2),
      linewidth: 2,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
      depthWrite: false,
      worldUnits: false,
    });
    this.material.resolution.copy(resolution);
    // A bolt has 2^depth segments plus branches; the buffer holds the worst case.
    const maxSegments = (1 << 8) * 2;
    for (let i = 0; i < MAX_BOLTS; i++) {
      const geometry = new LineSegmentsGeometry();
      const data = new Float32Array(maxSegments * 6);
      geometry.setPositions(data);
      const line = new LineSegments2(geometry, this.material);
      line.frustumCulled = false;
      line.visible = false;
      this.group.add(line);
      this.bolts.push({ line, data, maxSegments, next: 0 });
    }
  }

  setDepth(depth: number) {
    this.depth = depth;
  }

  setResolution(width: number, height: number) {
    this.material.resolution.set(width, height);
  }

  /** Writes one bolt from a to b into the buffer; returns the segment count. */
  private build(bolt: Bolt, a: Vector3, b: Vector3, jag: number): number {
    const points: Vector3[] = [a.clone(), b.clone()];
    const segments: [Vector3, Vector3][] = [];
    // Midpoint displacement: each level halves every segment and pushes the midpoint sideways.
    let offset = a.distanceTo(b) * jag;
    let path = points;
    for (let level = 0; level < this.depth; level++) {
      const next: Vector3[] = [path[0]];
      for (let i = 0; i < path.length - 1; i++) {
        const p = path[i];
        const q = path[i + 1];
        const mid = this.tmp.copy(p).add(q).multiplyScalar(0.5).clone();
        this.perp.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        mid.addScaledVector(this.perp, (Math.random() - 0.5) * 2 * offset);
        next.push(mid, q);
        // Branch: a short fork off this midpoint, continuing roughly along the bolt.
        if (level >= 2 && Math.random() < BRANCH_CHANCE / (level - 1)) {
          const dir = this.tmp.copy(q).sub(p);
          const end = mid.clone().addScaledVector(dir, 0.6 + Math.random() * 0.8);
          end.addScaledVector(
            this.perp.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
            offset * 2,
          );
          segments.push([mid.clone(), end]);
        }
      }
      path = next;
      offset *= 0.55;
    }
    for (let i = 0; i < path.length - 1; i++) segments.push([path[i], path[i + 1]]);

    const count = Math.min(segments.length, bolt.maxSegments);
    for (let i = 0; i < count; i++) {
      const [p, q] = segments[i];
      bolt.data.set([p.x, p.y, p.z, q.x, q.y, q.z], i * 6);
    }
    const geometry = bolt.line.geometry as LineSegmentsGeometry;
    const start = geometry.getAttribute("instanceStart") as unknown as { data: { needsUpdate: boolean } };
    start.data.needsUpdate = true;
    geometry.instanceCount = count;
    return count;
  }

  /**
   * One frame. `intensity` (0–1) sets how many bolts burn and how thick; `a` and `b` are the orbs.
   * Between-orb bolts arc a→b; the rest leap from either orb into the space around it.
   */
  update(now: number, a: Vector3, b: Vector3, intensity: number, reach: number) {
    const between = intensity > 0.02 ? 1 + Math.round(intensity * 2) : 0;
    const outward = Math.round(intensity * 6);
    const active = Math.min(MAX_BOLTS, between + outward);
    this.material.linewidth = 1.2 + intensity * 3.2;
    this.material.opacity = Math.min(1, 0.35 + intensity);

    this.bolts.forEach((bolt, i) => {
      const on = i < active;
      bolt.line.visible = on;
      if (!on || now < bolt.next) return;
      bolt.next = now + 50 + Math.random() * 40;
      if (i < between) {
        this.build(bolt, a, b, 0.22);
        // A major strike: a strong between-orb bolt at high charge.
        if (intensity > 0.6 && Math.random() < 0.3) this.strike = 1;
      } else {
        const from = i % 2 ? a : b;
        const to = this.tmp
          .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
          .normalize()
          .multiplyScalar(reach * (0.6 + Math.random() * 0.8))
          .add(from)
          .clone();
        this.build(bolt, from, to, 0.3);
      }
    });
  }

  hide() {
    for (const bolt of this.bolts) bolt.line.visible = false;
  }
}
