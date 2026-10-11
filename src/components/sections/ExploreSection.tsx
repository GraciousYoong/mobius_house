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
          Explore mode lets you walk through the house at eye height, as in a game. Walls and
          glazing block your way, you can climb the stairs and ramps between the ground and first
          floors, and the minimap switches to the plan of the floor you are on. The model is an
          unofficial SketchUp reconstruction by Brice C, so details may differ from the real
          building.
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
