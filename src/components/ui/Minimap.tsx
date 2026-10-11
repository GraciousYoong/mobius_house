import { viewerStore } from '../../state/viewerStore';

/**
 * Prototype minimap: shows the visitor's position and heading over a
 * schematic of the placeholder's footprint. It is NOT a floor plan — the real
 * plan will replace the schematic once sourced drawings are available.
 */

const VIEW_EXTENT = 20; // scene units shown from centre to edge
// Mirrors the placeholder band (scene/models/PlaceholderModel.tsx). Duplicated
// on purpose so this DOM component does not pull three.js into the main bundle.
const PLACEHOLDER_RADIUS = 6;
const PLACEHOLDER_HALF_WIDTH = 2.2;
const SIZE = 100;
const scale = SIZE / 2 / VIEW_EXTENT;

const toMap = (v: number) => SIZE / 2 + v * scale;

export function Minimap() {
  const pose = viewerStore.useStore((s) => s.pose);
  const x = toMap(Math.max(-VIEW_EXTENT, Math.min(VIEW_EXTENT, pose.x)));
  const y = toMap(Math.max(-VIEW_EXTENT, Math.min(VIEW_EXTENT, pose.z)));
  const deg = (-pose.heading * 180) / Math.PI;

  return (
    <figure className="minimap">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-labelledby="minimap-caption">
        <rect x="0" y="0" width={SIZE} height={SIZE} className="minimap__bg" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={PLACEHOLDER_RADIUS * scale}
          strokeWidth={PLACEHOLDER_HALF_WIDTH * 2 * scale}
          className="minimap__footprint"
        />
        <g transform={`translate(${x} ${y}) rotate(${deg})`}>
          <path d="M0 0 L-7 -14 A16 16 0 0 1 7 -14 Z" className="minimap__cone" />
          <circle r="2.6" className="minimap__dot" />
        </g>
      </svg>
      <figcaption id="minimap-caption" className="minimap__caption">
        Schematic only — not the floor plan
      </figcaption>
    </figure>
  );
}
