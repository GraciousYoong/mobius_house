import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  DoubleSide,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Material,
} from 'three';
import { setModelStatus } from '../../state/viewerStore';
import { MODEL_NAME, MODEL_URL } from '../config';

/**
 * Third-party SketchUp reconstruction of the Möbius House, converted by
 * scripts/prepare-model.mjs. Its accuracy against UNStudio's drawings has not
 * been verified. The source file has no real materials, so surfaces are
 * shaded as pale concrete and glazing as tinted glass.
 */

const concrete = new MeshStandardMaterial({ color: '#e6e3dc', roughness: 0.85 });
const glass = new MeshPhysicalMaterial({
  color: '#c4d6d8',
  roughness: 0.05,
  metalness: 0,
  transparent: true,
  opacity: 0.18,
  side: DoubleSide,
  depthWrite: false,
});
const edges = new LineBasicMaterial({ color: '#7d8084', transparent: true, opacity: 0.45 });

function isGlass(m: Material) {
  return m.transparent || m.name.toLowerCase().includes('glass');
}

export function HouseModel() {
  const { scene } = useGLTF(MODEL_URL);

  const model = useMemo(() => {
    const root = scene.clone(true);
    root.name = MODEL_NAME;
    root.traverse((o) => {
      if (o instanceof LineSegments) {
        o.material = edges;
      } else if (o instanceof Mesh) {
        const glazed = isGlass(o.material as Material);
        o.material = glazed ? glass : concrete;
        o.castShadow = !glazed;
        o.receiveShadow = !glazed;
        o.userData.walkable = !glazed;
      }
    });
    return root;
  }, [scene]);

  useEffect(() => setModelStatus('ready'), []);

  return <primitive object={model} />;
}

useGLTF.preload(MODEL_URL);
