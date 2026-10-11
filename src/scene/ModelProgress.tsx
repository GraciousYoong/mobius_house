import { useProgress } from '@react-three/drei';

/** DOM overlay showing download progress of models inside the canvas. */
export function ModelProgress() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="scene-loading scene-loading--overlay" role="status" aria-live="polite">
      <span className="scene-loading__spinner" aria-hidden="true" />
      <span>Loading model… {Math.round(progress)}%</span>
    </div>
  );
}
