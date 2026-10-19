import { useEffect, useLayoutEffect, useRef, useState, type ElementRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PerspectiveCamera, Spherical, Vector3 } from 'three';
import type { HeldKeys } from '../types';
import { usePoseReporter } from './usePoseReporter';
import { BUILDING_CENTRE, BUILDING_RADIUS } from '../config';
import { viewerStore } from '../../state/viewerStore';

/**
 * Exterior presentation view.
 *
 * Composed like an architecture photograph: a longer lens (narrow field of
 * view, less distortion), a three-quarter view from the south-east at a
 * modest height, the building — not its site — filling the frame, and the
 * picture shifted away from the title (right on wide screens, down on tall
 * ones) with a camera view offset.
 *
 * Limits keep the camera outside the building's bounding sphere and above
 * the ground, and a reset returns smoothly to the opening composition.
 */

const FOV = 30;
const TARGET = new Vector3(BUILDING_CENTRE.x, 1.2, BUILDING_CENTRE.z);
/** Opening view direction: azimuth from south towards east, and elevation. */
const START_AZIMUTH = 0.62; // radians
const START_ELEVATION = 0.32; // radians above the horizon (≈ 18°)
/** How much of the usable frame width the building should span (wide, narrow screens). */
const FRAME_FILL = { wide: 0.86, narrow: 1 };
const MIN_DISTANCE = BUILDING_RADIUS * 1.3; // never inside the building
const MAX_DISTANCE = BUILDING_RADIUS * 5;
const MIN_POLAR = 0.32; // not straight down
const MAX_POLAR = 1.3; // at least ~15° above the horizon: never below ground
const RESET_SECONDS = 1.1;
const ROTATE_SPEED = 0.9; // keyboard, radians per second
const ZOOM_SPEED = 0.9; // keyboard, fraction of distance per second

/** Share of the frame given to the title: the building is shifted away from it. */
function viewShift(width: number, height: number) {
  if (width >= 900) return { x: -0.13 * width, y: 0 }; // title on the left
  if (height > width) return { x: 0, y: -0.1 * height }; // title on top
  return { x: 0, y: 0 };
}

/** Camera distance at which the building spans FRAME_FILL of the usable width. */
function fitDistance(width: number, height: number) {
  const usable = width >= 900 ? 0.74 : 1; // part of the frame not under the title
  const vFov = (FOV * Math.PI) / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * (width / height));
  const fov = Math.min(vFov, hFov * usable);
  const fill = width >= 900 ? FRAME_FILL.wide : FRAME_FILL.narrow;
  const d = BUILDING_RADIUS / Math.sin(fov / 2) / (fill * 1.25);
  return Math.min(Math.max(d, MIN_DISTANCE), MAX_DISTANCE);
}

