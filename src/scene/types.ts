import type { MutableRefObject } from 'react';

/** Keys currently held while the viewer has focus, by `KeyboardEvent.code`. */
export type HeldKeys = MutableRefObject<Set<string>>;

/** Pointer-drag movement accumulated since the last frame, in CSS pixels. */
export type DragDelta = MutableRefObject<{ x: number; y: number }>;

/** On-screen joystick deflection, each axis −1..1 (y negative = forward). */
export type StickInput = MutableRefObject<{ x: number; y: number }>;
