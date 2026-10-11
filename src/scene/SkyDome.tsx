import { BackSide, Color, ShaderMaterial } from 'three';

export const HORIZON = '#e4e3dd';
const ZENITH = '#a9c0d0';
const BELOW = '#cfcbc2';

/** Soft vertical gradient sky: pale blue overhead fading to a hazy horizon. */
const material = new ShaderMaterial({
  side: BackSide,
  depthWrite: false,
  fog: false,
  uniforms: {
    zenith: { value: new Color(ZENITH) },
    horizon: { value: new Color(HORIZON) },
    below: { value: new Color(BELOW) },
  },
  vertexShader: /* glsl */ `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 zenith;
    uniform vec3 horizon;
    uniform vec3 below;
    varying vec3 vDir;
    void main() {
      float h = vDir.y;
      vec3 c = h > 0.0
        ? mix(horizon, zenith, pow(smoothstep(0.0, 0.6, h), 0.8))
        : mix(horizon, below, smoothstep(0.0, 0.1, -h));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }
  `,
});

export function SkyDome() {
  return (
    <mesh material={material} renderOrder={-1} raycast={() => {}}>
      <sphereGeometry args={[450, 32, 16]} />
    </mesh>
  );
}
