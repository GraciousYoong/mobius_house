interface Props {
  reason: 'unsupported' | 'error';
}

/** Static stand-in shown when the 3D view cannot run. */
export function SceneFallback({ reason }: Props) {
  return (
    <div className="scene-fallback" role="status">
      <svg viewBox="0 0 200 100" aria-hidden="true" className="scene-fallback__art">
        <path
          d="M20 50c0-25 30-35 50-15l40 40c20 20 70 10 70-25s-50-45-70-25L70 65C50 85 20 75 20 50z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <p className="scene-fallback__title">
        {reason === 'unsupported'
          ? 'The 3D view needs WebGL, which this browser or device does not provide.'
          : 'The 3D view could not be started.'}
      </p>
      <p className="scene-fallback__hint">
        The written sections below are unaffected. Try a current version of Chrome, Firefox, Safari
        or Edge with hardware acceleration enabled.
      </p>
    </div>
  );
}
