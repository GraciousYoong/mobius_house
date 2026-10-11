import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GROUND_Y, MODEL_RADIUS } from './config';

const SHADOW_EXTENT = MODEL_RADIUS + 6;
/**
 * Strength of the all-round environment light. Kept low: at full strength it
 * washes every surface to near-white and hides the differences between walls.
 * (Set on the scene; a material's envMapIntensity does not affect scene.environment.)
 */
const ENVIRONMENT_INTENSITY = 0.4;

/**
 * Soft light from all directions, generated locally (no image download).
 * Unlike a hemisphere light it varies around the horizon, so walls facing
 * different ways get different brightness, which is what makes a plain
 * model read in depth.
 */
function RoomLighting() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Lighting and ground plane shared by both viewing modes. */
export function Environment() {
  return (
    <>
      <color attach="background" args={['#d9dadc']} />
      <fog attach="fog" args={['#d9dadc', 90, 260]} />
      <RoomLighting />
      <hemisphereLight args={['#ffffff', '#8f8b84', 0.6]} />
      {/* Sun, from the south-east: the only light that casts shadows. */}
      <directionalLight
        position={[30, 45, 20]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
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
      {/* Sits just below the model's lowest point; the model carries its own site. */}
      <mesh rotation-x={-Math.PI / 2} position-y={GROUND_Y - 0.05} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#c9cbc6" roughness={1} />
      </mesh>
    </>
  );
}
