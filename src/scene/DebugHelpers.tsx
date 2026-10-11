import { useMemo } from 'react';
import { Box3, Box3Helper, Color, Vector3 } from 'three';
import modelInfo from '../content/generated/modelInfo.json';
import { GROUND_Y } from './config';

/**
 * Development-only helpers (`?debug` on the dev server): a ground grid, world
 * axes and the building bounds used for camera framing. Never rendered in a
 * production build (see debug.ts).
 */
export function DebugHelpers() {
  const bounds = useMemo(() => {
    const box = new Box3(
      new Vector3(...modelInfo.buildingBounds.min),
      new Vector3(...modelInfo.buildingBounds.max),
    );
    return new Box3Helper(box, new Color('#d4721c'));
  }, []);
  return (
    <group name="debug-helpers">
      <gridHelper args={[100, 50, '#888888', '#bbbbbb']} position-y={GROUND_Y + 0.02} />
      <axesHelper args={[6]} position-y={0.05} />
      <primitive object={bounds} />
    </group>
  );
}
