import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLButtonElement> {
  /** What is being moved, e.g. "controls" or "minimap". */
  label: string;
}

/**
 * Handle for moving a panel: drag with the mouse or a finger, or focus it and
 * use the arrow keys. Double-click or Home puts the panel back.
 */
export function DragGrip({ label, ...handlers }: Props) {
  return (
    <button
      type="button"
      className="drag-grip"
      aria-label={`Move ${label}. Arrow keys to move, Home to reset.`}
      title={`Drag to move ${label} · double-click to reset`}
      {...handlers}
    >
      <svg viewBox="0 0 8 14" aria-hidden="true">
        {[2, 7, 12].flatMap((y) => [
          <circle key={`a${y}`} cx="2" cy={y} r="1.1" />,
          <circle key={`b${y}`} cx="6" cy={y} r="1.1" />,
        ])}
      </svg>
    </button>
  );
}
