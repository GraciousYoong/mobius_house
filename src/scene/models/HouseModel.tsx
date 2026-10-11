import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import {
  BufferAttribute,
  Color,
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
import { setModelStatus } from '../../state/viewerStore';
import { MODEL_NAME, MODEL_URL } from '../config';
import { getRoomEnvironment } from '../environmentMap';

/**
 * Third-party SketchUp reconstruction of the Möbius House, converted by
 * scripts/prepare-model.mjs. Its accuracy against UNStudio's drawings has not
 * been verified. The source file has no real materials, so surfaces are
 * shaded as concrete and glazing as tinted glass.
 *
 * To make the space readable (the conversion loses SketchUp's edge lines):
 * - floors, walls and ceilings get distinct tones via vertex colours,
 * - walls are tinted by compass direction, like SketchUp's face shading, so
 *   walls facing different ways always differ even where no light reaches, and
 * - creases sharper than EDGE_ANGLE are outlined, as in SketchUp. On glass only
 *   vertical and horizontal edges are kept: SketchUp triangulates panes, and the
 *   diagonals between triangles would otherwise show as lines across the glass.
 */

const EDGE_ANGLE = 20; // degrees between faces before an edge line is drawn

// Tones per surface orientation. Kept close so the model still reads as one material.
const FLOOR = new Color('#a8a298');
const WALL = new Color('#dedad2');
const CEILING = new Color('#f4f2ee');
/** Walls facing this horizontal direction (north-west) are lightest; the opposite darkest. */
const WALL_LIGHT_DIR = { x: -0.8, z: -0.6 };
const WALL_SHADE_MIN = 0.6; // brightness of walls facing away from WALL_LIGHT_DIR

const concrete = new MeshStandardMaterial({
  color: '#ffffff',
  vertexColors: true,
  roughness: 0.9,
  // Pull faces back slightly so edge lines on top of them don't flicker.
  polygonOffset: true,
  polygonOffsetFactor: 2,
  polygonOffsetUnits: 2,
});
const glass = new MeshPhysicalMaterial({
  color: '#b7ccd0',
  roughness: 0.06,
  metalness: 0.1,
  transparent: true,
  opacity: 0.26,
  side: DoubleSide,
  depthWrite: false,
  envMapIntensity: 1.1, // its own reflection map, independent of the scene's
});
const outline = new LineBasicMaterial({ color: '#4a4c50', transparent: true, opacity: 0.55 });
const glassOutline = new LineBasicMaterial({ color: '#5f7d82', transparent: true, opacity: 0.6 });

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

function isGlass(m: Material) {
  return m.transparent || m.name.toLowerCase().includes('glass');
}

/** Colours each vertex by which way its face points: floor, wall or ceiling. */
function colourByOrientation(geometry: BufferGeometry) {
  const normals = geometry.getAttribute('normal');
  if (!normals) return;
  const colours = new Float32Array(normals.count * 3);
  for (let i = 0; i < normals.count; i++) {
    const ny = normals.getY(i);
    if (ny > 0.7 || ny < -0.7) {
      const c = ny > 0 ? FLOOR : CEILING;
      colours.set([c.r, c.g, c.b], i * 3);
      continue;
    }
    // Shade walls by which way they face on the compass.
    const nx = normals.getX(i);
    const nz = normals.getZ(i);
    const len = Math.hypot(nx, nz) || 1;
    const facing = (nx * WALL_LIGHT_DIR.x + nz * WALL_LIGHT_DIR.z) / len; // −1..1
    const shade = WALL_SHADE_MIN + (1 - WALL_SHADE_MIN) * (0.5 + 0.5 * facing);
    colours.set([WALL.r * shade, WALL.g * shade, WALL.b * shade], i * 3);
  }
  geometry.setAttribute('color', new BufferAttribute(colours, 3));
}

export function HouseModel() {
  const { scene } = useGLTF(MODEL_URL);
  const gl = useThree((s) => s.gl);

  const model = useMemo(() => {
    glass.envMap = getRoomEnvironment(gl);
    const root = scene.clone(true);
    root.name = MODEL_NAME;
    const meshes: Mesh[] = [];
    root.traverse((o) => o instanceof Mesh && meshes.push(o));

    for (const mesh of meshes) {
      const glazed = isGlass(mesh.material as Material);
      // SketchUp exports every face twice (front and back material); outline only the
      // front copy so lines are not drawn twice.
      const backFaces = (mesh.material as Material).name.endsWith('_0_material');
      mesh.geometry = mesh.geometry.clone();
      if (!glazed) colourByOrientation(mesh.geometry);
      mesh.material = glazed ? glass : concrete;
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
