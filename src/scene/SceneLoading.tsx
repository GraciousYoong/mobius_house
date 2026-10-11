/** Shown while the 3D code chunk and scene assets download. */
export function SceneLoading() {
  return (
    <div className="scene-loading" role="status" aria-live="polite">
      <span className="scene-loading__spinner" aria-hidden="true" />
      <span>Loading 3D view…</span>
    </div>
  );
}
