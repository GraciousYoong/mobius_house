import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { setModelStatus, type ViewMode } from '../state/viewerStore';
import type { DragDelta, HeldKeys, StickInput } from './types';
import { Environment } from './Environment';
import { HouseModel } from './models/HouseModel';
import { PlaceholderModel } from './models/PlaceholderModel';
import { OrbitView } from './controls/OrbitView';
import { ExploreView } from './controls/ExploreView';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { ModelProgress } from './ModelProgress';
import { GROUND_Y } from './config';
import { Effects, type RenderQuality } from './Effects';

interface Props {
  mode: ViewMode;
  keys: HeldKeys;
  drag: DragDelta;
  stick: StickInput;
  autoRotate: boolean;
  quality: RenderQuality;
  onContextLost: () => void;
}

function PlaceholderFallback() {
  useEffect(() => setModelStatus('fallback'), []);
  return (
    <group position-y={GROUND_Y}>
      <PlaceholderModel />
      {/* Invisible floor so Explore mode still has something to stand on. */}
      <mesh rotation-x={-Math.PI / 2} visible={false} userData={{ collidable: true }}>
        <circleGeometry args={[30, 32]} />
      </mesh>
    </group>
  );
}

/** The WebGL scene. Loaded lazily so page content is never blocked by it. */
export default function SceneCanvas({
  mode,
  keys,
  drag,
  stick,
  autoRotate,
  quality,
  onContextLost,
}: Props) {
  return (
    <>
      <Canvas
        shadows
        flat // tone mapping happens in <Effects>
        dpr={quality === 'high' ? [1, 2] : [1, 1.5]}
        // A tight near/far range keeps depth precise enough for the edge lines.
        camera={{ fov: 50, near: 0.2, far: 600, position: [32, 20, 32] }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            onContextLost();
          });
        }}
        // The focusable wrapper in Viewer carries the accessible name.
        aria-hidden="true"
      >
        <Environment />
        {/* If the house model cannot load, show the abstract placeholder instead. */}
        <SceneErrorBoundary fallback={<PlaceholderFallback />}>
          <Suspense fallback={null}>
            <HouseModel />
          </Suspense>
        </SceneErrorBoundary>
        {mode === 'orbit' ? (
          <OrbitView keys={keys} autoRotate={autoRotate} />
        ) : (
          <ExploreView keys={keys} drag={drag} stick={stick} />
        )}
        <Effects quality={quality} />
      </Canvas>
      <ModelProgress />
    </>
  );
}
