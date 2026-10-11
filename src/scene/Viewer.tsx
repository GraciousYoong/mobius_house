import {
  forwardRef,
  useEffect,
  lazy,
  Suspense,
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useCoarsePointer } from '../hooks/useMediaQuery';
import { TouchJoystick } from './TouchJoystick';
import type { ViewMode } from '../state/viewerStore';
import { SceneErrorBoundary } from './SceneErrorBoundary';
import { SceneFallback } from './SceneFallback';
import { SceneLoading } from './SceneLoading';

const SceneCanvas = lazy(() => import('./SceneCanvas'));

/** Keys the viewer consumes; the page must not scroll on these. */
const CAPTURED = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyQ',
  'KeyE',
  'Equal',
  'Minus',
  'NumpadAdd',
  'NumpadSubtract',
  'ShiftLeft',
  'ShiftRight',
]);

interface Props {
  mode: ViewMode;
  label: string;
  describedBy?: string;
  onToggleMode: () => void;
  onToggleHelp: () => void;
  onResetView: () => void;
}

/**
 * Public entry point of the 3D module. Owns WebGL detection, fallbacks,
 * lazy loading, and keyboard/pointer input. Content components only render
 * this and never import three.js directly.
 */
export const Viewer = forwardRef<HTMLDivElement, Props>(function Viewer(
  { mode, label, describedBy, onToggleMode, onToggleHelp, onResetView },
  ref,
) {
  const webgl = useWebGLSupport();
  const reducedMotion = usePrefersReducedMotion();
  const [contextLost, setContextLost] = useState(false);
  const [focused, setFocused] = useState(false);
  const keys = useRef(new Set<string>());
  const drag = useRef({ x: 0, y: 0 });
  const stick = useRef({ x: 0, y: 0 });
  const coarse = useCoarsePointer();
  const [locked, setLocked] = useState(false);
  const wrapper = useRef<HTMLDivElement | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'Escape') {
        e.currentTarget.blur();
        return;
      }
      if (e.code === 'KeyX') {
        e.preventDefault();
        onToggleHelp();
        return;
      }
      if (e.code === 'KeyR' && mode === 'orbit') {
        e.preventDefault();
        onResetView();
        return;
      }
      if (e.code === 'KeyM') {
        e.preventDefault();
        onToggleMode();
        return;
      }
      if (CAPTURED.has(e.code)) {
        e.preventDefault();
        keys.current.add(e.code);
      }
    },
    [mode, onToggleHelp, onToggleMode, onResetView],
  );

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => keys.current.delete(e.code);

  // Track mouse pointer lock (game-style mouse look in Explore mode).
  useEffect(() => {
    const onChange = () => setLocked(document.pointerLockElement === wrapper.current);
    document.addEventListener('pointerlockchange', onChange);
    return () => document.removeEventListener('pointerlockchange', onChange);
  }, []);
  useEffect(() => {
    if (mode !== 'explore' && document.pointerLockElement === wrapper.current) {
      document.exitPointerLock();
    }
  }, [mode]);

  // Explore mode: a mouse click locks the pointer for mouse look; touch and
  // pen drag to look. Orbit mode uses OrbitControls' own handling.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.focus({ preventScroll: true });
    if (mode !== 'explore') return;
    if (e.pointerType === 'mouse' && !locked) {
      // Older browsers return undefined instead of a promise.
      Promise.resolve(e.currentTarget.requestPointerLock()).catch(() => {});
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (mode !== 'explore') return;
    if (locked) {
      drag.current.x += e.movementX;
      drag.current.y += e.movementY;
      return;
    }
    if (!lastPointer.current) return;
    drag.current.x += e.clientX - lastPointer.current.x;
    drag.current.y += e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = () => {
    lastPointer.current = null;
  };

  let body;
  if (!webgl) body = <SceneFallback reason="unsupported" />;
  else if (contextLost) body = <SceneFallback reason="error" />;
  else
    body = (
      <SceneErrorBoundary fallback={<SceneFallback reason="error" />}>
        <Suspense fallback={<SceneLoading />}>
          <SceneCanvas
            mode={mode}
            keys={keys}
            drag={drag}
            stick={stick}
            quality={coarse ? 'low' : 'high'}
            autoRotate={!reducedMotion && !focused}
            onContextLost={() => setContextLost(true)}
          />
        </Suspense>
      </SceneErrorBoundary>
    );

  const interactive = webgl && !contextLost;

  return (
    <div
      ref={(el) => {
        wrapper.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      className={`viewer viewer--${mode} ${locked ? 'viewer--locked' : ''}`}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'application' : undefined}
      aria-roledescription={interactive ? '3D viewer' : undefined}
      aria-label={label}
      aria-describedby={describedBy}
      onKeyDown={interactive ? onKeyDown : undefined}
      onKeyUp={onKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        keys.current.clear();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {body}
      {interactive && mode === 'explore' && coarse && <TouchJoystick stick={stick} />}
      {interactive && mode === 'explore' && !coarse && !locked && (
        <p className="viewer__hint" aria-hidden="true">
          Click to look around with the mouse · Esc to release
        </p>
      )}
    </div>
  );
});
