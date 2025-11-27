import Phaser from "phaser";

const JOYSTICK_PROPERTIES = {
  x: 100,
  y: 500,
  radius: 50,
  dir: "8dir",
  forceMin: 16,
  fixed: true,
  enable: true,
};

// Properties for the base and thumb circles
const JOYSTICK_BASE_PROPERTIES = {
  radius: 70,
  color: 0x888888,
  alpha: 0.5,
};

const JOYSTICK_THUMB_PROPERTIES = {
  radius: 30,
  color: 0xcccccc,
  alpha: 1,
};

/**
 * Factory function to create the complete joystick configuration object,
 * including Phaser GameObjects for the base and thumb.
 * This is needed because GameObjects must be created within the context of a Phaser Scene.
 * @param scene The Phaser Scene instance.
 * @returns A complete joystick configuration object, ready to be passed to a joystick plugin.
 */
export function createJoystickConfig(scene: Phaser.Scene) {
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

  return {
    ...JOYSTICK_PROPERTIES,
    base: base,
    thumb: thumb,
  };
}
