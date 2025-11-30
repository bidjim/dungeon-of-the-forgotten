import { ASSET_KEYS } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { Joystick } from "../types/joystick";
import { createJoystickConfig } from "../config/joystickConfig";

// Define map dimensions
const MAP_WIDTH = 50; // In tiles
const MAP_HEIGHT = 50; // In tiles
const TILE_SIZE = 16; // In pixels

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private joystick!: Joystick;
  private map!: Phaser.Tilemaps.Tilemap;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

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

    // Create the map object
    this.map = this.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });

    // First arg: The name of the tileset INSIDE Tiled (right-side panel in Tiled)
    // Second arg: The key of the image loaded in preload()
    const tileset = this.map.addTilesetImage(
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
    this.groundLayer = this.map.createLayer("Tile Layer 1", tileset, 0, 0)!;
    this.groundLayer.replaceByIndex(-1, 0);

    // Set collision for tiles with index 0 (walls)
    this.groundLayer.setCollision(0);

    // Scale the layer if needed (e.g., for pixel art games)
    this.groundLayer.setScale(1);

    // Set world bounds to the map dimensions
    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;

    // --- Player Creation ---
    // Place the player in the center of the map initially
    const playerStartX = 0;
    const playerStartY = 0;

    this.player = new Player(
      this,
      playerStartX,
      playerStartY,
      ASSET_KEYS.KNIGHT,
      this.cursors,
      this.joystick
    );
    this.physics.add.collider(this.player, this.groundLayer); // Add player-map collision

    // --- Camera Setup ---
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
  }

  update() {
    this.player.update();
  }
}
