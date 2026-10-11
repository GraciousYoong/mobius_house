import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ViewMode } from '../state/viewerStore';
import type { DragDelta, HeldKeys } from './types';
import { Environment } from './Environment';
import { PlaceholderModel } from './models/PlaceholderModel';
import { OrbitView } from './controls/OrbitView';
import { ExploreView } from './controls/ExploreView';

interface Props {
  mode: ViewMode;
  keys: HeldKeys;
  drag: DragDelta;
  autoRotate: boolean;
  onContextLost: () => void;
}

/** The WebGL scene. Loaded lazily so page content is never blocked by it. */
export default function SceneCanvas({ mode, keys, drag, autoRotate, onContextLost }: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 55, near: 0.1, far: 300, position: [14, 9, 14] }}
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
      <Suspense fallback={null}>
        <PlaceholderModel />
      </Suspense>
      {mode === 'orbit' ? (
        <OrbitView keys={keys} autoRotate={autoRotate} />
      ) : (
        <ExploreView keys={keys} drag={drag} />
      )}
    </Canvas>
  );
}
