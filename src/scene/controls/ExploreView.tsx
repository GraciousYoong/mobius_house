import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, Vector3 } from 'three';
import type { DragDelta, HeldKeys } from '../types';
import { usePoseReporter } from './usePoseReporter';

/**
 * First-person prototype. Walks on a flat ground plane at eye height.
 * There is deliberately no collision yet: the visitor can pass through the
 * placeholder geometry. Movement is only clamped to a circular site boundary.
 */

const EYE_HEIGHT = 1.6;
const START = new Vector3(0, EYE_HEIGHT, 14);
const WALK_SPEED = 3; // m/s
const RUN_MULTIPLIER = 2.2;
const TURN_SPEED = 1.8; // rad/s
const LOOK_SENSITIVITY = 0.0035; // rad per pixel
const SITE_RADIUS = 30;

const forward = new Vector3();
const right = new Vector3();
const move = new Vector3();
const euler = new Euler(0, 0, 0, 'YXZ');

interface Props {
  keys: HeldKeys;
  drag: DragDelta;
}

export function ExploreView({ keys, drag }: Props) {
  const camera = useThree((s) => s.camera);
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    camera.position.copy(START);
    yaw.current = 0;
    pitch.current = 0;
  }, [camera]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1); // avoid jumps after a stalled frame
    const held = keys.current;

    // Look: keyboard turning plus pointer drag.
    if (held.has('ArrowLeft') || held.has('KeyQ')) yaw.current += TURN_SPEED * delta;
    if (held.has('ArrowRight') || held.has('KeyE')) yaw.current -= TURN_SPEED * delta;
    yaw.current += drag.current.x * LOOK_SENSITIVITY;
    pitch.current += drag.current.y * LOOK_SENSITIVITY;
    pitch.current = Math.min(Math.max(pitch.current, -1.2), 1.2);
    drag.current.x = 0;
    drag.current.y = 0;

    euler.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(euler);

    // Move on the ground plane relative to the current yaw.
    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.set(-forward.z, 0, forward.x);
    move.set(0, 0, 0);
    if (held.has('KeyW') || held.has('ArrowUp')) move.add(forward);
    if (held.has('KeyS') || held.has('ArrowDown')) move.sub(forward);
    if (held.has('KeyD')) move.add(right);
    if (held.has('KeyA')) move.sub(right);

    if (move.lengthSq() > 0) {
      const speed =
        WALK_SPEED * (held.has('ShiftLeft') || held.has('ShiftRight') ? RUN_MULTIPLIER : 1);
      move.normalize().multiplyScalar(speed * delta);
      camera.position.add(move);
      const r = Math.hypot(camera.position.x, camera.position.z);
      if (r > SITE_RADIUS) {
        camera.position.x *= SITE_RADIUS / r;
        camera.position.z *= SITE_RADIUS / r;
      }
    }
    camera.position.y = EYE_HEIGHT;
  });

  usePoseReporter();
  return null;
}
