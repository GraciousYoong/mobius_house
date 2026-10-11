import type { ViewMode } from '../../state/viewerStore';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const options: { value: ViewMode; label: string }[] = [
  { value: 'orbit', label: 'Orbit' },
  { value: 'explore', label: 'Explore' },
];

/** Segmented control for switching viewing mode. */
export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="mode-toggle" role="group" aria-label="Viewing mode">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={mode === o.value}
          className="mode-toggle__btn"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