function startPosition(distance: number) {
  const s = new Spherical(distance, Math.PI / 2 - START_ELEVATION, START_AZIMUTH);
  return new Vector3().setFromSpherical(s).add(TARGET);
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const offset = new Vector3();
const spherical = new Spherical();

interface Props {
  keys: HeldKeys;
  autoRotate: boolean;
}

export function OrbitView({ keys, autoRotate }: Props) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const controls = useRef<ElementRef<typeof OrbitControls>>(null);
  // Stops the slow opening drift once the visitor takes over.
  const [interacted, setInteracted] = useState(false);
  const reset = useRef<{ start: number; from: Vector3; to: Vector3 } | null>(null);
  const resets = viewerStore.useStore((s) => s.viewResets);

  // Lens and clipping planes for the exterior view.
  useLayoutEffect(() => {
    camera.fov = FOV;
    camera.near = 0.5;
    camera.far = 600;
    camera.updateProjectionMatrix();
  }, [camera]);

  // Keep the composition clear of the title as the viewport changes.
  useLayoutEffect(() => {
    const { x, y } = viewShift(size.width, size.height);
    camera.setViewOffset(size.width, size.height, x, y, size.width, size.height);
    camera.updateProjectionMatrix();
    return () => {
      camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
  }, [camera, size.width, size.height]);

  // Opening composition.
  useEffect(() => {
    camera.position.copy(startPosition(fitDistance(size.width, size.height)));
    camera.lookAt(TARGET);
    controls.current?.target.copy(TARGET);
    controls.current?.update();
    // Framing is set once on entry; resizing keeps the visitor's own view.
  }, [camera]);

  // A plain wheel scrolls the page, so the hero never traps the visitor.
  // Ctrl/⌘ + wheel (and a trackpad pinch, which arrives as one) still zooms.
  // Caught on the canvas's parent before it reaches OrbitControls.
  useEffect(() => {
    const host = gl.domElement.parentElement;
    if (!host) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) e.stopPropagation();
    };
    host.addEventListener('wheel', onWheel, { capture: true });
    return () => host.removeEventListener('wheel', onWheel, { capture: true });
  }, [gl]);

  // Reset view: glide back to the opening composition.
  useEffect(() => {
    if (resets === 0) return;
    const to = startPosition(fitDistance(size.width, size.height));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      camera.position.copy(to);
      controls.current?.target.copy(TARGET);
      controls.current?.update();
      return;
    }
    reset.current = { start: performance.now(), from: camera.position.clone(), to };
  }, [resets]);

  useFrame((_, delta) => {
    const c = controls.current;
    if (!c) return;

    if (reset.current) {
      const t = Math.min(1, (performance.now() - reset.current.start) / (RESET_SECONDS * 1000));
      // Interpolate in spherical coordinates so the camera swings round, not through.
      const a = new Spherical().setFromVector3(offset.copy(reset.current.from).sub(TARGET));
      const b = new Spherical().setFromVector3(offset.copy(reset.current.to).sub(TARGET));
      let dTheta = b.theta - a.theta;
      if (dTheta > Math.PI) dTheta -= Math.PI * 2;
      if (dTheta < -Math.PI) dTheta += Math.PI * 2;
      const k = easeInOut(t);
      spherical.set(
        a.radius + (b.radius - a.radius) * k,
        a.phi + (b.phi - a.phi) * k,
        a.theta + dTheta * k,
      );
      c.target.lerp(TARGET, k);
      camera.position.copy(c.target).add(offset.setFromSpherical(spherical));
      c.update();
      if (t >= 1) reset.current = null;
      return;
    }

    const held = keys.current;
    if (held.size === 0) return;
    if (!interacted) setInteracted(true);
    offset.copy(camera.position).sub(c.target);
    spherical.setFromVector3(offset);
    if (held.has('ArrowLeft')) spherical.theta -= ROTATE_SPEED * delta;
    if (held.has('ArrowRight')) spherical.theta += ROTATE_SPEED * delta;
    if (held.has('ArrowUp')) spherical.phi -= ROTATE_SPEED * 0.6 * delta;
    if (held.has('ArrowDown')) spherical.phi += ROTATE_SPEED * 0.6 * delta;
    if (held.has('Equal') || held.has('NumpadAdd')) spherical.radius *= 1 - ZOOM_SPEED * delta;
    if (held.has('Minus') || held.has('NumpadSubtract')) spherical.radius *= 1 + ZOOM_SPEED * delta;
    spherical.phi = Math.min(Math.max(spherical.phi, MIN_POLAR), MAX_POLAR);
    spherical.radius = Math.min(Math.max(spherical.radius, MIN_DISTANCE), MAX_DISTANCE);
    camera.position.copy(c.target).add(offset.setFromSpherical(spherical));
    c.update();
  });

  usePoseReporter();

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.45}
      zoomSpeed={0.6}
      enablePan={false}
      // A very slow drift until the visitor takes over.
      autoRotate={autoRotate && !interacted}
      autoRotateSpeed={0.18}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
      minPolarAngle={MIN_POLAR}
      maxPolarAngle={MAX_POLAR}
      onStart={() => {
        setInteracted(true);
        reset.current = null;
      }}
    />
  );
}
