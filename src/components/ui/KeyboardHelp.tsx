import {
  commonBindings,
  exploreBindings,
  exploreTouch,
  orbitBindings,
  orbitTouch,
  type KeyBinding,
} from '../../content/controls';
import { useCoarsePointer } from '../../hooks/useMediaQuery';
import type { ViewMode } from '../../state/viewerStore';

function BindingList({ bindings }: { bindings: KeyBinding[] }) {
  return (
    <dl className="bindings">
      {bindings.map((b) => (
        <div key={b.action} className="bindings__row">
          <dt>
            {b.keys.map((k, i) => (
              <span key={k}>
                {i > 0 && <span className="bindings__sep"> / </span>}
                <kbd>{k}</kbd>
              </span>
            ))}
          </dt>
          <dd>{b.action}</dd>
        </div>
      ))}
    </dl>
  );
}

interface Props {
  mode: ViewMode;
  id?: string;
  /** Compact panel for the viewer overlay; full lists for the Explore section. */
  variant?: 'panel' | 'full';
  onClose?: () => void;
}

export function KeyboardHelp({ mode, id, variant = 'panel', onClose }: Props) {
  const touch = useCoarsePointer();

  if (variant === 'full') {
    return (
      <div className="keyboard-help keyboard-help--full" id={id}>
        <div>
          <h3>Orbit mode</h3>
          <BindingList bindings={orbitBindings} />
        </div>
        <div>
          <h3>Explore mode</h3>
          <BindingList bindings={exploreBindings} />
        </div>
        <div>
          <h3>Everywhere</h3>
          <BindingList bindings={commonBindings} />
        </div>
        <div>
          <h3>Touch screens</h3>
          <BindingList bindings={[...orbitTouch.slice(0, 1), ...exploreTouch]} />
        </div>
      </div>
    );
  }

  // On touch devices show only gestures; keyboard shortcuts would just take up space.
  const bindings = touch
    ? mode === 'orbit'
      ? orbitTouch
      : exploreTouch
    : mode === 'orbit'
      ? orbitBindings
      : exploreBindings;

  return (
    <div className="keyboard-help keyboard-help--panel" id={id} role="region" aria-label="Controls">
      <div className="keyboard-help__header">
        <h3>{mode === 'orbit' ? 'Orbit controls' : 'Explore controls'}</h3>
        {onClose && (
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Hide controls"
          >
            ×
          </button>
        )}
      </div>
      <BindingList bindings={bindings} />
      {!touch && <BindingList bindings={commonBindings} />}
    </div>
  );
}
