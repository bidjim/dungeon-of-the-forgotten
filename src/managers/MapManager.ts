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
}
