import Phaser from "phaser";

export const JOYSTICK_PROPERTIES = {
  x: 100,
  y: 500,
  radius: 50,
  dir: "8dir",
  forceMin: 16,
  fixed: true,
  enable: true,
};

// Properties for the base and thumb circles
export const JOYSTICK_BASE_PROPERTIES = {
  radius: 70,
  color: 0x888888,
  alpha: 0.5,
};

export const JOYSTICK_THUMB_PROPERTIES = {
  radius: 30,
  color: 0xcccccc,
  alpha: 1,
};

/**
 * Factory function to create Phaser GameObjects for the joystick.
 * This is needed because GameObjects must be created within the context of a Phaser Scene.
 * @param scene The Phaser Scene instance.
 * @returns An object containing the base and thumb Phaser.GameObjects.Circle instances.
 */
export function createJoystickCircleGameObjects(scene: Phaser.Scene) {
  const base = scene.add.circle(
    0,
    0,
    JOYSTICK_BASE_PROPERTIES.radius,
    JOYSTICK_BASE_PROPERTIES.color,
    JOYSTICK_BASE_PROPERTIES.alpha
  );
  const thumb = scene.add.circle(
    0,
    0,
    JOYSTICK_THUMB_PROPERTIES.radius,
    JOYSTICK_THUMB_PROPERTIES.color,
    JOYSTICK_THUMB_PROPERTIES.alpha
  );
  return { base, thumb };
}
