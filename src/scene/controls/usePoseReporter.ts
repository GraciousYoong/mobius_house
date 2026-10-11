import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { setPose, viewerStore } from '../../state/viewerStore';
import { EYE_HEIGHT } from './characterPhysics';

const INTERVAL = 0.1; // seconds between store updates
const dir = new Vector3();

/** Publishes the camera's ground position and heading for DOM overlays. */
export function usePoseReporter() {
  const elapsed = useRef(INTERVAL);

  useFrame(({ camera }, delta) => {
    elapsed.current += delta;
    if (elapsed.current < INTERVAL) return;
    elapsed.current = 0;

    camera.getWorldDirection(dir);
    const next = {
      x: camera.position.x,
      z: camera.position.z,
      feetY: camera.position.y - EYE_HEIGHT,
      heading: Math.atan2(-dir.x, -dir.z),
    };
    const prev = viewerStore.getState().pose;
    if (
      Math.abs(prev.x - next.x) > 0.01 ||
      Math.abs(prev.z - next.z) > 0.01 ||
      Math.abs(prev.feetY - next.feetY) > 0.05 ||
      Math.abs(prev.heading - next.heading) > 0.005
    ) {
      setPose(next);
    }
  });
}
