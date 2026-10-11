import modelInfo from '../../content/generated/modelInfo.json';
import { viewerStore } from '../../state/viewerStore';

/**
 * Minimap: the visitor's position and heading over a plan drawn from the 3D
 * model's walls (see scripts/prepare-model.mjs). The plan and the scene share
 * one coordinate system — x east, z south, in metres — so no alignment step
 * is needed. If the model failed to load, a schematic of the placeholder is
 * shown instead.
 */

const [vx, vz, vw, vh] = modelInfo.planViewBox;
const MARKER = Math.max(vw, vh) / 40; // marker size relative to the plan

// Mirrors scene/models/PlaceholderModel.tsx. Duplicated on purpose so this DOM
// component does not pull three.js into the main bundle.
const PLACEHOLDER_RADIUS = 6;
const PLACEHOLDER_HALF_WIDTH = 2.2;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Minimap() {
  const pose = viewerStore.useStore((s) => s.pose);
  const status = viewerStore.useStore((s) => s.modelStatus);
  const x = clamp(pose.x, vx, vx + vw);
  const z = clamp(pose.z, vz, vz + vh);
  const deg = (-pose.heading * 180) / Math.PI;
  const fallback = status === 'fallback';

  return (
    <figure className="minimap">
      <svg viewBox={`${vx} ${vz} ${vw} ${vh}`} role="img" aria-labelledby="minimap-caption">
        <rect x={vx} y={vz} width={vw} height={vh} className="minimap__bg" />
        {fallback ? (
          <circle
            r={PLACEHOLDER_RADIUS}
            strokeWidth={PLACEHOLDER_HALF_WIDTH * 2}
            className="minimap__footprint"
          />
        ) : (
          <image href={modelInfo.plan} x={vx} y={vz} width={vw} height={vh} />
        )}
        <g transform={`translate(${x} ${z}) rotate(${deg}) scale(${MARKER})`}>
          <path d="M0 0 L-1.4 -2.8 A3.2 3.2 0 0 1 1.4 -2.8 Z" className="minimap__cone" />
          <circle r="0.55" className="minimap__dot" />
        </g>
        <text x={vx + vw - 1.5} y={vz + 3.5} className="minimap__north" aria-hidden="true">
          N↑
        </text>
      </svg>
      <figcaption id="minimap-caption" className="minimap__caption">
        {fallback ? 'Schematic of the placeholder' : 'Plan drawn from the 3D model; north up'}
      </figcaption>
    </figure>
  );
}
