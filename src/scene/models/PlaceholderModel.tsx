import { useMemo } from 'react';
import { DoubleSide, Vector3 } from 'three';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';

/**
 * ABSTRACT PLACEHOLDER — NOT THE MÖBIUS HOUSE.
 *
 * A mathematical Möbius band used only as a stand-in so the viewer, controls
 * and minimap can be developed before a sourced architectural model exists.
 * Its size, shape and position carry no information about the real building.
 * Replace this component with a GLTF model once one is available.
 */

// Keep in sync with the schematic in components/ui/Minimap.tsx.
const RADIUS = 6;
const HALF_WIDTH = 2.2;
const LIFT = HALF_WIDTH + 0.05;

function mobius(u: number, v: number, target: Vector3) {
  const theta = u * Math.PI * 2;
  const s = (v - 0.5) * 2 * HALF_WIDTH;
  const r = RADIUS + s * Math.cos(theta / 2);
  target.set(r * Math.cos(theta), s * Math.sin(theta / 2) + LIFT, r * Math.sin(theta));
}

export function PlaceholderModel() {
  const geometry = useMemo(() => new ParametricGeometry(mobius, 160, 12), []);

  return (
    <group name="placeholder-model">
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#e8e4dc" roughness={0.55} metalness={0.05} side={DoubleSide} />
      </mesh>
    </group>
  );
}
