import { GROUND_Y, MODEL_RADIUS } from './config';

const SHADOW_EXTENT = MODEL_RADIUS + 6;

/** Lighting and ground plane shared by both viewing modes. */
export function Environment() {
  return (
    <>
      <color attach="background" args={['#d9dadc']} />
      <fog attach="fog" args={['#d9dadc', 90, 260]} />
      <hemisphereLight args={['#ffffff', '#9c9a94', 1.0]} />
      {/* Lifts interiors, which receive no direct sun. */}
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[30, 45, 20]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-far={150}
      />
      {/* Sits just below the model's lowest point; the model carries its own site. */}
      <mesh rotation-x={-Math.PI / 2} position-y={GROUND_Y - 0.05} receiveShadow>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#c9cbc6" roughness={1} />
      </mesh>
    </>
  );
}
