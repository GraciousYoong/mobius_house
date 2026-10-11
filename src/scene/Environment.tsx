/** Lighting and ground plane shared by both viewing modes. */
export function Environment() {
  return (
    <>
      <color attach="background" args={['#d9dadc']} />
      <fog attach="fog" args={['#d9dadc', 40, 110]} />
      <hemisphereLight args={['#ffffff', '#9c9a94', 0.9]} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[240, 240]} />
        <meshStandardMaterial color="#c9cbc6" roughness={1} />
      </mesh>
      <gridHelper args={[60, 30, '#a3a6a8', '#b8babb']} position-y={0.01} />
    </>
  );
}
