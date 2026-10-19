import { useEffect, useRef, useState } from 'react';
import { navItems } from '../../content/navigation';
import { drawMobius } from './mobiusDrawing';

/** Fired by HeroMirror each time the page loops back to the top. */
export const PAGE_LOOP_EVENT = 'mobius:pageloop';

interface Status {
  visible: boolean;
  section: string;
  side: 'A' | 'B';
  lap: number;
  degrees: number;
}

/**
 * Where you are on the endless page, as a marker on a Möbius strip: one trip
 * through the page is one lap round the band, and as on a real Möbius strip
 * every other lap runs on the other face. Hidden while the hero (or its
 * replica at the end) fills the view, so it never covers the viewer's panels
 * and looks the same on both sides of the loop. Decorative: hidden from
 * assistive technology.
 */
export function LoopIndicator() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const laps = useRef(0);
  const [status, setStatus] = useState<Status>({
    visible: false,
    section: '',
    side: 'A',
    lap: 1,
    degrees: 0,
  });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.getElementById('top');
      const mirror = document.querySelector<HTMLElement>('.hero--mirror');
      if (!hero) return;
      const heroBox = hero.getBoundingClientRect();
      // One lap: from the hero at the top to its replica in the same place.
      const length = mirror
        ? mirror.getBoundingClientRect().top - heroBox.top
        : document.documentElement.scrollHeight - innerHeight;
      const progress = Math.min(Math.max(window.scrollY / Math.max(length, 1), 0), 1);
      const travel = (laps.current + progress) * 2 * Math.PI;
      if (canvas.current) drawMobius(canvas.current, travel);

      const mid = innerHeight / 2;
      const mirrorTop = mirror?.getBoundingClientRect().top ?? Infinity;
      let section = '';
      for (const { id, label } of navItems) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= innerHeight * 0.4) section = label;
      }
      const footer = document.querySelector('footer');
      if (footer && footer.getBoundingClientRect().top <= innerHeight * 0.6) section = 'Credits';

      setStatus({
        visible: heroBox.bottom < mid && mirrorTop > mid,
        section,
        side: laps.current % 2 === 0 ? 'A' : 'B',
        lap: laps.current + 1,
        degrees: Math.round(progress * 360),
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLoop = () => {
      laps.current += 1;
    };

    window.addEventListener(PAGE_LOOP_EVENT, onLoop);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Page height settles as images and fonts load.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(PAGE_LOOP_EVENT, onLoop);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`loop-indicator${status.visible ? ' is-visible' : ''}`} aria-hidden="true">
      <canvas ref={canvas} className="loop-indicator__strip" />
      <p className="loop-indicator__section">{status.section}</p>
      <p className="loop-indicator__meta">
        Side {status.side} · lap {status.lap} · {status.degrees}°
      </p>
    </div>
  );
}
