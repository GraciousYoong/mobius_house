import { useEffect, useRef, type ReactNode } from 'react';
import { setMirrorTarget } from '../../scene/mirror';
import { SceneFallback } from '../../scene/SceneFallback';
import type { ViewMode } from '../../state/viewerStore';

interface Props {
  mode: ViewMode;
  webgl: boolean;
  coarse: boolean;
  /** The hero overlay, rendered a second time for the replica. */
  children: ReactNode;
}

/**
 * Endless page: a replica of the hero after the footer. The 3D view is copied
 * into it frame by frame, and once it reaches the exact place the hero
 * occupies at the top of the page, the page jumps back to the top. Both look
 * identical at that moment, so scrolling simply carries on from the start.
 * The replica is hidden from assistive technology and cannot be focused.
 */
export function HeroMirror({ mode, webgl, coarse, children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.inert = true;

    // Copy frames only while the replica is (nearly) on screen.
    const observer = new IntersectionObserver(
      ([entry]) => setMirrorTarget(entry.isIntersecting ? canvas.current : null),
      { rootMargin: '200px 0px' },
    );
    observer.observe(el);

    const onScroll = () => {
      const hero = document.getElementById('top');
      if (!hero) return;
      // Distance between the hero and its replica in the document.
      const gap = el.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      if (gap > 0 && window.scrollY >= gap - 1) {
        window.scrollTo({ top: Math.max(0, window.scrollY - gap), behavior: 'instant' });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      setMirrorTarget(null);
    };
  }, []);

  return (
    <div className="loop-tail">
      <div ref={root} className="hero hero--mirror" aria-hidden="true">
        <div className="hero-mirror__view">
          {webgl ? (
            <canvas ref={canvas} className="hero-mirror__canvas" />
          ) : (
            <SceneFallback reason="unsupported" />
          )}
          {webgl && mode === 'explore' && coarse && (
            <div className="joystick">
              <div className="joystick__knob" />
            </div>
          )}
          {webgl && mode === 'explore' && !coarse && (
            <p className="viewer__hint">Click to look around with the mouse · Esc to release</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
