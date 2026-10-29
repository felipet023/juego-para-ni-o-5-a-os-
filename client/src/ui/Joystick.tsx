import { useRef } from 'react';
import { inputState } from '../world/input';

/**
 * Joystick táctil para caminar por la isla.
 * Escribe en `inputState`, que el mundo 3D lee en cada frame.
 * Los usuarios de teclado pueden usar las flechas del teclado.
 */
export function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);

  function update(clientX: number, clientY: number) {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const max = rect.width / 2;
    const length = Math.hypot(dx, dy);
    const clamped = Math.min(length, max);
    const nx = length > 0 ? dx / length : 0;
    const ny = length > 0 ? dy / length : 0;

    inputState.joystick.x = (nx * clamped) / max;
    inputState.joystick.z = (ny * clamped) / max;

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${nx * clamped}px, ${ny * clamped}px)`;
    }
  }

  function stop() {
    active.current = false;
    inputState.joystick.x = 0;
    inputState.joystick.z = 0;
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)';
  }

  return (
    <div
      ref={baseRef}
      className="joystick"
      aria-hidden="true"
      onPointerDown={(event) => {
        active.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        update(event.clientX, event.clientY);
      }}
      onPointerMove={(event) => {
        if (active.current) update(event.clientX, event.clientY);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
    >
      <div ref={knobRef} className="joystick__knob" />
    </div>
  );
}
