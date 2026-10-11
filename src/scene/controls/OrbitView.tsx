import { useEffect, useRef, type ElementRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Spherical, Vector3 } from 'three';
import type { HeldKeys } from '../types';
import { usePoseReporter } from './usePoseReporter';

const TARGET = new Vector3(0, 1.5, 0);
const START = new Vector3(14, 9, 14);
const MIN_DISTANCE = 6;
const MAX_DISTANCE = 45;
const ROTATE_SPEED = 1.4; // radians per second
const ZOOM_SPEED = 1.2; // fraction of distance per second

const offset = new Vector3();
const spherical = new Spherical();

interface Props {
  keys: HeldKeys;
  autoRotate: boolean;
}

/** Overview mode: orbit around the model with mouse, touch or keyboard. */
export function OrbitView({ keys, autoRotate }: Props) {
  const camera = useThree((s) => s.camera);
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);

  useEffect(() => {
    camera.position.copy(START);
    camera.lookAt(TARGET);
    controls.current?.target.copy(TARGET);
    controls.current?.update();
  }, [camera]);

  useFrame((_, delta) => {
    const c = controls.current;
    const held = keys.current;
    if (!c || held.size === 0) return;

    offset.copy(camera.position).sub(c.target);
    spherical.setFromVector3(offset);

    if (held.has('ArrowLeft')) spherical.theta -= ROTATE_SPEED * delta;
    if (held.has('ArrowRight')) spherical.theta += ROTATE_SPEED * delta;
    if (held.has('ArrowUp')) spherical.phi -= ROTATE_SPEED * 0.6 * delta;
    if (held.has('ArrowDown')) spherical.phi += ROTATE_SPEED * 0.6 * delta;
    if (held.has('Equal') || held.has('NumpadAdd')) spherical.radius *= 1 - ZOOM_SPEED * delta;
    if (held.has('Minus') || held.has('NumpadSubtract')) spherical.radius *= 1 + ZOOM_SPEED * delta;

    spherical.phi = Math.min(Math.max(spherical.phi, 0.15), Math.PI / 2 - 0.05);
    spherical.radius = Math.min(Math.max(spherical.radius, MIN_DISTANCE), MAX_DISTANCE);

    offset.setFromSpherical(spherical);
    camera.position.copy(c.target).add(offset);
    c.update();
  });

  usePoseReporter();

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      enablePan={false}
      autoRotate={autoRotate}
      autoRotateSpeed={0.4}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      maxPolarAngle={Math.PI / 2 - 0.05}
    />
  );
}
