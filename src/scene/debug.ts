/**
 * Development-only debug switches, read from the URL. In production builds
 * `import.meta.env.DEV` is false, so every flag is false and the related code
 * is removed by the bundler.
 *
 *   ?debug                 grid, axes and building bounds in the 3D view
 *   ?debug=surfaces        colour each surface group vividly (check the grouping)
 *   ?at=x,eyeY,z,yaw       start Explore mode at a given position and heading
 */

const params =
  import.meta.env.DEV && typeof location !== 'undefined'
    ? new URLSearchParams(location.search)
    : new URLSearchParams();

const debugValue = params.get('debug');

export const debugFlags = {
  helpers: import.meta.env.DEV && debugValue !== null,
  surfaces: import.meta.env.DEV && (debugValue ?? '').split(',').includes('surfaces'),
};

/** Explore start override `[x, eyeY, z, yaw]`, development only. */
export const debugExploreStart: number[] | null = (() => {
  const at = params.get('at');
  if (!import.meta.env.DEV || !at) return null;
  const values = at.split(',').map(Number);
  return values.length >= 3 && values.every(Number.isFinite) ? values : null;
})();
