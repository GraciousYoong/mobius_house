import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { getRoomEnvironment } from './environmentMap';
import { Backdrop, GROUND_COLOR, HORIZON } from './Backdrop';
import { GROUND_Y, MODEL_RADIUS } from './config';
import { viewerStore } from '../state/viewerStore';

const SHADOW_EXTENT = MODEL_RADIUS + 4;
/**
 * Strength of the all-round environment light. Kept low: at full strength it
 * washes surfaces out. (Set on the scene; a material's envMapIntensity does not
 * affect scene.environment.)
 */
const ENVIRONMENT_INTENSITY = 0.45;

/** Soft studio-style light from all directions, varying around the horizon. */
function RoomLighting() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.environment = getRoomEnvironment(gl);
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    return () => {
      scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

/**
 * Daylight for an architectural photograph: one soft, slightly warm sun from
 * the upper left of the opening view (low enough for long shadows towards the
 * viewer), a cool sky fill, and a weak bounce from the opposite side so
 * shaded façades stay readable instead of going black.
 */
export function Environment() {
  const modelReady = viewerStore.useStore((s) => s.modelStatus !== 'loading');
  return (
    <>
      <Backdrop />
      <fog attach="fog" args={[HORIZON, 70, 240]} />
      <RoomLighting />
      <hemisphereLight args={['#eef0f2', '#d4d2cd', 0.5]} />
      <directionalLight
        position={[-30, 24, 14]}
        intensity={2.7}
        color="#fffaf3"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-far={140}
      />
      {/* Bounce from the opposite side: unshadowed, so interiors read by orientation. */}
      <directionalLight position={[26, 14, -18]} intensity={0.7} color="#f1f0ee" />
      {/* Seamless ground: the backdrop's lower tone, so it fades into the background. */}
      <mesh rotation-x={-Math.PI / 2} position-y={GROUND_Y - 0.02} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial color={GROUND_COLOR} roughness={1} />
      </mesh>
      {/* Soft contact shadow where the site slab meets the ground; rendered once. */}
      {modelReady && (
        <ContactShadows
          position={[0, GROUND_Y + 0.01, 0]}
          scale={MODEL_RADIUS * 3}
          resolution={1024}
          far={4}
          blur={2.4}
          opacity={0.35}
          color="#5b544b"
          frames={1}
        />
      )}
    </>
  );
}
