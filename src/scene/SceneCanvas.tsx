import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { setModelStatus, type ViewMode } from '../state/viewerStore';
import type { DragDelta, HeldKeys } from './types';
import { Environment } from './Environment';
import { HouseModel } from './models/HouseModel';
import { PlaceholderModel } from './models/PlaceholderModel';
import { OrbitView } from './controls/OrbitView';
import { ExploreView } from './controls/ExploreView';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { ModelProgress } from './ModelProgress';
import { GROUND_Y } from './config';

interface Props {
  mode: ViewMode;
  keys: HeldKeys;
  drag: DragDelta;
  autoRotate: boolean;
  onContextLost: () => void;
}

function PlaceholderFallback() {
  useEffect(() => setModelStatus('fallback'), []);
  return (
    <group position-y={GROUND_Y}>
      <PlaceholderModel />
    </group>
  );
}

/** The WebGL scene. Loaded lazily so page content is never blocked by it. */
export default function SceneCanvas({ mode, keys, drag, autoRotate, onContextLost }: Props) {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ fov: 50, near: 0.1, far: 500, position: [32, 20, 32] }}
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
          <ExploreView keys={keys} drag={drag} />
        )}
      </Canvas>
      <ModelProgress />
    </>
  );
}
