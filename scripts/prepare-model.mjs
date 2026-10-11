/**
 * Converts the SketchUp COLLADA export into the assets the site loads:
 *
 *   models-src/mobius-house.dae  →  public/models/mobius-house.glb
 *                                   public/plans/plan.svg     (minimap plan)
 *                                   src/content/generated/modelInfo.json
 *
 * The source file is a presentation layout: one assembled house on its site,
 * plus exploded floors, wall strips and flat 2D plans placed around it. Only
 * the assembled house is kept. It is then moved so the main floor sits at
 * y = 0 and the building is centred on the origin, in metres, Y-up.
 *
 * Run with `npm run prepare-model` after replacing the source file.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld } from '@gltf-transform/functions';

const require = createRequire(import.meta.url);
const assimpjs = require('assimpjs');

const SOURCE = 'models-src/mobius-house.dae';
const OUT_MODEL = 'public/models/mobius-house.glb';
const OUT_PLANS = 'public/plans';
const OUT_PLAN = `${OUT_PLANS}/plan.svg`;
const OUT_INFO = 'src/content/generated/modelInfo.json';

/** The assembled house lies beyond this Z (after the Z-up → Y-up turn). */
const ASSEMBLED_MAX_Z = -90;
/** Height of the largest upward-facing floor area: the main living level. */
const MAIN_FLOOR_Y = 10.57;

// ---------- 1. COLLADA → glTF (assimp applies the inch unit and Z-up axis) ----------
const ajs = await assimpjs();
const files = new ajs.FileList();
files.AddFile('model.dae', readFileSync(SOURCE));
const result = ajs.ConvertFileList(files, 'glb2');
if (!result.IsSuccess() || result.FileCount() === 0) {
  throw new Error(`assimp conversion failed: ${result.GetErrorCode()}`);
}
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.readBinary(result.GetFile(0).GetContent());
const root = doc.getRoot();

// ---------- 2. Keep only the assembled house, baked into world space ----------
const apply = (m, [x, y, z]) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
];
const applyDir = (m, [x, y, z]) => {
  const v = [
    m[0] * x + m[4] * y + m[8] * z,
    m[1] * x + m[5] * y + m[9] * z,
    m[2] * x + m[6] * y + m[10] * z,
  ];
  const l = Math.hypot(...v) || 1;
  return v.map((c) => c / l);
};

const scene = root.listScenes()[0];
const kept = doc.createNode('mobius-house');
const keptMesh = doc.createMesh('mobius-house');
kept.setMesh(keptMesh);

for (const node of root.listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    let zSum = 0;
    for (let i = 0; i < pos.getCount(); i++) zSum += apply(m, pos.getElement(i, []))[2];
    if (zSum / pos.getCount() > ASSEMBLED_MAX_Z) continue;

    const clone = prim.clone();
    const p = clone.getAttribute('POSITION').clone();
    for (let i = 0; i < p.getCount(); i++) p.setElement(i, apply(m, p.getElement(i, [])));
    clone.setAttribute('POSITION', p);
    const n = clone.getAttribute('NORMAL');
    if (n) {
      const nc = n.clone();
      for (let i = 0; i < nc.getCount(); i++) nc.setElement(i, applyDir(m, nc.getElement(i, [])));
      clone.setAttribute('NORMAL', nc);
    }
    keptMesh.addPrimitive(clone);
  }
}
for (const child of scene.listChildren()) child.dispose();
scene.addChild(kept);

// ---------- 3. Recentre: main floor at y = 0, footprint centred on the origin ----------
const min = [Infinity, Infinity, Infinity];
const max = [-Infinity, -Infinity, -Infinity];
for (const prim of keptMesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION');
  for (let i = 0; i < pos.getCount(); i++) {
    const v = pos.getElement(i, []);
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], v[k]);
      max[k] = Math.max(max[k], v[k]);
    }
  }
}
const offset = [-(min[0] + max[0]) / 2, -MAIN_FLOOR_Y, -(min[2] + max[2]) / 2];
const seen = new Set();
for (const prim of keptMesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION');
  if (seen.has(pos)) continue;
  seen.add(pos);
  for (let i = 0; i < pos.getCount(); i++) {
    const v = pos.getElement(i, []);
    pos.setElement(i, [v[0] + offset[0], v[1] + offset[1], v[2] + offset[2]]);
  }
}
const bounds = {
  min: min.map((v, k) => +(v + offset[k]).toFixed(3)),
  max: max.map((v, k) => +(v + offset[k]).toFixed(3)),
};

