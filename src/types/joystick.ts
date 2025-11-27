export interface Joystick {
  force: number;
  angle: number;
  setScrollFactor(factor: number): void;
  // Add other properties if they are used and need to be typed
}
