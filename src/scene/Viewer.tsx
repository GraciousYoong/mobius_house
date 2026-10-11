import {
  forwardRef,
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
}

/**
 * Public entry point of the 3D module. Owns WebGL detection, fallbacks,
 * lazy loading, and keyboard/pointer input. Content components only render
 * this and never import three.js directly.
 */
export const Viewer = forwardRef<HTMLDivElement, Props>(function Viewer(
  { mode, label, describedBy, onToggleMode, onToggleHelp },
  ref,
) {
  const webgl = useWebGLSupport();
  const reducedMotion = usePrefersReducedMotion();
  const [contextLost, setContextLost] = useState(false);
  const [focused, setFocused] = useState(false);
  const keys = useRef(new Set<string>());
  const drag = useRef({ x: 0, y: 0 });
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'Escape') {
        e.currentTarget.blur();
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        onToggleHelp();
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
    [onToggleHelp, onToggleMode],
  );

  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => keys.current.delete(e.code);

  // In Explore mode, drag to look. Orbit mode uses OrbitControls' own handling.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.focus({ preventScroll: true });
    if (mode !== 'explore') return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (mode !== 'explore' || !lastPointer.current) return;
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
            autoRotate={!reducedMotion && !focused}
            onContextLost={() => setContextLost(true)}
          />
        </Suspense>
      </SceneErrorBoundary>
    );

  const interactive = webgl && !contextLost;

  return (
    <div
      ref={ref}
      className={`viewer viewer--${mode}`}
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
    </div>
  );
});
