import Phaser from "phaser";
import { ASSET_KEYS, ASSET_PATHS } from "../constants";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image(ASSET_KEYS.DUNGEON_TILES, ASSET_PATHS.DUNGEON_TILES);
    this.load.tilemapTiledJSON(
      ASSET_KEYS.DUNGEON_TILES,
      ASSET_PATHS.DUNGEON_JSON
    );
    this.load.spritesheet(ASSET_KEYS.KNIGHT, ASSET_PATHS.KNIGHT, {
      frameWidth: 16,
      frameHeight: 24,
    });
  }

  create() {
    // Create animations for the knight
    this.anims.create({
      key: "knight_idle",
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.KNIGHT, {
        start: 0,
        end: 3,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.anims.create({
      key: "knight_run",
      frames: this.anims.generateFrameNumbers(ASSET_KEYS.KNIGHT, {
        start: 11,
        end: 14,
      }),
      frameRate: 8,
      repeat: -1,
    });

    this.scene.start("GameScene");
  }
}
