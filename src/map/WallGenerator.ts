import Phaser from "phaser";
import {
  FLOOR_KEYS,
  SIDE_WALL_KEYS,
  WALL_KEYS,
  WALL_TOP_KEYS,
} from "../constants";

export const generateWallLayers = (
  map: Phaser.Tilemaps.Tilemap,
  tileset: Phaser.Tilemaps.Tileset,
  floorLayer: Phaser.Tilemaps.TilemapLayer
) => {
  // Create blank layers
  const wallSideLayer = map.createBlankLayer("Wall Side", tileset, 0, 0)!;
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

  // Set depths
  wallLowerLayer.setDepth(1);
  wallTopLowerLayer.setDepth(1);

  // Helper to safely get tile index
  const getIndex = (x: number, y: number): number | null => {
    const t = floorLayer.getTileAt(x, y);
    return t ? t.index : null;
  };

  floorLayer.forEachTile((tile) => {
    // We only care about processing around floor tiles to build walls around them
    if (tile.index !== FLOOR_KEYS) return;

    const x = tile.x;
    const y = tile.y;

    // --- Side Walls (Left/Right) ---
    if (getIndex(x - 1, y) === 0 && getIndex(x, y + 1) === FLOOR_KEYS) {
      wallSideLayer.putTileAt(SIDE_WALL_KEYS.RIGHT, x - 1, y);
    }
    if (getIndex(x + 1, y) === 0 && getIndex(x, y + 1) === FLOOR_KEYS) {
      wallSideLayer.putTileAt(SIDE_WALL_KEYS.LEFT, x + 1, y);
    }

    // --- North Walls ---
    // If the tile above is a wall (0)
    if (getIndex(x, y - 1) === 0) {
      // Base Wall
      wallUpperLayer.putTileAt(WALL_KEYS.WE, x, y - 1);

      // Wall Top Decor
      if (getIndex(x + 1, y - 1) === FLOOR_KEYS) {
        wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_RIGHT_LONG, x, y - 2);
      } else if (getIndex(x - 1, y - 1) === FLOOR_KEYS) {
        wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_LEFT_LONG, x, y - 2);
      } else {
        wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.WE, x, y - 2);
      }

      // North-West Corner Logic
      if (getIndex(x - 1, y) === 0) {
        if (getIndex(x - 1, y + 1) !== FLOOR_KEYS) {
          wallUpperLayer.putTileAt(SIDE_WALL_KEYS.RIGHT, x - 1, y - 1);
        }
        wallUpperLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_RIGHT_DOT, x - 1, y - 2);
      }

      // North-East Corner Logic
      if (getIndex(x + 1, y) === 0) {
        if (getIndex(x + 1, y + 1) !== FLOOR_KEYS) {
          wallUpperLayer.putTileAt(SIDE_WALL_KEYS.LEFT, x + 1, y - 1);
        }
        wallUpperLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_LEFT_DOT, x + 1, y - 2);
      }
    }

    // --- South Walls ---
    // If the tile below is a wall (0)
    if (getIndex(x, y + 1) === 0) {
      // Base Wall
      wallLowerLayer.putTileAt(WALL_KEYS.WE, x, y);

      // Complex Corner Logic for South
      if (
        getIndex(x + 1, y + 1) === FLOOR_KEYS &&
        getIndex(x, y + 1) !== FLOOR_KEYS
      ) {
        wallTopLowerLayer.putTileAt(
          WALL_TOP_KEYS.BOTTOM_RIGHT_HOLLOW,
          x,
          y - 1
        );
        wallTopLowerLayer.putTileAt(SIDE_WALL_KEYS.RIGHT, x, y);
      } else if (
        getIndex(x - 1, y - 1) === FLOOR_KEYS &&
        getIndex(x - 1, y) !== FLOOR_KEYS
      ) {
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM, x, y - 1);
        wallTopLowerLayer.putTileAt(SIDE_WALL_KEYS.RIGHT_HOLLOW, x - 1, y - 1);
      } else if (
        getIndex(x - 1, y + 1) === FLOOR_KEYS &&
        getIndex(x, y + 1) !== FLOOR_KEYS
      ) {
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_LEFT_HOLLOW, x, y - 1);
        wallTopLowerLayer.putTileAt(SIDE_WALL_KEYS.LEFT, x, y);
      } else {
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.E, x, y - 1);
      }

      // South-East Edge
      if (getIndex(x + 1, y) !== FLOOR_KEYS) {
        wallLowerLayer.putTileAt(SIDE_WALL_KEYS.BOTTOM_RIGHT, x + 1, y);
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM, x, y - 1);
        wallSideLayer.putTileAt(SIDE_WALL_KEYS.LEFT_HOLLOW, x + 1, y - 1);
      }

      // South-West Edge
      if (getIndex(x - 1, y) !== FLOOR_KEYS) {
        wallLowerLayer.putTileAt(SIDE_WALL_KEYS.BOTTOM_LEFT, x - 1, y);
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM, x, y - 1);
        wallSideLayer.putTileAt(SIDE_WALL_KEYS.RIGHT_HOLLOW, x - 1, y - 1);
      }
    }
  });

  return {
    wallSideLayer,
    wallUpperLayer,
    wallTopUpperLayer,
    wallLowerLayer,
    wallTopLowerLayer,
  };
};
