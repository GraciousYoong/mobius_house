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
          Explore mode is an early first-person prototype. You walk at eye height through an
          unofficial SketchUp reconstruction of the house; your feet follow its floors, ramps and
          the sloping site, but walls do not block movement yet. The minimap plan is drawn from the
          same model, so it shares the model’s inaccuracies.
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
