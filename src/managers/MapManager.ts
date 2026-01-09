import Phaser from "phaser";
import { ASSET_KEYS, DEBUG_MAP } from "../constants";
import { generateFeatureLayers } from "../map/MapFeatureGenerator";
import { FloorData } from "../types/map";

const TILE_SIZE = 16;

export class MapManager {
  private scene: Phaser.Scene;
  private map!: Phaser.Tilemaps.Tilemap;
  private floorLayer!: Phaser.Tilemaps.TilemapLayer;
  private fadedTiles: Phaser.Tilemaps.Tile[] = [];
  private obscuringLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private fovLayer!: Phaser.Tilemaps.TilemapLayer;
  private explorationMap: number[][] = [];
  private visionRadius: number = 8;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(floorData: FloorData): Phaser.Tilemaps.Tilemap {
    if (DEBUG_MAP) {
      this.map = this.scene.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });
    } else {
      this.map = this.scene.make.tilemap({
        data: floorData.tileData,
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
      });
    }

    const tileset = this.map.addTilesetImage(
      ASSET_KEYS.TILESET,
      ASSET_KEYS.DUNGEON_TILES
    );

    if (!tileset) throw new Error("Failed to load dungeon tileset.");

    this.floorLayer = this.map.createLayer(0, tileset)!;
    this.floorLayer.replaceByIndex(-1, 0);
    this.floorLayer.setCollision(0);

    generateFeatureLayers(this.map, tileset, this.floorLayer);

    const layerNames = ["Wall Lower", "Wall Top Lower"];
    this.obscuringLayers = layerNames
      .map((name) => this.map.getLayer(name)?.tilemapLayer)
      .filter((l): l is Phaser.Tilemaps.TilemapLayer => l !== null);

    this.explorationMap = floorData.explorationMap;
    this.createFogTexture();

    // Create an empty map for the fog tiles
    const fogMap = this.scene.make.tilemap({
      data: Array(this.map.height)
        .fill(0)
        .map(() => Array(this.map.width).fill(0)),
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const fogTileset = fogMap.addTilesetImage(
      "fog-tiles",
      "fog-tiles",
      TILE_SIZE,
      TILE_SIZE,
      0,
      0
    );
    this.fovLayer = fogMap.createLayer(0, fogTileset!)!;
    this.fovLayer.setDepth(100); // Ensure it is above players/enemies

    // Set initial visual state based on saved explorationMap
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.explorationMap[y][x] === 1) {
          this.fovLayer.putTileAt(1, x, y); // Explored
        } else {
          this.fovLayer.putTileAt(0, x, y); // Unseen
        }
      }
    }

    return this.map;
  }

  getFloorLayer(): Phaser.Tilemaps.TilemapLayer {
    return this.floorLayer;
  }

  updateTransparency(player: Phaser.GameObjects.Sprite) {
    this.fadedTiles.forEach((tile) => (tile.alpha = 1));
    this.fadedTiles = [];

    const playerTileX = this.map.worldToTileX(player.x)!;
    const playerTileY = this.map.worldToTileY(player.y)!;

    for (const layer of this.obscuringLayers) {
      for (let yOffset = 0; yOffset >= -1; yOffset--) {
        const tile = layer.getTileAt(playerTileX, playerTileY + yOffset);
        if (tile) {
          tile.alpha = 0.6;
          this.fadedTiles.push(tile);
        }
      }
    }
  }

  private createFogTexture() {
    const size = TILE_SIZE;
    const graphics = this.scene.make.graphics(
      {
        x: 0,
        y: 0,
      },
      false
    );

    // Index 0: Black (Unseen)
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, size, size);

    // Index 1: Dim (Explored)
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRect(size, 0, size, size);

    // Generate the texture
    graphics.generateTexture("fog-tiles", size * 2, size);
    graphics.destroy();
  }
}
