import {
  ASSET_KEYS,
  DEBUG_MAP,
  EMPTY_TILE_INDEX,
  STAIRS_KEY,
} from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";
import { generateWallLayers } from "../map/WallGenerator"; // Import the new function
import { BSPMapGenerator } from "../map/BSPMapGenerator";

const MAP_WIDTH = 50; // In tiles
const MAP_HEIGHT = 50; // In tiles
const TILE_SIZE = 16; // In pixels

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private mapGenerator!: BSPMapGenerator; // Store mapGenerator instance

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

    let map: Phaser.Tilemaps.Tilemap;
    if (DEBUG_MAP) {
      map = this.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });
    } else {
      this.mapGenerator = new BSPMapGenerator(MAP_WIDTH, MAP_HEIGHT); // Store instance
      const mapData = this.mapGenerator.generate(); // Get raw map data
      map = this.make.tilemap({
        data: mapData,
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
      });
    }

    const tileset = map.addTilesetImage(
      ASSET_KEYS.TILESET,
      ASSET_KEYS.DUNGEON_TILES
    );

    if (!tileset) {
      throw new Error("Failed to load dungeon tileset.");
    }

    const floorLayer = map.createLayer(0, tileset)!;
    // const floorLayer = map.createLayer("Floor", tileset, 0, 0)!;
    floorLayer.replaceByIndex(-1, 0);
    floorLayer.setCollision(0);

    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;

    // --- Extracted Logic Call ---
    generateWallLayers(map, tileset, floorLayer);

    // --- Player Creation ---
    // Player starts at a random floor tile, avoiding stairs initialy
    let playerStartX: number;
    let playerStartY: number;

    const findPlayerStart = () => {
      // Find a random safe floor tile for player spawn
      let found = false;
      while (!found) {
        const rx = Phaser.Math.Between(1, MAP_WIDTH - 2);
        const ry = Phaser.Math.Between(1, MAP_HEIGHT - 2);
        const tile = floorLayer.getTileAt(rx, ry);
        if (
          tile &&
          tile.index !== EMPTY_TILE_INDEX &&
          tile.index !== STAIRS_KEY
        ) {
          playerStartX = rx * TILE_SIZE + TILE_SIZE / 2;
          playerStartY = ry * TILE_SIZE + TILE_SIZE / 2;
          found = true;
        }
      }
    };
    findPlayerStart();

    this.player = new Player(
      this,
      playerStartX!,
      playerStartY!,
      ASSET_KEYS.KNIGHT,
      cursors,
      joystick
    );
    this.physics.add.collider(this.player, floorLayer);

    // --- Stairs Interaction ---
    if (this.mapGenerator.stairsLocation) {
      const stairsWorldX =
        this.mapGenerator.stairsLocation.x * TILE_SIZE + TILE_SIZE / 2;
      const stairsWorldY =
        this.mapGenerator.stairsLocation.y * TILE_SIZE + TILE_SIZE / 2;

      const stairs = this.physics.add.sprite(
        stairsWorldX,
        stairsWorldY,
        "transparent"
      ); // Use an invisible sprite
      stairs.setBodySize(TILE_SIZE, TILE_SIZE); // Make its body match the tile size
      stairs.setImmovable(true);
      stairs.setVisible(false); // Make it invisible

      this.physics.add.overlap(
        this.player,
        stairs,
        this.onStairsOverlap,
        undefined,
        this
      );
    }

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  }

  update() {
    this.player.update();
  }

  private onStairsOverlap(player: Player, stairs: Phaser.GameObjects.Sprite) {
    console.log("Player hit stairs! Restarting scene...");
    this.scene.restart();
  }
}