// Drop assimp-specific extensions the web loader does not need.
for (const ext of root.listExtensionsUsed()) {
  if (ext.extensionName !== 'KHR_materials_transmission') ext.dispose();
}
await doc.transform(prune(), dedup(), weld());

mkdirSync('public/models', { recursive: true });
writeFileSync(OUT_MODEL, await io.writeBinary(doc));

// ---------- 4. Plan for the minimap ----------
// Every near-vertical triangle (a wall, glazing or balustrade face) projects to
// a line on the ground plane. Together they draw the walls at every split
// level, which a single horizontal cut would miss.
function projectWalls(opaque) {
  const keys = new Set();
  const segs = [];
  for (const prim of keptMesh.listPrimitives()) {
    if (prim.getMode() !== 4) continue; // triangles only
    if ((prim.getMaterial()?.getAlphaMode() !== 'BLEND') !== opaque) continue;
    const pos = prim.getAttribute('POSITION');
    const idx = prim.getIndices();
    const count = idx ? idx.getCount() : pos.getCount();
    const get = (i) => pos.getElement(idx ? idx.getScalar(i) : i, []);
    for (let i = 0; i < count; i += 3) {
      const [a, b, c] = [get(i), get(i + 1), get(i + 2)];
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
      const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const len = Math.hypot(...n);
      if (!len || Math.abs(n[1] / len) > 0.2) continue; // not a wall
      // The two most distant corners give the wall's footprint line.
      const pts = [a, b, c].map((p) => [p[0], p[2]]);
      let best = [pts[0], pts[1]];
      let bestD = -1;
      for (const [p, q] of [
        [pts[0], pts[1]],
        [pts[1], pts[2]],
        [pts[0], pts[2]],
      ]) {
        const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (d > bestD) [bestD, best] = [d, [p, q]];
      }
      if (bestD < 0.05) continue;
      const r = (p) => `${Math.round(p[0] * 20)},${Math.round(p[1] * 20)}`;
      const key = [r(best[0]), r(best[1])].sort().join('|');
      if (keys.has(key)) continue;
      keys.add(key);
      segs.push(best);
    }
  }
  return segs;
}

const toPath = (segs) =>
  segs
    .map(
      ([[x1, z1], [x2, z2]]) =>
        `M${x1.toFixed(2)} ${z1.toFixed(2)}L${x2.toFixed(2)} ${z2.toFixed(2)}`,
    )
    .join('');

mkdirSync(OUT_PLANS, { recursive: true });
const pad = 2;
const vb = [
  bounds.min[0] - pad,
  bounds.min[2] - pad,
  bounds.max[0] - bounds.min[0] + 2 * pad,
  bounds.max[2] - bounds.min[2] + 2 * pad,
];
const walls = projectWalls(true);
const glass = projectWalls(false);
const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map((v) => v.toFixed(2)).join(' ')}">` +
  `<path d="${toPath(glass)}" fill="none" stroke="#5a8a90" stroke-width="0.12" stroke-linecap="round"/>` +
  `<path d="${toPath(walls)}" fill="none" stroke="#1b1d21" stroke-width="0.15" stroke-linecap="round"/>` +
  `</svg>\n`;
writeFileSync(OUT_PLAN, svg);

mkdirSync('src/content/generated', { recursive: true });
writeFileSync(
  OUT_INFO,
  JSON.stringify(
    { source: SOURCE, bounds, plan: '/plans/plan.svg', planViewBox: vb.map((v) => +v.toFixed(2)) },
    null,
    2,
  ) + '\n',
);

console.log(`Wrote ${OUT_MODEL}`, bounds);
console.log(`Wrote ${OUT_PLAN}: ${walls.length} wall and ${glass.length} glass lines`);
