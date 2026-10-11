import { createStore } from './createStore';

export type ViewMode = 'orbit' | 'explore';

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
}

export const viewerStore = createStore<ViewerState>({
  mode: 'orbit',
  pose: { x: 0, z: 14, heading: 0 },
  helpOpen: false,
});

export const setMode = (mode: ViewMode) => viewerStore.setState({ mode });
export const toggleMode = () =>
  setMode(viewerStore.getState().mode === 'orbit' ? 'explore' : 'orbit');
export const setHelpOpen = (helpOpen: boolean) => viewerStore.setState({ helpOpen });
export const setPose = (pose: Pose) => viewerStore.setState({ pose });
