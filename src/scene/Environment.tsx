import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { getRoomEnvironment } from './environmentMap';
import { Backdrop, HORIZON } from './Backdrop';
import { GROUND_Y, MODEL_RADIUS } from './config';

const SHADOW_EXTENT = MODEL_RADIUS + 6;
/**
 * Strength of the all-round environment light. Kept low: at full strength it
 * washes every surface to near-white and hides the differences between walls.
 * (Set on the scene; a material's envMapIntensity does not affect scene.environment.)
 */
const ENVIRONMENT_INTENSITY = 0.4;

/**
 * Soft light from all directions. Unlike a hemisphere light it varies around
 * the horizon, so walls facing different ways get different brightness.
 */
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

/** Lighting and ground plane shared by both viewing modes. */
export function Environment() {
  return (
    <>
      <Backdrop />
      <fog attach="fog" args={[HORIZON, 120, 380]} />
      <RoomLighting />
      <hemisphereLight args={['#ffffff', '#d8d4cc', 0.4]} />
      {/*
        Key light, as in a model photograph: from the upper left of the opening
        view, low enough to throw long shadows towards the viewer. The only light
        that casts shadows.
      */}
      <directionalLight
        position={[-34, 26, 8]}
        intensity={3.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-far={150}
      />
      {/*
        Unshadowed fills from two other directions. They also reach interiors,
        giving each wall orientation its own tone, like SketchUp's face shading.
      */}
      <directionalLight position={[-30, 20, -10]} intensity={1.0} color="#f3f1ec" />
      <directionalLight position={[8, 12, -30]} intensity={0.4} color="#e8eef2" />
      {/* The table the model stands on: just below the model's lowest point, a shade darker than the white site. */}
      <mesh rotation-x={-Math.PI / 2} position-y={GROUND_Y - 0.05} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#d2cfc9" roughness={1} />
      </mesh>
    </>
  );
}
