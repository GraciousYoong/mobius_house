/**
 * Headless check of Explore mode physics against the real model: flood-fills
 * a 1 m grid from the start point and reports which areas a visitor can reach.
 * Run: npx tsx tests/reachability.ts [no-glass]
 */
import { readFileSync } from 'node:fs';
import { Mesh, Vector3, MeshBasicMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  CharacterPhysics,
  buildCollider,
  EYE_HEIGHT,
} from '../src/scene/controls/characterPhysics';

console.warn = () => {};
const includeGlass = process.argv[2] !== 'no-glass';
const buf = readFileSync('public/models/mobius-house.glb');
const gltf: any = await new Promise((res, rej) =>
  new GLTFLoader().parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    '',
    res,
    rej,
  ),
);
const isGlass = (m: Mesh) => (m.material as MeshBasicMaterial).transparent;
const t0 = performance.now();
const bvh = buildCollider(gltf.scene, (m) => includeGlass || !isGlass(m));
console.log('bvh ms', (performance.now() - t0).toFixed(0), 'glass', includeGlass);

const p = new CharacterPhysics(bvh);
const still = { wish: new Vector3(), running: false };
p.reset(new Vector3(2.3, 1.0, -9.4)); // Explore's default start, at the entrance
for (let i = 0; i < 120; i++) p.update(1 / 60, still);
console.log('start feet', p.feetY.toFixed(2), 'grounded', p.grounded);

// Flood fill over a 1 m grid: from each reached cell, try walking to each neighbour.
const key = (x: number, z: number, lvl: number) => `${x},${z},${lvl}`;
const start = p.position.clone();
const queue: Vector3[] = [start];
const seen = new Map<string, Vector3>();
seen.set(key(Math.round(start.x), Math.round(start.z), 0), start);
let tsim = 0;
const t1 = performance.now();
while (queue.length) {
  const from = queue.shift()!;
  for (const [dx, dz] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const tx = Math.round(from.x) + dx,
      tz = Math.round(from.z) + dz;
    if (Math.abs(tx) > 24 || Math.abs(tz) > 24) continue;
    p.reset(from);
    for (let i = 0; i < 50; i++) {
      const wish = new Vector3(tx - p.position.x, 0, tz - p.position.z);
      if (wish.length() < 0.15) break;
      wish.normalize();
      p.update(1 / 30, { wish, running: false });
      tsim++;
    }
    for (let i = 0; i < 10; i++) p.update(1 / 30, still);
    if (Math.hypot(p.position.x - tx, p.position.z - tz) > 0.35) continue;
    const lvl = p.feetY > 1.8 ? 1 : 0;
    const k = key(tx, tz, lvl);
    if (seen.has(k)) continue;
    seen.set(k, p.position.clone());
    queue.push(p.position.clone());
  }
}
const pts = [...seen.values()];
const inside = pts.filter((v) => Math.abs(v.x) < 15 && v.z > -9 && v.z < 7);
console.log(
  'reached cells',
  pts.length,
  'inside-footprint',
  inside.length,
  'first floor',
  pts.filter((v) => v.y - EYE_HEIGHT > 1.8).length,
  'sim steps',
  tsim,
  'ms',
  (performance.now() - t1).toFixed(0),
);
const hist: Record<string, number> = {};
pts.forEach((v) => {
  const k = (v.y - EYE_HEIGHT).toFixed(1);
  hist[k] = (hist[k] || 0) + 1;
});
console.log(
  Object.entries(hist)
    .sort((a, b) => +a[0] - +b[0])
    .map((e) => e.join(':'))
    .join(' '),
);
// ASCII map: rows z -24..24, cols x -24..24
for (let z = -12; z <= 22; z++) {
  let row = '';
  for (let x = -24; x <= 24; x++)
    row += seen.has(key(x, z, 1)) ? '#' : seen.has(key(x, z, 0)) ? '.' : ' ';
  console.log(row);
}

// Fail if the house can no longer be entered or a floor can no longer be reached.
const firstFloor = pts.filter((v) => v.y - EYE_HEIGHT > 1.8).length;
const basement = pts.filter((v) => v.y - EYE_HEIGHT < -1.9).length;
if (inside.length < 300 || firstFloor < 50 || basement < 20) {
  console.error(
    `FAIL: ${inside.length} cells inside, ${firstFloor} on the first floor, ${basement} in the basement`,
  );
  process.exit(1);
}
console.log('PASS: house enterable; first floor and basement reachable');
