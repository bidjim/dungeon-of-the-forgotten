import Phaser from "phaser";
import { Player } from "../Player";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private joystick!: any; // RexUI virtual joystick

  constructor() {
    super("GameScene");
  }

  preload() {
    // Assets are loaded in BootScene
  }

  create() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.joystick = (this.plugins.get("rexVirtualJoystick") as any).add(this, {
      x: 100,
      y: 500,
      radius: 50,
      base: this.add.circle(0, 0, 70, 0x888888, 0.5),
      thumb: this.add.circle(0, 0, 30, 0xcccccc, 1),
      dir: "8dir",
      forceMin: 16,
      fixed: true,
      enable: true,
    });
    this.joystick.setScrollFactor(0); // Make joystick fixed on screen
    this.player = new Player(
      this,
      100,
      450,
      "knight",
      this.cursors,
      this.joystick
    );
    // this.cameras.main.startFollow(this.player); // Pending until map generation
  }

  update() {
    this.player.update();
  }
}
