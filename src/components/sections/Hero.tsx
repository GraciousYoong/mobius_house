import { forwardRef, useCallback } from 'react';
import { Viewer } from '../../scene/Viewer';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import { project } from '../../content/project';
import { resetView, setHelpOpen, setMode, toggleMode, viewerStore } from '../../state/viewerStore';
import { KeyboardHelp } from '../ui/KeyboardHelp';
import { ModeToggle } from '../ui/ModeToggle';
import { Minimap } from '../ui/Minimap';
import { ModelNotice } from '../ui/ModelNotice';

/** Full-screen hero: the 3D viewer plus its DOM overlays. */
export const Hero = forwardRef<HTMLDivElement>(function Hero(_, viewerRef) {
  const mode = viewerStore.useStore((s) => s.mode);
  const helpOpen = viewerStore.useStore((s) => s.helpOpen);
  const webgl = useWebGLSupport();
  const toggleHelp = useCallback(() => setHelpOpen(!viewerStore.getState().helpOpen), []);

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <Viewer
        ref={viewerRef}
        mode={mode}
        label={`Interactive 3D model of the Möbius House, ${mode} mode`}
        describedBy="viewer-instructions"
        onToggleMode={toggleMode}
        onToggleHelp={toggleHelp}
        onResetView={resetView}
      />

      <div className={`hero__overlay hero__overlay--${mode}`}>
        <div
          className={`hero__title-block ${mode === 'explore' ? 'hero__title-block--compact' : ''}`}
        >
          <p className="hero__eyebrow">
            {project.architect}
            <span aria-hidden="true"> · </span>
            {project.location}
          </p>
          <h1 id="hero-title" className="hero__title">
            {project.name}
          </h1>
          <p className="hero__tagline">{project.tagline}</p>
          <ModelNotice />
        </div>

        {webgl && (
          <div className="hero__toolbar" role="toolbar" aria-label="3D view">
            <ModeToggle mode={mode} onChange={setMode} />
            <span className="hero__toolbar-rule" aria-hidden="true" />
            {mode === 'orbit' ? (
              <button type="button" className="tool-button" onClick={resetView}>
                Reset view
              </button>
            ) : (
              <button type="button" className="tool-button" onClick={() => setMode('orbit')}>
                Exit
              </button>
            )}
            <button
              type="button"
              className="tool-button"
              aria-expanded={helpOpen}
              aria-controls="viewer-help"
              onClick={toggleHelp}
            >
              Controls
            </button>
          </div>
        )}

        {/* Right-hand column: the help panel shrinks and scrolls so it never covers the minimap. */}
        {webgl && (helpOpen || mode === 'explore') && (
          <div className="hero__side">
            {helpOpen && (
              <div className="hero__help">
                <KeyboardHelp id="viewer-help" mode={mode} onClose={() => setHelpOpen(false)} />
              </div>
            )}
            {mode === 'explore' && (
              <div className="hero__minimap">
                <Minimap />
              </div>
            )}
          </div>
        )}
      </div>

      <p id="viewer-instructions" className="visually-hidden">
        Focus the viewer with Tab. In orbit mode, arrow keys rotate, plus or minus zoom, and R
        resets the view. In explore mode, W A S D or the arrow keys walk and turn, Shift moves
        faster, and walls and stairs behave as in the building. The minimap announces which floor
        you are on. Press M to switch modes, X to show or hide the list of controls, and Escape to
        leave the viewer.
      </p>
    </section>
  );
});
