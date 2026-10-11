import { BackSide, Color, ShaderMaterial } from 'three';

/**
 * Seamless dark studio backdrop (an "infinity cove"): a faint warm glow at the
 * horizon fading to near-black overhead, so the pale building reads as the
 * only lit subject, as in a gallery or product photograph.
 */
// The ground colour is darker than the horizon because the ground is lit by the
// sun while the backdrop is not; rendered, the two meet without a seam.
export const GROUND_COLOR = '#1f1e1c';
export const HORIZON = '#2b2a27';
const ABOVE = '#0f0f0e';

const material = new ShaderMaterial({
  side: BackSide,
  depthWrite: false,
  fog: false,
  uniforms: {
    above: { value: new Color(ABOVE) },
    horizon: { value: new Color(HORIZON) },
    below: { value: new Color(GROUND_COLOR) },
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
        ? mix(horizon, above, smoothstep(0.0, 0.55, h))
        : mix(horizon, below, smoothstep(0.0, 0.1, -h));
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
