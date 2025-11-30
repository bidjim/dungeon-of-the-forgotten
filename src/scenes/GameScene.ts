import { ASSET_KEYS } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";

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
    joystick.setScrollFactor(0); // Make joystick fixed on screen

    // Create the map object
    const map = this.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });

    // First arg: The name of the tileset INSIDE Tiled (right-side panel in Tiled)
    // Second arg: The key of the image loaded in preload()
    const tileset = map.addTilesetImage(
      ASSET_KEYS.TILESET,
      ASSET_KEYS.DUNGEON_TILES
    );

    // Ensure the tileset was loaded correctly
    if (!tileset) {
      throw new Error(
        "Failed to load dungeon tileset. Check ASSET_KEYS.DUNGEON_TILES and ensure 'assets/tileset.png' exists."
      );
    }

    // Create the ground layer directly from the map data
    const floorLayer = map.createLayer("Tile Layer 1", tileset, 0, 0)!;

    floorLayer.replaceByIndex(-1, 0);

    // Set collision for tiles with index 0 (walls)
    floorLayer.setCollision(0);

    // Set world bounds to the map dimensions
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    // --- Player Creation ---
    const playerStartX = Math.floor(map.widthInPixels / 2);
    const playerStartY = Math.floor(map.heightInPixels / 2);

    this.player = new Player(
      this,
      playerStartX,
      playerStartY,
      ASSET_KEYS.KNIGHT,
      cursors,
      joystick
    );
    this.physics.add.collider(this.player, floorLayer); // Add player-map collision

    // --- Camera Setup ---
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    this.player.update();
  }
}
