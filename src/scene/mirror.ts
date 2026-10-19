/**
 * The looping page ends with a replica of the hero. While that replica is on
 * screen it registers its canvas here, and <MirrorFeed> copies every rendered
 * frame into it, so the jump back to the real hero is invisible.
 */
let target: HTMLCanvasElement | null = null;

export const setMirrorTarget = (canvas: HTMLCanvasElement | null) => {
  target = canvas;
};

export const getMirrorTarget = () => target;
