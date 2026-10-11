import { createStore } from './createStore';

export type ViewMode = 'orbit' | 'explore';

/** `fallback`: the house model failed to load and the abstract placeholder is shown. */
export type ModelStatus = 'loading' | 'ready' | 'fallback';

export interface Pose {
  /** Position on the ground plane, in scene units (≈ metres). */
  x: number;
  z: number;
  /** Viewing direction in radians, 0 = looking towards −Z. */
  heading: number;
}

interface ViewerState {
  mode: ViewMode;
  pose: Pose;
  helpOpen: boolean;
  modelStatus: ModelStatus;
}

export const viewerStore = createStore<ViewerState>({
  mode: 'orbit',
  pose: { x: 4, z: 18, heading: 0 },
  helpOpen: false,
  modelStatus: 'loading',
});

export const setMode = (mode: ViewMode) => viewerStore.setState({ mode });
export const toggleMode = () =>
  setMode(viewerStore.getState().mode === 'orbit' ? 'explore' : 'orbit');
export const setHelpOpen = (helpOpen: boolean) => viewerStore.setState({ helpOpen });
export const setPose = (pose: Pose) => viewerStore.setState({ pose });
export const setModelStatus = (modelStatus: ModelStatus) => viewerStore.setState({ modelStatus });
