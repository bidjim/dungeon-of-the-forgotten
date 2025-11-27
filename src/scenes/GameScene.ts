import { ASSET_KEYS } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { Joystick } from "../types/joystick";
import { createJoystickConfig } from "../config/joystickConfig";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private joystick!: Joystick;

  constructor() {
    super("GameScene");
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();

    const joystickConfig = createJoystickConfig(this);
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
