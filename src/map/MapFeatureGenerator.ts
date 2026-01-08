import Phaser from "phaser";
import { WALL_GENERATING_TILES } from "../constants";
import { createLayers } from "./layers/createLayers";
import { placeGateTiles } from "./features/gates";
import { handleStairsTile } from "./features/stairs";
import { Context, NeighborIndexes } from "./features/Context";
import { generateWalls } from "./features/walls/generateWalls";

/**
 * Entry point for generating all wall + stair features
 * based on a floor layer.
 */
export const generateFeatureLayers = (
  map: Phaser.Tilemaps.Tilemap,
  tileset: Phaser.Tilemaps.Tileset,
  floorLayer: Phaser.Tilemaps.TilemapLayer
) => {
  // ---------------------------------------------------------------------------
  // Layer setup
  // ---------------------------------------------------------------------------
  const layers = createLayers(map, tileset);

  // ---------------------------------------------------------------------------
  // Neighbor access
  // ---------------------------------------------------------------------------
  const grid = floorLayer.layer.data;
  const width = floorLayer.layer.width;
  const height = floorLayer.layer.height;

  const getIndex = (x: number, y: number): number | null => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return grid[y][x].index;
  };

  // ---------------------------------------------------------------------------
  // Tile iteration
  // ---------------------------------------------------------------------------
  floorLayer.forEachTile((tile) => {
    const x = tile.x;
    const y = tile.y;

    const neighbors: NeighborIndexes = {
      north: getIndex(x, y - 1),
      northEast: getIndex(x + 1, y - 1),
      east: getIndex(x + 1, y),
      southEast: getIndex(x + 1, y + 1),
      south: getIndex(x, y + 1),
      southWest: getIndex(x - 1, y + 1),
      west: getIndex(x - 1, y),
      northWest: getIndex(x - 1, y - 1),
    };

    // -------------------------------------------------------------------------
    // Gates (can override normal wall placement)
    // -------------------------------------------------------------------------
    placeGateTiles(tile, x, y, layers.gateLayer);

    // -------------------------------------------------------------------------
    // Stairs (blend tile into surrounding environment)
    // -------------------------------------------------------------------------
    handleStairsTile(
      tile,
      [
        neighbors.north,
        neighbors.northEast,
        neighbors.east,
        neighbors.southEast,
        neighbors.south,
        neighbors.southWest,
        neighbors.west,
        neighbors.northWest,
      ],
      layers.stairsLayer
    );

    // -------------------------------------------------------------------------
    // Walls only generate from floor tiles (not stairs!)
    // -------------------------------------------------------------------------
    if (!WALL_GENERATING_TILES.has(tile.index)) return;

    const ctx: Context = {
      tile,
      neighbors,
      layers,
    };

    // Single unified wall generator
    generateWalls(ctx);
  });
};
