import { createStore } from './createStore';

export type ViewMode = 'orbit' | 'explore';

/** `fallback`: the house model failed to load and the abstract placeholder is shown. */
export type ModelStatus = 'loading' | 'ready' | 'fallback';

export interface Pose {
  /** Position on the ground plane, in metres. */
  x: number;
  z: number;
  /** Height of the visitor's feet (eye height minus 1.6 m). */
  feetY: number;
  /** Viewing direction in radians, 0 = looking towards −Z. */
  heading: number;
}

interface ViewerState {
  mode: ViewMode;
  pose: Pose;
  helpOpen: boolean;
  modelStatus: ModelStatus;
  /** Generic trees around the site (scenery, not survey data). */
  showSurroundings: boolean;
}

export const viewerStore = createStore<ViewerState>({
  mode: 'orbit',
  pose: { x: 0, z: 12, feetY: 0, heading: 0 },
  helpOpen: false,
  modelStatus: 'loading',
  showSurroundings: true,
});

export const setMode = (mode: ViewMode) => viewerStore.setState({ mode });
export const toggleMode = () =>
  setMode(viewerStore.getState().mode === 'orbit' ? 'explore' : 'orbit');
export const setHelpOpen = (helpOpen: boolean) => viewerStore.setState({ helpOpen });
export const setPose = (pose: Pose) => viewerStore.setState({ pose });
export const setModelStatus = (modelStatus: ModelStatus) => viewerStore.setState({ modelStatus });
export const toggleSurroundings = () =>
  viewerStore.setState({ showSurroundings: !viewerStore.getState().showSurroundings });
