import { ASSET_KEYS, DEBUG_MAP } from "../constants";
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
      const mapGenerator = new BSPMapGenerator(MAP_WIDTH, MAP_HEIGHT); // Updated constructor call
      const mapData = mapGenerator.generate(); // Get raw map data
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
