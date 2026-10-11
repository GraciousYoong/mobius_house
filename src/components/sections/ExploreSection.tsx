import { setMode, viewerStore } from '../../state/viewerStore';
import { KeyboardHelp } from '../ui/KeyboardHelp';
import { Section } from '../layout/Section';

interface Props {
  onEnter: () => void;
}

export function ExploreSection({ onEnter }: Props) {
  const mode = viewerStore.useStore((s) => s.mode);

  return (
    <Section id="explore" eyebrow="Interactive" title="Explore">
      <div className="prose">
        <p>
          Explore mode is an early first-person prototype. You walk at eye height around an abstract
          placeholder; it is not yet possible to walk through the real house, because no verified
          model of it has been sourced. Walls do not block movement yet, and the minimap shows a
          schematic rather than the floor plan.
        </p>
      </div>
      <button
        type="button"
        className="button button--primary"
        onClick={() => {
          setMode('explore');
          onEnter();
        }}
      >
        {mode === 'explore' ? 'Return to Explore view' : 'Enter Explore mode'}
      </button>
      <h3 className="section__subtitle">Keyboard and touch controls</h3>
      <KeyboardHelp mode={mode} variant="full" />
    </Section>
  );
}
