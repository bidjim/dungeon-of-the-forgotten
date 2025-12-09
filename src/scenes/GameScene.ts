import { ASSET_KEYS, DEBUG_MAP } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";
import { generateWallLayers } from "../map/MapFeatureGenerator";
import { DungeonManager } from "../managers/DungeonManager";
import { FloorData, Vector2 } from "../types/map";
import { InteractionManager } from "../managers/InteractionManager"; // New import

const TILE_SIZE = 16; // In pixels

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private currentFloor: number = 1;
  private currentFloorData!: FloorData;
  private map!: Phaser.Tilemaps.Tilemap;
  private fadedTiles: Phaser.Tilemaps.Tile[] = [];
  private explorationMap: number[][] = [];
  private interactionManager!: InteractionManager; // New property

  constructor() {
    super("GameScene");
  }

  create(data?: { floor: number }) {
    if (data && data.floor) {
      this.currentFloor = data.floor;
    }

    const cursors = this.input.keyboard!.createCursorKeys();

    const joystickConfig = createJoystickConfig(this);
    const joystick = (this.plugins.get("rexVirtualJoystick") as any).add(
      this,
      joystickConfig
    );
    joystick.setScrollFactor(0);

    if (DEBUG_MAP) {
      this.map = this.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });
      // For debug map, we'll just hardcode a player spawn and no interactions for now
      this.currentFloorData = {
        id: 1,
        width: 0, // Not used for debug map
        height: 0, // Not used for debug map
        tileData: [], // Not used for debug map
        rooms: [], // Not used for debug map
        entities: [], // Not used for debug map
        items: [], // Not used for debug map
        stairs: {
          up: null,
          down: null,
        },
        explorationMap: [], // Not used for debug map
      };
    } else {
      this.currentFloorData = DungeonManager.getInstance().getFloor(
        this.currentFloor
      );

      this.map = this.make.tilemap({
        data: this.currentFloorData.tileData, // Use map data from result
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
      });
    }

    this.explorationMap = this.currentFloorData.explorationMap;

    const tileset = this.map.addTilesetImage(
      ASSET_KEYS.TILESET,
      ASSET_KEYS.DUNGEON_TILES
    );

    if (!tileset) {
      throw new Error("Failed to load dungeon tileset.");
    }

    const floorLayer = this.map.createLayer(0, tileset)!;
    floorLayer.replaceByIndex(-1, 0);
    floorLayer.setCollision(0);

    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;

    generateWallLayers(this.map, tileset, floorLayer);

    // --- Player Creation ---
    let spawnPoint: Vector2 = {
      x: 10,
      y: 10,
    }; // Useful for DEBUG_MAP

    if (this.currentFloorData.stairs.up !== null) {
      // Otherwise, spawn one tile below the stairs up location (coming from previous floor)
      spawnPoint = {
        x: this.currentFloorData.stairs.up.x,
        y: this.currentFloorData.stairs.up.y + 1,
      };
    } else if (this.currentFloorData.stairs.down !== null) {
      // If no stairs up, it means it's the first floor or starting a new game
      // Spawn one tile below the stairs down location (entry point)
      spawnPoint = {
        x: this.currentFloorData.stairs.down.x,
        y: this.currentFloorData.stairs.down.y + 1,
      };
    }

    const playerWorldX = spawnPoint.x * TILE_SIZE + TILE_SIZE / 2;
    const playerWorldY = spawnPoint.y * TILE_SIZE + TILE_SIZE / 2;

    this.player = new Player(
      this,
      playerWorldX,
      playerWorldY,
      ASSET_KEYS.KNIGHT,
      cursors,
      joystick
    );

    this.physics.add.collider(this.player, floorLayer); // Player collider after floorLayer

    // --- Interaction Objects (Stairs) ---
    this.interactionManager = new InteractionManager(
      this,
      this.player,
      this.map,
      this.currentFloorData,
      this.currentFloor,
      this.explorationMap
    );
    this.interactionManager.setupInteractions();

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
    this.handlePlayerTransparency();
  }

  private handlePlayerTransparency() {
    // Restore alpha for previously faded tiles
    this.fadedTiles.forEach((tile) => (tile.alpha = 1));
    this.fadedTiles = [];

    // Check overlaps
    const playerTileX = this.map.worldToTileX(this.player.x)!;
    const playerTileY = this.map.worldToTileY(this.player.y)!;

    // Layers that are drawn "above" the floor and might obscure the player
    // "Wall Lower" corresponds to south wall faces (depth 1)
    // "Wall Top Lower" corresponds to south wall tops (depth 2)
    const obscuringLayers = ["Wall Lower", "Wall Top Lower"];

    obscuringLayers.forEach((layerName) => {
      // Check the tile the player is on, and the one immediately above (for head overlap)
      [0, -1].forEach((yOffset) => {
        const tile = this.map.getTileAt(
          playerTileX,
          playerTileY + yOffset,
          false,
          layerName
        );

        if (tile) {
          tile.alpha = 0.6;
          this.fadedTiles.push(tile);
        }
      });
    });
  }
}
