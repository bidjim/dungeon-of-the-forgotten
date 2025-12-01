import { ASSET_KEYS } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";
import { generateWallLayers } from "../map/WallGenerator"; // Import the new function

export class GameScene extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super("GameScene");
  }

  create() {
    const cursors = this.input.keyboard!.createCursorKeys();

    const joystickConfig = createJoystickConfig(this);
    const joystick = (this.plugins.get("rexVirtualJoystick") as any).add(
      this,
      joystickConfig
    );
    joystick.setScrollFactor(0);

    const map = this.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });
    const tileset = map.addTilesetImage(
      ASSET_KEYS.TILESET,
      ASSET_KEYS.DUNGEON_TILES
    );

    if (!tileset) {
      throw new Error("Failed to load dungeon tileset.");
    }

    const floorLayer = map.createLayer("Floor", tileset, 0, 0)!;
    floorLayer.replaceByIndex(-1, 0);
    floorLayer.setCollision(0);

    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    // --- Extracted Logic Call ---
    generateWallLayers(map, tileset, floorLayer);

    // --- Player Creation ---
    const playerStartX = map.widthInPixels / 2;
    const playerStartY = map.heightInPixels / 2;

    this.player = new Player(
      this,
      playerStartX,
      playerStartY,
      ASSET_KEYS.KNIGHT,
      cursors,
      joystick
    );
    this.physics.add.collider(this.player, floorLayer);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    this.player.update();
  }
}
