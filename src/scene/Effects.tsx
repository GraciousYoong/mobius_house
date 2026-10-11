import { EffectComposer, N8AO, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

export type RenderQuality = 'high' | 'low';

interface Props {
  quality: RenderQuality;
}

/**
 * Post-processing that makes the plain model read as a finished render:
 * - ambient occlusion darkens corners, junctions and contact areas,
 * - SMAA smooths jagged edges, and
 * - neutral tone mapping (the archviz standard) keeps the greys from shifting.
 * Multisampling stays off: combined with N8AO it erases the model's edge lines.
 * Phones and tablets get a cheaper half-resolution occlusion pass.
 */
export function Effects({ quality }: Props) {
  const high = quality === 'high';
  return (
    <EffectComposer multisampling={0}>
      <N8AO
        aoRadius={1.8}
        distanceFalloff={1}
        intensity={2.8}
        color="#3d3832"
        halfRes={!high}
        quality={high ? 'medium' : 'performance'}
      />
      <SMAA />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}
