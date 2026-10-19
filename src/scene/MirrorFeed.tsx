import { useFrame } from '@react-three/fiber';
import { getMirrorTarget } from './mirror';

/** Copies each finished frame to the hero replica at the end of the page, while it is visible. */
export function MirrorFeed() {
  // Priority 2 runs after the EffectComposer's render (priority 1), while the
  // finished frame is still in the drawing buffer.
  useFrame(({ gl }) => {
    const target = getMirrorTarget();
    if (!target) return;
    const source = gl.domElement;
    if (target.width !== source.width || target.height !== source.height) {
      target.width = source.width;
      target.height = source.height;
    }
    target.getContext('2d')?.drawImage(source, 0, 0);
  }, 2);
  return null;
}
