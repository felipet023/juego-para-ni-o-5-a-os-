export const inputState = {
  keys: { up: false, down: false, left: false, right: false },
  joystick: { x: 0, z: 0 },
};

export function resetInput(): void {
  inputState.keys.up = false;
  inputState.keys.down = false;
  inputState.keys.left = false;
  inputState.keys.right = false;
  inputState.joystick.x = 0;
  inputState.joystick.z = 0;
}
