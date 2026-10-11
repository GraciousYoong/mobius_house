import modelInfo from '../../content/generated/modelInfo.json';
import { viewerStore } from '../../state/viewerStore';

/**
 * Minimap: the visitor's position and heading over a plan of the floor they
 * are on, drawn from the 3D model's walls (see scripts/prepare-model.mjs).
 * The plans and the scene share one coordinate system — x east, z south, in
 * metres — so no alignment step is needed. The plan switches automatically
 * when the visitor climbs to another floor. If the model failed to load, a
 * schematic of the placeholder is shown instead.
 */

const [vx, vz, vw, vh] = modelInfo.planViewBox;
const MARKER = Math.max(vw, vh) / 40; // marker size relative to the plan

// Mirrors scene/models/PlaceholderModel.tsx. Duplicated on purpose so this DOM
// component does not pull three.js into the main bundle.
const PLACEHOLDER_RADIUS = 6;
const PLACEHOLDER_HALF_WIDTH = 2.2;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const levels = modelInfo.levels;

/** The highest floor whose starting height is at or below the visitor's feet. */
function levelAt(feetY: number) {
  let current = levels[0];
  for (const level of levels) if (level.from === null || feetY >= level.from) current = level;
  return current;
}

export function Minimap() {
  const pose = viewerStore.useStore((s) => s.pose);
  const status = viewerStore.useStore((s) => s.modelStatus);
  const x = clamp(pose.x, vx, vx + vw);
  const z = clamp(pose.z, vz, vz + vh);
  const deg = (-pose.heading * 180) / Math.PI;
  const fallback = status === 'fallback';
  const level = levelAt(pose.feetY);

  // A 10 m scale bar in the lower-left corner of the plan.
  const barX = vx + 2;
  const barY = vz + vh - 2.2;

  return (
    <figure className="minimap" aria-labelledby="minimap-caption">
      <figcaption id="minimap-caption" className="minimap__header">
        {fallback ? (
          <span className="minimap__level">Schematic</span>
        ) : (
          // Announced when it changes, so screen-reader users hear the floor switch.
          <span className="minimap__level" aria-live="polite">
            {level.label}
          </span>
        )}
        <span className="minimap__north" aria-label="North is up">
          <svg viewBox="0 0 10 14" aria-hidden="true">
            <path d="M5 1 L8.5 12 L5 9.5 L1.5 12 Z" />
          </svg>
          N
        </span>
      </figcaption>
      <svg
        viewBox={`${vx} ${vz} ${vw} ${vh}`}
        role="img"
        aria-label={`Plan of the ${fallback ? 'placeholder' : level.label.toLowerCase()} showing your position and direction`}
      >
        {fallback ? (
          <circle
            r={PLACEHOLDER_RADIUS}
            strokeWidth={PLACEHOLDER_HALF_WIDTH * 2}
            className="minimap__footprint"
          />
        ) : (
          // All plans stay loaded so switching floors is instant.
          levels.map((l) => (
            <image
              key={l.id}
              href={l.plan}
              x={vx}
              y={vz}
              width={vw}
              height={vh}
              className="minimap__plan"
              visibility={l.id === level.id ? 'visible' : 'hidden'}
            />
          ))
        )}
        <g className="minimap__scale" aria-hidden="true">
          <path d={`M${barX} ${barY - 0.6}V${barY}H${barX + 10}V${barY - 0.6}`} />
          <text x={barX + 10.8} y={barY + 0.1}>
            10 m
          </text>
        </g>
        <g transform={`translate(${x} ${z}) rotate(${deg}) scale(${MARKER})`}>
          <path d="M0 0 L-1.5 -3.2 A3.6 3.6 0 0 1 1.5 -3.2 Z" className="minimap__cone" />
          <circle r="0.65" className="minimap__dot" />
        </g>
      </svg>
      <p className="minimap__note">Plan derived from the 3D model</p>
    </figure>
  );
}
