import {
  CanvasTexture,
  LinearMipmapLinearFilter,
  MeshStandardMaterial,
  RepeatWrapping,
  type MeshStandardMaterialParameters,
} from 'three';

/**
 * Procedural concrete: a tileable grey mottle generated in a canvas (no image
 * download), mapped onto the model with triplanar projection. The SketchUp
 * model has no texture coordinates, so the texture is projected along the
 * world X, Y and Z axes and blended by surface direction instead.
 */

const SIZE = 512;
/** World metres covered by one repeat of the texture. */
const TILE_METRES = 3;

/** Tileable value noise: lattice values repeat every `period` cells. */
function makeNoise(period: number, seed: number) {
  const lattice = new Float32Array(period * period);
  let s = seed;
  for (let i = 0; i < lattice.length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    lattice[i] = s / 4294967296;
  }
  const at = (x: number, y: number) =>
    lattice[(((y % period) + period) % period) * period + (((x % period) + period) % period)];
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    const x = u * period;
    const y = v * period;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = smooth(x - x0);
    const fy = smooth(y - y0);
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
}

function createConcreteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(SIZE, SIZE);

  // Broad cloudy patches, medium mottle and fine grain, all tileable.
  const octaves = [
    { noise: makeNoise(4, 11), weight: 0.45 },
    { noise: makeNoise(16, 23), weight: 0.3 },
    { noise: makeNoise(64, 37), weight: 0.15 },
    { noise: makeNoise(256, 51), weight: 0.1 },
  ];
  let s = 97;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      let n = 0;
      for (const o of octaves) n += o.noise(x / SIZE, y / SIZE) * o.weight;
      // Occasional small pores, as in cast concrete.
      s = (s * 1664525 + 1013904223) >>> 0;
      if (s / 4294967296 < 0.0015) n -= 0.25;
      const v = Math.max(0, Math.min(255, Math.round(n * 255)));
      const i = (y * SIZE + x) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  return texture;
}

/**
 * MeshStandardMaterial with the triplanar concrete mottle multiplied into
 * its colour (after vertex colours, so orientation tones are kept).
 * `strength` 0..1 sets how visible the mottle is.
 */
export function createConcreteMaterial(params: MeshStandardMaterialParameters, strength = 0.22) {
  const material = new MeshStandardMaterial(params);
  const texture = typeof document !== 'undefined' ? createConcreteTexture() : null;
  if (!texture) return material;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.concreteMap = { value: texture };
    shader.uniforms.concreteScale = { value: 1 / TILE_METRES };
    shader.uniforms.concreteStrength = { value: strength };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vConcretePos;\nvarying vec3 vConcreteNormal;',
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vConcretePos = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vConcreteNormal = normalize(mat3(modelMatrix) * objectNormal);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D concreteMap;
        uniform float concreteScale;
        uniform float concreteStrength;
        varying vec3 vConcretePos;
        varying vec3 vConcreteNormal;`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          vec3 w = pow(abs(normalize(vConcreteNormal)), vec3(4.0));
          w /= (w.x + w.y + w.z);
          vec3 p = vConcretePos * concreteScale;
          float m = texture2D(concreteMap, p.zy).r * w.x
                  + texture2D(concreteMap, p.xz).r * w.y
                  + texture2D(concreteMap, p.xy).r * w.z;
          // Centre the mottle around 1 so the overall tone stays the same.
          diffuseColor.rgb *= 1.0 + (m - 0.5) * 2.0 * concreteStrength;
        }`,
      );
  };
  // Distinguish the compiled program from plain MeshStandardMaterial.
  material.customProgramCacheKey = () => 'triplanar-concrete';
  return material;
}
