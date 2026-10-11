import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
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
 * - creases sharper than EDGE_ANGLE are outlined, as in SketchUp.
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
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 1,
});
const glass = new MeshPhysicalMaterial({
  color: '#c4d6d8',
  roughness: 0.05,
  metalness: 0,
  transparent: true,
  opacity: 0.18,
  side: DoubleSide,
  depthWrite: false,
});
const outline = new LineBasicMaterial({ color: '#4a4c50', transparent: true, opacity: 0.55 });
const glassOutline = new LineBasicMaterial({ color: '#6f8f94', transparent: true, opacity: 0.35 });

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

  const model = useMemo(() => {
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
        const lines = new LineSegments(
          new EdgesGeometry(mesh.geometry, EDGE_ANGLE),
          glazed ? glassOutline : outline,
        );
        lines.raycast = () => {}; // decoration only: not walkable, not pickable
        mesh.add(lines);
      }
    }
    return root;
  }, [scene]);

  useEffect(() => setModelStatus('ready'), []);

  return <primitive object={model} />;
}

useGLTF.preload(MODEL_URL);
