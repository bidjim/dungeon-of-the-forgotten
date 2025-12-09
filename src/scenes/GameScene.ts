import { ASSET_KEYS, DEBUG_MAP } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";
import { generateWallLayers } from "../map/MapFeatureGenerator";
import { FloorData, Vector2 } from "../types/map";
import { InteractionManager } from "../managers/InteractionManager"; // New import
import VirtualJoyStickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

const TILE_SIZE = 16; // In pixels

interface GameSceneData {
  floorData: FloorData;
  cameFrom?: "up" | "down";
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private currentFloor: number = 1;
  private currentFloorData!: FloorData;
  private map!: Phaser.Tilemaps.Tilemap;
  private fadedTiles: Phaser.Tilemaps.Tile[] = [];
  private explorationMap: number[][] = [];
  private interactionManager!: InteractionManager;
  private cameFrom: "up" | "down" | "gate" = "gate";

  constructor() {
    super("GameScene");
  }

  create(data?: GameSceneData) {
    if (data) {
      if (data.floorData) {
        this.currentFloorData = data.floorData;
        this.currentFloor = this.currentFloorData.id;
      }
      if (data.cameFrom) {
        this.cameFrom = data.cameFrom;
      }
    }

    const cursors = this.input.keyboard!.createCursorKeys();

    const joystickConfig = createJoystickConfig(this);
    const joystick = (
      this.plugins.get("rexVirtualJoystick") as VirtualJoyStickPlugin
    ).add(this, joystickConfig);
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
        gate: null,
        explorationMap: [], // Not used for debug map
      };
    } else {
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
    let spawnPoint: Vector2;

    if (DEBUG_MAP) {
      spawnPoint = { x: 10, y: 10 };
    } else {
      spawnPoint = this.determinePlayerSpawnPoint();
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
    this.player?.update();
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

  private determinePlayerSpawnPoint(): Vector2 {
    // Rule 1: For the first floor, player spawns two tiles south from the entrance gate.
    // This applies when starting the game or returning to floor 1 without specific 'cameFrom' context.
    if (
      this.currentFloor === 1 &&
      this.currentFloorData.gate !== null &&
      this.cameFrom === "gate"
    ) {
      return {
        x: this.currentFloorData.gate.x,
        y: this.currentFloorData.gate.y + 2,
      };
    }

    // Rule 2: When going downstairs, player will spawn one tile east stair up at the next floor.
    // This means the player arrived on THIS floor via 'stairs.up'.
    if (this.cameFrom === "down" && this.currentFloorData.stairs.up !== null) {
      return {
        x: this.currentFloorData.stairs.up.x + 1,
        y: this.currentFloorData.stairs.up.y,
      };
    }

    // Rule 3: When going upstairs, player will spawn one tile west stair down at the previous floor.
    // This means the player arrived on THIS floor via 'stairs.down'.
    if (this.cameFrom === "up" && this.currentFloorData.stairs.down !== null) {
      return {
        x: this.currentFloorData.stairs.down.x - 1,
        y: this.currentFloorData.stairs.down.y,
      };
    }

    // Fallback: If no specific rule applies, use existing fallback or a sensible default.
    // This might happen if 'cameFrom' is undefined on a non-first floor, which implies a bug elsewhere.
    console.warn(
      "Could not determine a specific spawn point, falling back to stairs.up or stairs.down + 1Y."
    );
    if (this.currentFloorData.stairs.up !== null) {
      // Old logic: spawn one tile below stairs up
      return {
        x: this.currentFloorData.stairs.up.x,
        y: this.currentFloorData.stairs.up.y + 1,
      };
    } else if (this.currentFloorData.stairs.down !== null) {
      // Old logic: spawn one tile below stairs down (for entrance)
      return {
        x: this.currentFloorData.stairs.down.x,
        y: this.currentFloorData.stairs.down.y + 1,
      };
    }

    return { x: 10, y: 10 }; // Ultimate fallback for debug or very unexpected scenarios
  }
}
