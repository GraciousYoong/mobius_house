import { BackSide, Color, ShaderMaterial } from 'three';

/**
 * Studio backdrop, as used to photograph white architectural models: a pale,
 * warm grey that brightens slightly overhead and darkens below the horizon.
 */
export const HORIZON = '#dddbd7';
const ABOVE = '#e9e8e5';
const BELOW = '#cfccc6';

const material = new ShaderMaterial({
  side: BackSide,
  depthWrite: false,
  fog: false,
  uniforms: {
    above: { value: new Color(ABOVE) },
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
    uniform vec3 above;
    uniform vec3 horizon;
    uniform vec3 below;
    varying vec3 vDir;
    void main() {
      float h = vDir.y;
      vec3 c = h > 0.0
        ? mix(horizon, above, smoothstep(0.0, 0.7, h))
        : mix(horizon, below, smoothstep(0.0, 0.25, -h));
      gl_FragColor = vec4(c, 1.0);
      #include <colorspace_fragment>
    }
  `,
});

export function Backdrop() {
  return (
    <mesh material={material} renderOrder={-1} raycast={() => {}}>
      <sphereGeometry args={[450, 32, 16]} />
    </mesh>
  );
}
