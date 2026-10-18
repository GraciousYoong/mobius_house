import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Euler, Vector3, type PerspectiveCamera } from 'three';
import { viewerStore } from '../../state/viewerStore';
import type { DragDelta, HeldKeys, StickInput } from '../types';
import { usePoseReporter } from './usePoseReporter';
import { CharacterPhysics, buildCollider } from './characterPhysics';
import { GROUND_Y } from '../config';
import { debugExploreStart } from '../debug';

/**
 * Game-style first-person view. Movement runs through CharacterPhysics:
 * walls and glazing block the visitor, stairs and ramps can be climbed,
 * gravity applies, and the edge of the site acts as an invisible fence.
 * Meshes take part in collision when `userData.collidable` is set.
 */

/**
 * Start at the entrance on the north side: standing on the forecourt, facing
 * south-south-west towards the recessed opening, with the glazed wing on the
 * left. Eye height sits 1.6 m above the forecourt (about −0.6 m).
 */
const DEFAULT_START = { position: new Vector3(2.3, 1.0, -9.4), yaw: 2.6 };
const START = debugExploreStart
  ? new Vector3(debugExploreStart[0], debugExploreStart[1], debugExploreStart[2])
  : DEFAULT_START.position;
const START_YAW = debugExploreStart?.[3] ?? DEFAULT_START.yaw;
/** A natural human field of view, wider than the exterior view's long lens. */
const FOV = 64;
/** Close enough that walls never clip, since the body keeps the eye 0.3 m away. */
const NEAR = 0.12;
const TURN_SPEED = 1.9; // rad/s at full keyboard turn
const TURN_EASE = 10; // how quickly keyboard turning ramps up and down (1/s)
const LOOK_SENSITIVITY = 0.0025; // rad per pixel of mouse or touch drag
const EYE_SMOOTHING = 18; // eases the camera over stair steps (1/s)

const forward = new Vector3();
const right = new Vector3();
const wish = new Vector3();
const euler = new Euler(0, 0, 0, 'YXZ');

interface Props {
  keys: HeldKeys;
  drag: DragDelta;
  stick: StickInput;
}

export function ExploreView({ keys, drag, stick }: Props) {
  const camera = useThree((s) => s.camera);
  const scene = useThree((s) => s.scene);
  // Rebuild the collider when the model (or the fallback) finishes loading.
  const modelStatus = viewerStore.useStore((s) => s.modelStatus);

  const physics = useMemo(() => {
    if (modelStatus === 'loading') return null;
    try {
      const p = new CharacterPhysics(buildCollider(scene, (m) => Boolean(m.userData.collidable)));
      p.reset(START);
      return p;
    } catch {
      return null; // nothing collidable in the scene
    }
  }, [scene, modelStatus]);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const turnRate = useRef(0);
  const eyeY = useRef<number | null>(null);

  useLayoutEffect(() => {
    const lens = camera as PerspectiveCamera;
    lens.fov = FOV;
    lens.near = NEAR;
    lens.far = 400;
    lens.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    yaw.current = START_YAW;
    pitch.current = 0;
    eyeY.current = null;
    camera.position.copy(START);
  }, [camera, physics]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const held = keys.current;

    // Look: eased keyboard turning, plus raw mouse/touch movement.
    const turnTarget =
      (held.has('ArrowLeft') || held.has('KeyQ') ? 1 : 0) -
      (held.has('ArrowRight') || held.has('KeyE') ? 1 : 0);
    turnRate.current += (turnTarget - turnRate.current) * Math.min(1, TURN_EASE * delta);
    yaw.current += turnRate.current * TURN_SPEED * delta;
    yaw.current -= drag.current.x * LOOK_SENSITIVITY;
    pitch.current -= drag.current.y * LOOK_SENSITIVITY;
    pitch.current = Math.min(Math.max(pitch.current, -1.3), 1.3);
    drag.current.x = 0;
    drag.current.y = 0;
    euler.set(pitch.current, yaw.current, 0);
    camera.quaternion.setFromEuler(euler);

    if (!physics) return;

    // Walk relative to where the visitor faces.
    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.set(-forward.z, 0, forward.x);
    wish.set(0, 0, 0);
    if (held.has('KeyW') || held.has('ArrowUp')) wish.add(forward);
    if (held.has('KeyS') || held.has('ArrowDown')) wish.sub(forward);
    if (held.has('KeyD')) wish.add(right);
    if (held.has('KeyA')) wish.sub(right);
    wish.addScaledVector(forward, -stick.current.y).addScaledVector(right, stick.current.x);
    if (wish.lengthSq() > 1) wish.normalize();

    physics.update(delta, {
      wish,
      running: held.has('ShiftLeft') || held.has('ShiftRight'),
    });

    // Fell through a gap somewhere: put the visitor back at the start.
    if (physics.feetY < GROUND_Y - 3) {
      physics.reset(START);
      eyeY.current = null;
    }

    const p = physics.position;
    eyeY.current =
      eyeY.current === null
        ? p.y
        : eyeY.current + (p.y - eyeY.current) * Math.min(1, EYE_SMOOTHING * delta);
    camera.position.set(p.x, eyeY.current, p.z);
  });

  usePoseReporter();
  return null;
}
