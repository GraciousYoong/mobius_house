export interface KeyBinding {
  keys: string[];
  action: string;
}

export const orbitBindings: KeyBinding[] = [
  { keys: ['←', '→'], action: 'Rotate around the model' },
  { keys: ['↑', '↓'], action: 'Tilt the view' },
  { keys: ['+', '−'], action: 'Zoom in / out' },
  { keys: ['R'], action: 'Reset the view' },
  { keys: ['Drag'], action: 'Rotate with the mouse' },
  { keys: ['Scroll'], action: 'Zoom' },
];

export const exploreBindings: KeyBinding[] = [
  { keys: ['W', '↑'], action: 'Walk forward' },
  { keys: ['S', '↓'], action: 'Walk backward' },
  { keys: ['A', 'D'], action: 'Step left / right' },
  { keys: ['←', '→'], action: 'Turn left / right' },
  { keys: ['Shift'], action: 'Move faster' },
  { keys: ['Click'], action: 'Look around with the mouse; Esc releases it' },
];

export const orbitTouch: KeyBinding[] = [
  { keys: ['Drag'], action: 'Rotate around the model' },
  { keys: ['Pinch'], action: 'Zoom' },
];

export const exploreTouch: KeyBinding[] = [
  { keys: ['Joystick'], action: 'Walk (bottom left)' },
  { keys: ['Drag'], action: 'Look around (anywhere else)' },
];

export const commonBindings: KeyBinding[] = [
  { keys: ['Tab'], action: 'Focus the 3D view, then use the keys above' },
  { keys: ['M'], action: 'Switch between Orbit and Explore' },
  { keys: ['X'], action: 'Show or hide these instructions' },
  { keys: ['Esc'], action: 'Leave the 3D view' },
];
