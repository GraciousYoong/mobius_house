import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, Mesh, Raycaster, Vector3, type Object3D } from 'three';
import type { DragDelta, HeldKeys } from '../types';
import { usePoseReporter } from './usePoseReporter';
import { GROUND_Y, MODEL_NAME, MODEL_RADIUS } from '../config';

/**
 * First-person prototype. The visitor's feet follow the floor below them
 * (found by a downward raycast against the model), so ramps, split levels and
 * the sloping site work. Walls do not block movement yet: there is no
 * collision, and the visitor can pass through them.
 */

const EYE_HEIGHT = 1.6;
/** Highest step the visitor can climb in one move; anything higher is a wall or roof. */
const STEP_HEIGHT = 0.6;
/** Start on the site south of the house, looking north towards it. */
const START = new Vector3(4, GROUND_Y + EYE_HEIGHT, 18);
const WALK_SPEED = 3; // m/s
const RUN_MULTIPLIER = 2.2;
const TURN_SPEED = 1.8; // rad/s
const LOOK_SENSITIVITY = 0.0035; // rad per pixel
const SITE_RADIUS = MODEL_RADIUS * 2;
const SETTLE_SPEED = 12; // how quickly the eye follows floor-height changes

const forward = new Vector3();
const right = new Vector3();
const move = new Vector3();
const down = new Vector3(0, -1, 0);
const origin = new Vector3();
const euler = new Euler(0, 0, 0, 'YXZ');
const raycaster = new Raycaster();

/** Height of the walkable surface under (x, z), searching from just above the feet. */
function floorBelow(model: Object3D | undefined, x: number, z: number, feetY: number) {
  if (!model) return GROUND_Y;
  origin.set(x, feetY + STEP_HEIGHT, z);
  raycaster.set(origin, down);
  raycaster.far = 50;
  const hit = raycaster
    .intersectObject(model, true)
    .find((h) => h.object instanceof Mesh && h.object.userData.walkable);
  return hit ? Math.max(hit.point.y, GROUND_Y) : GROUND_Y;
}

interface Props {
  keys: HeldKeys;
  drag: DragDelta;
}

export function ExploreView({ keys, drag }: Props) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const feetY = useRef<number | null>(null);

  useEffect(() => {
    camera.position.copy(START);
    yaw.current = 0;
    pitch.current = 0;
    feetY.current = null; // resolved on the first frame, once the model is present
  }, [camera]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1); // avoid jumps after a stalled frame
    const held = keys.current;
    const model = scene.getObjectByName(MODEL_NAME);

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

    // Move on the horizontal plane relative to the current yaw.
    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.set(-forward.z, 0, forward.x);
    move.set(0, 0, 0);
    if (held.has('KeyW') || held.has('ArrowUp')) move.add(forward);
    if (held.has('KeyS') || held.has('ArrowDown')) move.sub(forward);
    if (held.has('KeyD')) move.add(right);
    if (held.has('KeyA')) move.sub(right);

    const moving = move.lengthSq() > 0;
    if (moving) {
      const speed =
        WALK_SPEED * (held.has('ShiftLeft') || held.has('ShiftRight') ? RUN_MULTIPLIER : 1);
      move.normalize().multiplyScalar(speed * delta);
      camera.position.x += move.x;
      camera.position.z += move.z;
      const r = Math.hypot(camera.position.x, camera.position.z);
      if (r > SITE_RADIUS) {
        camera.position.x *= SITE_RADIUS / r;
        camera.position.z *= SITE_RADIUS / r;
      }
    }

    // Follow the floor. On the first frame search from high up to land on the site.
    if (feetY.current === null) {
      if (!model) return;
      feetY.current = floorBelow(model, camera.position.x, camera.position.z, 40);
    } else if (moving) {
      feetY.current = floorBelow(model, camera.position.x, camera.position.z, feetY.current);
    }
    const targetY = feetY.current + EYE_HEIGHT;
    camera.position.y += (targetY - camera.position.y) * Math.min(1, SETTLE_SPEED * delta);
  });

  usePoseReporter();
  return null;
}
