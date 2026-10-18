import { useCallback, useLayoutEffect, useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { usePersistentState } from './usePersistentState';

interface Offset {
  x: number;
  y: number;
}

const KEY_STEP = 16; // px per arrow-key press (Shift: ×4)

/**
 * Lets the user move a panel inside its bounding container by dragging a grip.
 * The panel keeps its normal layout position and is shifted with a transform,
 * so "reset" simply clears the offset. The offset is clamped so the panel never
 * leaves the container, and it is remembered between visits.
 *
 * Returns a ref for the panel, its transform style, and props for the grip
 * (pointer drag, arrow keys to nudge, Home or double-click to reset).
 */
export function useDraggable(storageKey: string, boundsSelector: string) {
  const [offset, setOffset] = usePersistentState<Offset>(storageKey, { x: 0, y: 0 });
  const panel = useRef<HTMLElement | null>(null);
  const drag = useRef<{ startX: number; startY: number; from: Offset } | null>(null);

  /** Keeps the panel fully inside the bounding container. */
  const clamp = useCallback(
    (next: Offset, current: Offset): Offset => {
      const el = panel.current;
      const bounds = el?.closest(boundsSelector)?.getBoundingClientRect();
      if (!el || !bounds) return next;
      const rect = el.getBoundingClientRect();
      // Where the panel would sit with no offset at all.
      const baseLeft = rect.left - current.x;
      const baseTop = rect.top - current.y;
      const margin = 8;
      return {
        x: Math.min(
          Math.max(next.x, bounds.left + margin - baseLeft),
          bounds.right - margin - rect.width - baseLeft,
        ),
        y: Math.min(
          Math.max(next.y, bounds.top + margin - baseTop),
          bounds.bottom - margin - rect.height - baseTop,
        ),
      };
    },
    [boundsSelector],
  );

  // Re-clamp a remembered position when the window changes size.
  useLayoutEffect(() => {
    const fit = () => setOffset((o) => clamp(o, o));
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [clamp, setOffset]);

  // ...and whenever the panel appears or changes size (e.g. a larger minimap).
  const observer = useRef<ResizeObserver | null>(null);
  const panelRef = useCallback(
    (el: HTMLElement | null) => {
      observer.current?.disconnect();
      panel.current = el;
      if (!el) return;
      observer.current = new ResizeObserver(() => setOffset((o) => clamp(o, o)));
      observer.current.observe(el);
    },
    [clamp, setOffset],
  );

  const reset = () => setOffset({ x: 0, y: 0 });

  const gripProps = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation(); // not a look-around drag in the 3D view
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = { startX: e.clientX, startY: e.clientY, from: offset };
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d) return;
      e.stopPropagation();
      const next = { x: d.from.x + e.clientX - d.startX, y: d.from.y + e.clientY - d.startY };
      setOffset((o) => clamp(next, o));
    },
    onPointerUp: () => {
      drag.current = null;
    },
    onPointerCancel: () => {
      drag.current = null;
    },
    onDoubleClick: reset,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      const step = e.shiftKey ? KEY_STEP * 4 : KEY_STEP;
      const moves: Record<string, Offset> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
      };
      if (e.key === 'Home') {
        e.preventDefault();
        reset();
      } else if (moves[e.key]) {
        e.preventDefault();
        e.stopPropagation(); // don't also drive the 3D view
        setOffset((o) => clamp({ x: o.x + moves[e.key].x, y: o.y + moves[e.key].y }, o));
      }
    },
  };

  const style =
    offset.x || offset.y ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined;
  const moved = offset.x !== 0 || offset.y !== 0;

  return { panelRef, style, gripProps, moved, reset };
}
