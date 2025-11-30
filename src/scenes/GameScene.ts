import {
  ASSET_KEYS,
  FLOOR_KEYS,
  SIDE_WALL_KEYS,
  WALL_KEYS,
  WALL_TOP_KEYS,
} from "../constants";
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
    const floorLayer = map.createLayer("Floor", tileset, 0, 0)!;
    floorLayer.replaceByIndex(-1, 0);

    // Set collision for tiles with index 0 (walls)
    floorLayer.setCollision(0);

    // Set world bounds to the map dimensions
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    const wallUpperLayer = map.createBlankLayer("Wall Upper", tileset, 0, 0)!;
    const wallTopUpperLayer = map.createBlankLayer(
      "Wall Top Upper",
      tileset,
      0,
      0
    )!;
    const wallLowerLayer = map.createBlankLayer("Wall Lower", tileset, 0, 0)!;
    const wallTopLowerLayer = map.createBlankLayer(
      "Wall Top Lower",
      tileset,
      0,
      0
    )!;
    wallLowerLayer.setDepth(1);
    wallTopLowerLayer.setDepth(1);
    floorLayer.forEachTile((tile) => {
      if (tile.index === FLOOR_KEYS) {
        // Floor north is wall
        if (floorLayer.getTileAt(tile.x, tile.y - 1).index === 0) {
          wallUpperLayer.putTileAt(WALL_KEYS.WE, tile.x, tile.y - 1);
          if (
            floorLayer.getTileAt(tile.x + 1, tile.y - 1).index === FLOOR_KEYS
          ) {
            wallTopUpperLayer.putTileAt(
              WALL_TOP_KEYS.BOTTOM_RIGHT_LONG,
              tile.x,
              tile.y - 2
            );
          } else {
            wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.WE, tile.x, tile.y - 2);
          }

          // Floor west is wall
          if (floorLayer.getTileAt(tile.x - 1, tile.y).index === 0) {
            if (
              floorLayer.getTileAt(tile.x - 1, tile.y + 1).index !== FLOOR_KEYS
            ) {
              wallUpperLayer.putTileAt(
                SIDE_WALL_KEYS.RIGHT,
                tile.x - 1,
                tile.y - 1
              );
            }
            wallUpperLayer.putTileAt(
              WALL_TOP_KEYS.BOTTOM_RIGHT_DOT,
              tile.x - 1,
              tile.y - 2
            );
          }

          // Floor east is wall
          if (floorLayer.getTileAt(tile.x + 1, tile.y).index === 0) {
            if (
              floorLayer.getTileAt(tile.x + 1, tile.y + 1).index !== FLOOR_KEYS
            ) {
              wallUpperLayer.putTileAt(
                SIDE_WALL_KEYS.LEFT,
                tile.x + 1,
                tile.y - 1
              );
            }
            wallUpperLayer.putTileAt(
              WALL_TOP_KEYS.BOTTOM_LEFT_DOT,
              tile.x + 1,
              tile.y - 2
            );
          }
        }

        // Floor south is wall
        if (floorLayer.getTileAt(tile.x, tile.y + 1).index === 0) {
          wallLowerLayer.putTileAt(WALL_KEYS.WE, tile.x, tile.y);
          if (
            floorLayer.getTileAt(tile.x - 1, tile.y - 1).index === FLOOR_KEYS &&
            floorLayer.getTileAt(tile.x - 1, tile.y).index != FLOOR_KEYS
          ) {
            wallTopLowerLayer.putTileAt(
              WALL_TOP_KEYS.BOTTOM_LEFT_LONG,
              tile.x,
              tile.y - 1
            );
            wallTopLowerLayer.putTileAt(
              WALL_TOP_KEYS.BOTTOM_LEFT_DOT,
              tile.x,
              tile.y - 2
            );
          } else {
            wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.E, tile.x, tile.y - 1);
          }
        }
      }
    });

    // --- Player Creation ---
    const playerStartX = map.tileWidth * 2;
    const playerStartY = map.tileHeight * 8;

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
