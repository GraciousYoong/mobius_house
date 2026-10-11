import { model } from '../../content/project';
import { viewerStore } from '../../state/viewerStore';

/** Persistent label stating what the 3D view shows and how reliable it is. */
export function ModelNotice() {
  const status = viewerStore.useStore((s) => s.modelStatus);

  if (status === 'fallback') {
    return (
      <p className="model-notice">
        <strong>Placeholder model.</strong> The house model could not be loaded; this abstract
        Möbius band is not the Möbius House.
      </p>
    );
  }
  return (
    <p className="model-notice">
      <strong>{model.label}.</strong> {model.caveat}
    </p>
  );
}
