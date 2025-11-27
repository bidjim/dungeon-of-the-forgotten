import { ASSET_KEYS } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { Joystick } from "../types/joystick";
import {
  JOYSTICK_PROPERTIES,
  createJoystickCircleGameObjects,
} from "../config/joystickConfig";
// ... (other imports)

export class GameScene extends Phaser.Scene {
  player!: Player;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  joystick!: Joystick;

  constructor() {
    super("GameScene");
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();

    const { base, thumb } = createJoystickCircleGameObjects(this);
    const joystickConfig = {
      ...JOYSTICK_PROPERTIES,
      base: base,
      thumb: thumb,
    };
    this.joystick = (this.plugins.get("rexVirtualJoystick") as any).add(
      this,
      joystickConfig
    );
    this.joystick.setScrollFactor(0); // Make joystick fixed on screen
    this.player = new Player(
      this,
      100,
      450,
      ASSET_KEYS.KNIGHT,
      this.cursors,
      this.joystick
    );
    // this.cameras.main.startFollow(this.player); // TODO: Enable camera follow once map generation is implemented
  }

  update() {
    this.player.update();
  }
}
