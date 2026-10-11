import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import {
  BufferAttribute,
  DoubleSide,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type BufferGeometry,
  type Material,
} from 'three';
import { setModelStatus, viewerStore } from '../../state/viewerStore';
import { MODEL_NAME, MODEL_URL } from '../config';
import { getRoomEnvironment } from '../environmentMap';
import { debugFlags } from '../debug';

/**
 * Third-party SketchUp reconstruction of the Möbius House, converted by
 * scripts/prepare-model.mjs. Its accuracy against UNStudio's drawings has not
 * been verified.
 *
 * The source file has a single white material. The prepare script sorts every
 * surface into a group by ray-testing the model (exterior concrete, interior
 * wall, floor, ceiling, roof, ground; see "Sort surfaces" there), and each
 * group gets a restrained material here. The groups describe surface roles,
 * not verified finishes: the palette stays within the light concrete, white
 * and glass the building is known for.
 */

type SurfaceGroup = 'concrete' | 'roof' | 'wall' | 'ceiling' | 'floor' | 'ground';

const standard = (color: string, roughness: number) =>
  new MeshStandardMaterial({
    color,
    roughness,
    // Pull faces back slightly so edge lines on top of them don't flicker.
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2,
  });

const PALETTE: Record<SurfaceGroup, MeshStandardMaterial> = {
  concrete: standard('#d5d3ce', 0.9), // exterior walls: pale in-situ concrete
  roof: standard('#cfcdc8', 0.95),
  wall: standard('#ebeae6', 0.92), // interior walls: warm white
  ceiling: standard('#f1f0ed', 0.95),
  floor: standard('#bab7b1', 0.6), // interior floors: grey, faint sheen
  ground: standard('#cbc8c1', 1), // site, terraces and paths: close to the ground plane
};

/** Vivid colours for `?debug=surfaces` (development only), to check the grouping. */
const DEBUG_PALETTE: Record<SurfaceGroup, string> = {
  concrete: '#e07b39',
  roof: '#c94f7c',
  wall: '#f2f2f2',
  ceiling: '#7fb3d5',
  floor: '#5a9e6f',
  ground: '#b9a36a',
};

const glass = new MeshPhysicalMaterial({
  color: '#dde6e5',
  roughness: 0.04,
  metalness: 0,
  transparent: true,
  opacity: 0.28,
  side: DoubleSide,
  depthWrite: false,
  envMapIntensity: 1, // its own reflection map, independent of the scene's
});

const EDGE_ANGLE = 20; // degrees between faces before an edge line is drawn
/** Edge lines are near-invisible in the exterior view and faint when walking inside. */
const EDGE_OPACITY = { orbit: 0.14, explore: 0.38 };
const outline = new LineBasicMaterial({ color: '#8f8a82', transparent: true, opacity: 0.14 });
const glassOutline = new LineBasicMaterial({ color: '#97a6a8', transparent: true, opacity: 0.4 });

/** Keeps only vertical and horizontal edge segments (pane borders and mullions). */
function withoutDiagonals(edges: BufferGeometry) {
  const pos = edges.getAttribute('position');
  const kept: number[] = [];
  for (let i = 0; i < pos.count; i += 2) {
    const dy = Math.abs(pos.getY(i + 1) - pos.getY(i));
    const dxz = Math.hypot(pos.getX(i + 1) - pos.getX(i), pos.getZ(i + 1) - pos.getZ(i));
    if (dy < 0.01 || dxz < 0.01) {
      kept.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      kept.push(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1));
    }
  }
  edges.setAttribute('position', new BufferAttribute(new Float32Array(kept), 3));
  return edges;
}

/** Material group from the glTF material name, e.g. "floor" or "floor:back". */
function groupOf(material: Material): SurfaceGroup | 'glass' {
  const name = material.name.split(':')[0];
  if (name === 'glass' || material.transparent) return 'glass';
  return (name in PALETTE ? name : 'wall') as SurfaceGroup;
}

export function HouseModel() {
  const { scene } = useGLTF(MODEL_URL);
  const gl = useThree((s) => s.gl);
  const mode = viewerStore.useStore((s) => s.mode);

  useEffect(() => {
    outline.opacity = EDGE_OPACITY[mode];
  }, [mode]);

  const model = useMemo(() => {
    glass.envMap = getRoomEnvironment(gl);
    const root = scene.clone(true);
    root.name = MODEL_NAME;
    const meshes: Mesh[] = [];
    root.traverse((o) => o instanceof Mesh && meshes.push(o));

    for (const mesh of meshes) {
      const source = mesh.material as Material;
      const group = groupOf(source);
      const glazed = group === 'glass';
      // SketchUp exports every face twice; the second copy is tagged ":back".
      // Outline only the front copy so lines are not drawn twice.
      const backFaces = source.name.endsWith(':back');

      if (glazed) mesh.material = glass;
      else if (debugFlags.surfaces) mesh.material = standard(DEBUG_PALETTE[group], 0.9);
      else mesh.material = PALETTE[group];
      mesh.castShadow = !glazed;
      mesh.receiveShadow = !glazed;
      mesh.userData.collidable = true; // glazing blocks movement too

      if (!backFaces) {
        const edges = new EdgesGeometry(mesh.geometry, EDGE_ANGLE);
        const lines = new LineSegments(
          glazed ? withoutDiagonals(edges) : edges,
          glazed ? glassOutline : outline,
        );
        lines.raycast = () => {}; // decoration only: not walkable, not pickable
        mesh.add(lines);
      }
    }
    return root;
  }, [scene, gl]);

  useEffect(() => setModelStatus('ready'), []);

  return <primitive object={model} />;
}

useGLTF.preload(MODEL_URL);
