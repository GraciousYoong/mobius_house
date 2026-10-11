import { useRef, useState, type PointerEvent } from 'react';
import type { StickInput } from './types';

const REACH = 44; // px the knob can travel from the centre

interface Props {
  stick: StickInput;
}

/**
 * On-screen joystick for walking on touch devices. Drag the knob; the
 * deflection drives movement like a game controller's left stick. Keyboard
 * users have W A S D instead, so it is hidden from assistive technology.
 */
export function TouchJoystick({ stick }: Props) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const update = (e: PointerEvent<HTMLDivElement>) => {
    const rect = base.current!.getBoundingClientRect();
    let x = e.clientX - (rect.left + rect.width / 2);
    let y = e.clientY - (rect.top + rect.height / 2);
    const len = Math.hypot(x, y);
    if (len > REACH) {
      x = (x / len) * REACH;
      y = (y / len) * REACH;
    }
    setKnob({ x, y });
    stick.current.x = x / REACH;
    stick.current.y = y / REACH;
  };

  const release = () => {
    setKnob({ x: 0, y: 0 });
    stick.current.x = 0;
    stick.current.y = 0;
  };

  return (
    <div
      ref={base}
      className="joystick"
      aria-hidden="true"
      onPointerDown={(e) => {
        e.stopPropagation(); // not a look-around drag
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) update(e);
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div
        className="joystick__knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
