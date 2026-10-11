export interface KeyBinding {
  keys: string[];
  action: string;
}

export const orbitBindings: KeyBinding[] = [
  { keys: ['←', '→'], action: 'Rotate around the model' },
  { keys: ['↑', '↓'], action: 'Tilt the view' },
  { keys: ['+', '−'], action: 'Zoom in / out' },
  { keys: ['Drag'], action: 'Rotate (mouse or touch)' },
  { keys: ['Scroll', 'Pinch'], action: 'Zoom' },
];

export const exploreBindings: KeyBinding[] = [
  { keys: ['W', '↑'], action: 'Walk forward' },
  { keys: ['S', '↓'], action: 'Walk backward' },
  { keys: ['A', 'D'], action: 'Step left / right' },
  { keys: ['←', '→'], action: 'Turn left / right' },
  { keys: ['Shift'], action: 'Move faster' },
  { keys: ['Drag'], action: 'Look around (mouse or touch)' },
];

export const commonBindings: KeyBinding[] = [
  { keys: ['Tab'], action: 'Focus the 3D view, then use the keys above' },
  { keys: ['M'], action: 'Switch between Orbit and Explore' },
  { keys: ['?'], action: 'Show or hide these instructions' },
  { keys: ['Esc'], action: 'Leave the 3D view' },
];
