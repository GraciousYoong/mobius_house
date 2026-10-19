import { forwardRef, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Viewer } from '../../scene/Viewer';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import { project } from '../../content/project';
import { resetView, setHelpOpen, setMode, toggleMode, viewerStore } from '../../state/viewerStore';
import { KeyboardHelp } from '../ui/KeyboardHelp';
import { ModeToggle } from '../ui/ModeToggle';
import { Minimap } from '../ui/Minimap';
import { ModelNotice } from '../ui/ModelNotice';
import { DragGrip } from '../ui/DragGrip';
import { useDraggable } from '../../hooks/useDraggable';
import { useCoarsePointer } from '../../hooks/useMediaQuery';
import { HeroMirror } from './HeroMirror';

/** Full-screen hero: the 3D viewer plus its DOM overlays. */
export const Hero = forwardRef<HTMLDivElement>(function Hero(_, viewerRef) {
  const mode = viewerStore.useStore((s) => s.mode);
  const helpOpen = viewerStore.useStore((s) => s.helpOpen);
  const webgl = useWebGLSupport();
  // The controls panel and the minimap can be dragged anywhere inside the hero.
  const helpDrag = useDraggable('mobius.help.offset', '.hero');
  const minimapDrag = useDraggable('mobius.minimap.offset', '.hero');
  const toggleHelp = useCallback(() => setHelpOpen(!viewerStore.getState().helpOpen), []);
  const coarse = useCoarsePointer();
  // Slot after the footer for the replica that makes the page loop (see HeroMirror).
  const [loopSlot, setLoopSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setLoopSlot(document.getElementById('page-loop')), []);

  // The overlay is rendered twice: live here, and inert in the replica. The
  // replica copy carries no ids, refs or drag handlers.
  const overlay = (mirror: boolean) => (
    <div className={`hero__overlay hero__overlay--${mode}`}>
      <div
        className={`hero__title-block ${mode === 'explore' ? 'hero__title-block--compact' : ''}`}
      >
        <p className="hero__eyebrow">
          {project.architect}
          <span aria-hidden="true"> · </span>
          {project.location}
        </p>
        <h1 id={mirror ? undefined : 'hero-title'} className="hero__title">
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
            aria-controls={mirror ? undefined : 'viewer-help'}
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
            <div
              ref={mirror ? undefined : helpDrag.panelRef}
              className="hero__help"
              style={helpDrag.style}
            >
              <KeyboardHelp
                id={mirror ? undefined : 'viewer-help'}
                mode={mode}
                onClose={() => setHelpOpen(false)}
                grip={<DragGrip label="controls panel" {...(mirror ? {} : helpDrag.gripProps)} />}
              />
            </div>
          )}
          {mode === 'explore' && (
            <div
              ref={mirror ? undefined : minimapDrag.panelRef}
              className="hero__minimap"
              style={minimapDrag.style}
            >
              <Minimap
                grip={<DragGrip label="minimap" {...(mirror ? {} : minimapDrag.gripProps)} />}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );

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

      {overlay(false)}
      {loopSlot &&
        createPortal(
          <HeroMirror mode={mode} webgl={webgl} coarse={coarse}>
            {overlay(true)}
          </HeroMirror>,
          loopSlot,
        )}

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
