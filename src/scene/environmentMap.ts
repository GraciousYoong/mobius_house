import { PMREMGenerator, type Texture, type WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const cache = new WeakMap<WebGLRenderer, Texture>();

/**
 * Soft studio-style environment generated locally (no image download), shared
 * by the scene lighting and the glass reflections. Created once per renderer.
 */
export function getRoomEnvironment(gl: WebGLRenderer): Texture {
  let texture = cache.get(gl);
  if (!texture) {
    const pmrem = new PMREMGenerator(gl);
    texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    cache.set(gl, texture);
  }
  return texture;
}
