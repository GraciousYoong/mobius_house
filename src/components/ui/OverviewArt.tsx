import { useState } from 'react';
import type { PhotoSlot } from '../../content/project';

/**
 * Line drawings for the Overview. All are generic or exact geometry, not
 * representations of the building itself:
 * - QuadrantsDiagram: four quadrants joined by a figure-of-eight path, after Ben
 *   van Berkel's own description of the plan idea.
 * - AnglesDiagram: the 7°, 9° and 11° angles, drawn to size.
 */

/** Four quadrants on a 24-hour dial, joined by a figure-of-eight path. */
export function QuadrantsDiagram({ className }: { className?: string }) {
  // Lemniscate of Bernoulli: the figure-of-eight path.
  const eight: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = (i / 200) * 2 * Math.PI;
    const d = 1 + Math.sin(t) ** 2;
    eight.push(
      `${((88 * Math.cos(t)) / d).toFixed(1)},${((88 * Math.sin(t) * Math.cos(t)) / d).toFixed(1)}`,
    );
  }
  return (
    <svg className={className} viewBox="-132 -82 264 164" aria-hidden="true">
      <ellipse
        rx="96"
        ry="58"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeDasharray="2 3"
      />
      <path d="M-110 0H110M0 -70V70" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
      <path d={`M${eight.join('L')}Z`} fill="none" stroke="currentColor" strokeWidth="1.8" />
      <g fill="currentColor" fontSize="9" textAnchor="middle" opacity="0.75">
        <text y="-71">06</text>
        <text y="78">18</text>
        <text x="-112" y="3" textAnchor="end">
          00
        </text>
        <text x="112" y="3" textAnchor="start">
          12
        </text>
      </g>
    </svg>
  );
}

/** Three lines at 7°, 9° and 11° to a horizontal, each with its angle marked. */
export function AnglesDiagram({ className }: { className?: string }) {
  const rows = [11, 9, 7];
  const L = 190;
  return (
    <svg className={className} viewBox="0 0 220 170" aria-hidden="true">
      {rows.map((deg, i) => {
        const y0 = 40 + i * 52;
        const a = (deg * Math.PI) / 180;
        const x1 = 10 + L * Math.cos(a);
        const y1 = y0 - L * Math.sin(a);
        const r = 70;
        const ax = 10 + r * Math.cos(a);
        const ay = y0 - r * Math.sin(a);
        return (
          <g key={deg} stroke="currentColor" fill="none">
            <path d={`M10 ${y0}H${10 + L}`} strokeOpacity="0.35" strokeWidth="0.8" />
            <path d={`M10 ${y0}L${x1.toFixed(1)} ${y1.toFixed(1)}`} strokeWidth="1.6" />
            <path
              d={`M${10 + r} ${y0}A${r} ${r} 0 0 0 ${ax.toFixed(1)} ${ay.toFixed(1)}`}
              strokeWidth="0.9"
            />
            <text x={10 + r + 8} y={y0 - 5} fill="currentColor" stroke="none" fontSize="13">
              {deg}°
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Photo that uses the uploaded file when present, otherwise the fallback.
 * (A static site cannot check for files at build time, so this falls back on load error.)
 */
export function SlotPhoto({ slot, className }: { slot: PhotoSlot; className?: string }) {
  const [src, setSrc] = useState(slot.src);
  return (
    <img
      className={className}
      src={src}
      alt={slot.alt}
      loading="lazy"
      onError={() => src !== slot.fallback && setSrc(slot.fallback)}
    />
  );
}
