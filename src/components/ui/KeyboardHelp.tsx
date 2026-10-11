import {
  commonBindings,
  exploreBindings,
  orbitBindings,
  type KeyBinding,
} from '../../content/controls';
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
      </div>
    );
  }

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
      <BindingList bindings={mode === 'orbit' ? orbitBindings : exploreBindings} />
      <BindingList bindings={commonBindings} />
    </div>
  );
}
