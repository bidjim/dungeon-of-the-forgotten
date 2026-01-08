import { ASSET_KEYS, DEBUG_MAP } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";
import { generateFeatureLayers } from "../map/MapFeatureGenerator";
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

    generateFeatureLayers(this.map, tileset, floorLayer);

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

  private isWalkable(x: number, y: number): boolean {
    const data = this.currentFloorData;
    // Check vertical bounds
    if (y < 0 || y >= data.tileData.length) {
      return false;
    }
    // Check horizontal bounds
    if (x < 0 || x >= data.tileData[y].length) {
      return false;
    }
    // Return true if tile is NOT a wall (0 is EMPTY_TILE_INDEX)
    return data.tileData[y][x] !== 0;
  }

  private getRoomCenter(roomIndex: number): Vector2 {
    const room = this.currentFloorData.rooms[roomIndex];
    if (!room) {
      return { x: 10, y: 10 }; // Absolute fallback if no rooms exist
    }
    return {
      x: Math.floor(room.x + room.w / 2),
      y: Math.floor(room.y + room.h / 2),
    };
  }

  private determinePlayerSpawnPoint(): Vector2 {
    const data = this.currentFloorData;
    let rawPoint: Vector2 | null = null;

    // 1. Calculate the intended point based on transition type
    if (this.currentFloor === 1 && data.gate && this.cameFrom === "gate") {
      rawPoint = { x: data.gate.x, y: data.gate.y + 2 };
    } else if (this.cameFrom === "down" && data.stairs.up) {
      rawPoint = { x: data.stairs.up.x + 1, y: data.stairs.up.y };
    } else if (this.cameFrom === "up" && data.stairs.down) {
      rawPoint = { x: data.stairs.down.x - 1, y: data.stairs.down.y };
    }

    // 2. If a specific transition point was found, verify it is walkable and in-bounds
    if (rawPoint && this.isWalkable(rawPoint.x, rawPoint.y)) {
      return rawPoint;
    }

    // 3. Fallback logic: If the intended point is a wall or no rule matched
    console.warn(
      "Intended spawn point invalid or blocked. Falling back to room center."
    );

    // Check if stairs.up exists as a primary fallback
    if (
      data.stairs.up &&
      this.isWalkable(data.stairs.up.x, data.stairs.up.y + 1)
    ) {
      return { x: data.stairs.up.x, y: data.stairs.up.y + 1 };
    }

    // Final fallback: Center of the first room
    return this.getRoomCenter(0);
  }
}
