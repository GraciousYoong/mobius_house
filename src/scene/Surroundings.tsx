import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react';
import {
  Color,
  CylinderGeometry,
  IcosahedronGeometry,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  type BufferGeometry,
} from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import modelInfo from '../content/generated/modelInfo.json';
import { viewerStore } from '../state/viewerStore';
import { GROUND_Y } from './config';

/**
 * GENERIC SCENERY, NOT SURVEY DATA.
 *
 * The house stands in woodland of broadleaf trees and tall pines, so the site
 * is surrounded by generic trees for context. Their number, species and
 * positions are invented and say nothing about the real site. They are only
 * placed outside the model's site, and can be hidden with the Trees toggle.
 *
 * Whole trees within HIDE_WITHIN of the camera are hidden, so they never block
 * the view of the house.
 */

const SITE_MARGIN = 4; // metres kept clear around the model's site
const INNER = 30; // closest trees, metres from the centre
const OUTER = 100;
const COUNT = 160;
const PINE_SHARE = 0.45;
const HIDE_WITHIN = 16; // trees whose trunk is this close to the camera (m) are hidden

const [minX, , minZ] = modelInfo.bounds.min;
const [maxX, , maxZ] = modelInfo.bounds.max;

interface Tree {
  x: number;
  z: number;
  height: number;
  spread: number;
  pine: boolean;
  seed: number;
}

