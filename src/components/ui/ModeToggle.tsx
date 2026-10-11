import type { ViewMode } from '../../state/viewerStore';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const options: { value: ViewMode; label: string }[] = [
  { value: 'orbit', label: 'Orbit' },
  { value: 'explore', label: 'Explore' },
];

/**
 * Segmented control for the viewing mode. A sliding indicator marks the active
 * option; each option stays a real toggle button for assistive technology.
 */
export function ModeToggle({ mode, onChange }: Props) {
  const active = options.findIndex((o) => o.value === mode);
  return (
    <div className="mode-toggle" role="group" aria-label="Viewing mode">
      <span
        className="mode-toggle__thumb"
        aria-hidden="true"
        style={{ transform: `translateX(${active * 100}%)` }}
      />
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
