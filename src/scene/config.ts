import modelInfo from '../content/generated/modelInfo.json';

/**
 * Scene dimensions derived from the processed model (see
 * scripts/prepare-model.mjs). Units are metres; y = 0 is the main floor and
 * −Z points north, matching the published plan.
 */
export const MODEL_URL = '/models/mobius-house.glb';
export const MODEL_NAME = 'mobius-house';

const [minX, minY, minZ] = modelInfo.bounds.min;
const [maxX, , maxZ] = modelInfo.bounds.max;

/** Half the longest horizontal side of the model. */
export const MODEL_RADIUS = Math.max(maxX - minX, maxZ - minZ) / 2;
/** Lowest point of the model, where the surrounding ground plane sits. */
export const GROUND_Y = minY;