/** Deterministic pseudo-random numbers, so every visitor sees the same woodland. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function placeTrees(): Tree[] {
  const rand = random(20251011);
  const trees: Tree[] = [];
  let attempts = 0;
  while (trees.length < COUNT && attempts++ < COUNT * 30) {
    // Area-uniform distance, so the woodland is evenly dense.
    const r = Math.sqrt(INNER ** 2 + rand() * (OUTER ** 2 - INNER ** 2));
    const a = rand() * Math.PI * 2;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    const onSite =
      x > minX - SITE_MARGIN &&
      x < maxX + SITE_MARGIN &&
      z > minZ - SITE_MARGIN &&
      z < maxZ + SITE_MARGIN;
    if (onSite) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 5)) continue;
    const pine = rand() < PINE_SHARE;
    trees.push({
      x,
      z,
      pine,
      height: pine ? 18 + rand() * 7 : 13 + rand() * 7,
      spread: pine ? 2.2 + rand() * 1 : 3 + rand() * 1.8,
      seed: Math.floor(rand() * 1e9),
    });
  }
  return trees;
}

/** A lumpy, faceted foliage clump: an icosphere with its vertices pushed in and out. */
function clumpGeometry(): BufferGeometry {
  const g = mergeVertices(new IcosahedronGeometry(1, 1));
  const pos = g.getAttribute('position');
  const rand = random(7);
  for (let i = 0; i < pos.count; i++) {
    const k = 0.78 + rand() * 0.4;
    pos.setXYZ(i, pos.getX(i) * k, pos.getY(i) * k, pos.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
}

/**
 * Hides whole trees near the camera. Every instance carries its tree's trunk
 * position (`treeBase`), so trunk and crown disappear together instead of
 * leaving half a tree.
 */
function withNearHiding(material: MeshStandardMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 treeBase;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        if (distance(treeBase, cameraPosition.xz) < ${HIDE_WITHIN.toFixed(1)}) transformed = vec3(0.0);`,
      );
  };
  material.customProgramCacheKey = () => 'tree-near-hiding';
  return material;
}

const bark = withNearHiding(new MeshStandardMaterial({ color: '#5b4f44', roughness: 1 }));
const leaves = withNearHiding(new MeshStandardMaterial({ color: '#ffffff', roughness: 0.95 }));

// Muted, slightly varied greens: oak/birch-like broadleaf and dark Scots pine.
const BROADLEAF = ['#6b7350', '#757a56', '#626b4a', '#7b7c5c'].map((c) => new Color(c));
const PINE = ['#46553f', '#4d5a43', '#3f4c3a'].map((c) => new Color(c));
const PINE_BARK = new Color('#7a5c46');
const TRUNK = new Color('#5b4f44');

interface Instance {
  place: (o: Object3D) => void;
  color: Color;
  /** Trunk position of the tree this instance belongs to. */
  base: [number, number];
}

/** Writes one matrix and colour per item into an InstancedMesh. */
function useInstances(ref: RefObject<InstancedMesh>, items: Instance[]) {
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new Object3D();
    items.forEach((item, i) => {
      o.position.set(0, 0, 0);
      o.rotation.set(0, 0, 0);
      o.scale.set(1, 1, 1);
      item.place(o);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, item.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [ref, items]);
}

function buildInstances(trees: Tree[]) {
  const trunks: Instance[] = [];
  const clumps: Instance[] = [];

  for (const t of trees) {
    const rand = random(t.seed);
    // Tall clear trunk; pines carry their crown only in the top quarter.
    const trunkHeight = t.height * (t.pine ? 0.88 : 0.7);
    const girth = t.pine ? 0.32 : 0.4;
    trunks.push({
      place: (o) => {
        o.position.set(t.x, GROUND_Y + trunkHeight / 2, t.z);
        o.scale.set(girth, trunkHeight, girth);
        o.rotation.set((rand() - 0.5) * 0.06, 0, (rand() - 0.5) * 0.06);
      },
      color: t.pine ? PINE_BARK : TRUNK,
      base: [t.x, t.z],
    });

    const palette = t.pine ? PINE : BROADLEAF;
    const base = palette[Math.floor(rand() * palette.length)];
    const parts = t.pine ? 4 : 6;
    const crownBottom = t.height * (t.pine ? 0.74 : 0.5);
    const crownTop = t.height;
    for (let k = 0; k < parts; k++) {
      const a = rand() * Math.PI * 2;
      const r = (k === 0 ? 0 : 0.35 + rand() * 0.55) * t.spread;
      const y = crownBottom + (crownTop - crownBottom) * (k === 0 ? 0.6 : 0.2 + rand() * 0.75);
      const size = t.spread * (t.pine ? 0.75 + rand() * 0.3 : 0.6 + rand() * 0.35);
      // Pine clumps are flat (umbrella crown); broadleaf clumps rounder.
      const squash = t.pine ? 0.45 + rand() * 0.15 : 0.75 + rand() * 0.2;
      clumps.push({
        place: (o) => {
          o.position.set(t.x + Math.cos(a) * r, GROUND_Y + y, t.z + Math.sin(a) * r);
          o.scale.set(size, size * squash, size * (0.85 + rand() * 0.3));
          o.rotation.set(rand() * 0.4, rand() * Math.PI * 2, rand() * 0.4);
        },
        color: base.clone().offsetHSL(0, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.05),
        base: [t.x, t.z],
      });
    }
  }
  return { trunks, clumps };
}

export function Surroundings() {
  const visible = viewerStore.useStore((s) => s.showSurroundings);
  const { trunks, clumps } = useMemo(() => buildInstances(placeTrees()), []);
  const geometries = useMemo(() => {
    const withBases = (g: BufferGeometry, items: Instance[]) => {
      const bases = new Float32Array(items.flatMap((i) => i.base));
      g.setAttribute('treeBase', new InstancedBufferAttribute(bases, 2));
      return g;
    };
    return {
      trunk: withBases(new CylinderGeometry(0.45, 0.6, 1, 7), trunks),
      clump: withBases(clumpGeometry(), clumps),
    };
  }, [trunks, clumps]);

  const trunkRef = useRef<InstancedMesh>(null);
  const clumpRef = useRef<InstancedMesh>(null);
  useInstances(trunkRef, trunks);
  useInstances(clumpRef, clumps);

  return (
    <group visible={visible} name="surroundings">
      <instancedMesh
        ref={trunkRef}
        args={[geometries.trunk, bark, trunks.length]}
        castShadow
        receiveShadow
        raycast={() => {}}
      />
      <instancedMesh
        ref={clumpRef}
        args={[geometries.clump, leaves, clumps.length]}
        castShadow
        receiveShadow
        raycast={() => {}}
      />
    </group>
  );
}
