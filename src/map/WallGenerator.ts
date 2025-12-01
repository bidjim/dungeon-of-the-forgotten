import Phaser from "phaser";
import {
  FLOOR_KEYS,
  SIDE_WALL_KEYS,
  WALL_KEYS,
  WALL_TOP_KEYS,
  EMPTY_TILE_INDEX,
} from "../constants";

export const generateWallLayers = (
  map: Phaser.Tilemaps.Tilemap,
  tileset: Phaser.Tilemaps.Tileset,
  floorLayer: Phaser.Tilemaps.TilemapLayer
) => {
  // Create blank layers
  const wallSideLeftLayer = map.createBlankLayer(
    "Wall Side Left",
    tileset,
    0,
    0
  )!;
  const wallSideRightLayer = map.createBlankLayer(
    "Wall Side Right",
    tileset,
    0,
    0
  )!;
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

  // Set depths (Optimization: batch these if possible, but depth setting is cheap)
  wallSideLeftLayer.setDepth(0);
  wallSideRightLayer.setDepth(0);
  wallUpperLayer.setDepth(0);
  wallTopUpperLayer.setDepth(2);
  wallLowerLayer.setDepth(1);
  wallTopLowerLayer.setDepth(2);

  // Access raw data array directly.
  const grid = floorLayer.layer.data;
  const mapWidth = floorLayer.layer.width;
  const mapHeight = floorLayer.layer.height;

  // Helper: Fast bounds check and index retrieval
  const getIndex = (x: number, y: number): number | null => {
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return null;
    return grid[y][x].index;
  };

  // Helper: Logic checks
  const isFloor = (x: number, y: number) => {
    const idx = getIndex(x, y);
    return idx !== null && FLOOR_KEYS.has(idx);
  };

  const isWallOrEmpty = (x: number, y: number) => {
    const idx = getIndex(x, y);
    return idx === EMPTY_TILE_INDEX || idx === null; // Treat bounds as walls?
  };

  floorLayer.forEachTile((tile) => {
    // Skip if current tile is not a floor (we iterate floors to find where walls go)
    if (!FLOOR_KEYS.has(tile.index)) return;

    const x = tile.x;
    const y = tile.y;

    // --- Pre-calculate Neighbors ---
    const n_Left = getIndex(x - 1, y);
    const n_Right = getIndex(x + 1, y);
    const n_Up = getIndex(x, y - 1);
    const n_Down = getIndex(x, y + 1);
    const n_UpLeft = getIndex(x - 1, y - 1);
    const n_UpRight = getIndex(x + 1, y - 1);
    const n_DownLeft = getIndex(x - 1, y + 1);
    const n_DownRight = getIndex(x + 1, y + 1);

    // Derived Booleans for readability
    const isLeftEmpty = n_Left === EMPTY_TILE_INDEX;
    const isRightEmpty = n_Right === EMPTY_TILE_INDEX;
    const isUpEmpty = n_Up === EMPTY_TILE_INDEX;
    const isDownEmpty = n_Down === EMPTY_TILE_INDEX;

    // Check floor existence in corners/sides
    const isDownFloor = n_Down !== null && FLOOR_KEYS.has(n_Down);
    const isUpRightFloor = n_UpRight !== null && FLOOR_KEYS.has(n_UpRight);
    const isUpLeftFloor = n_UpLeft !== null && FLOOR_KEYS.has(n_UpLeft);
    const isDownRightFloor =
      n_DownRight !== null && FLOOR_KEYS.has(n_DownRight);
    const isDownLeftFloor = n_DownLeft !== null && FLOOR_KEYS.has(n_DownLeft);
    const isUpLeftEmpty = n_UpLeft === EMPTY_TILE_INDEX; // Needed for NW corner logic checks

    // --- Side Walls (Left/Right) ---
    if (isLeftEmpty && isDownFloor) {
      wallSideLeftLayer.putTileAt(SIDE_WALL_KEYS.RIGHT, x - 1, y);
    }
    if (isRightEmpty && isDownFloor) {
      wallSideRightLayer.putTileAt(SIDE_WALL_KEYS.LEFT, x + 1, y);
    }

    // --- North Walls ---
    if (isUpEmpty) {
      // Base Wall
      wallUpperLayer.putTileAt(WALL_KEYS.WE, x, y - 1);

      // Wall Top Decor
      if (isUpRightFloor && isUpLeftFloor) {
        wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.LEFT_BOTTOM_RIGHT, x, y - 2);
      } else if (isUpRightFloor) {
        wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_RIGHT_LONG, x, y - 2);
      } else if (isUpLeftFloor) {
        wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_LEFT_LONG, x, y - 2);
      } else {
        wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.WE, x, y - 2);
      }

      // North-West Corner Logic
      // Checks: Left is wall AND Left-Down is wall
      if (isLeftEmpty) {
        // Checks if the South-West neighbor (x-1, y+1) is an empty tile.
        const isSouthWestEmpty = getIndex(x - 1, y + 1) === EMPTY_TILE_INDEX;

        if (isSouthWestEmpty) {
          wallSideLeftLayer.putTileAt(SIDE_WALL_KEYS.RIGHT, x - 1, y - 1);
        }
        wallTopUpperLayer.putTileAt(
          WALL_TOP_KEYS.BOTTOM_RIGHT_DOT,
          x - 1,
          y - 2
        );
      }

      // North-East Corner Logic
      if (isRightEmpty) {
        const isSouthEastEmpty = getIndex(x + 1, y + 1) === EMPTY_TILE_INDEX;
        if (isSouthEastEmpty) {
          wallSideRightLayer.putTileAt(SIDE_WALL_KEYS.LEFT, x + 1, y - 1);
        }
        wallTopUpperLayer.putTileAt(
          WALL_TOP_KEYS.BOTTOM_LEFT_DOT,
          x + 1,
          y - 2
        );
      }
    }

    // --- South Walls ---
    if (isDownEmpty) {
      // Base Wall
      wallLowerLayer.putTileAt(WALL_KEYS.WE, x, y);

      // Complex Corner Logic for South
      if (isDownRightFloor && isDownLeftFloor) {
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.LEFT_TOP_RIGHT, x, y);
      } else if (isDownRightFloor) {
        wallTopLowerLayer.putTileAt(
          WALL_TOP_KEYS.BOTTOM_RIGHT_HOLLOW,
          x,
          y - 1
        );
        wallTopLowerLayer.putTileAt(SIDE_WALL_KEYS.RIGHT, x, y);
      } else if (isUpLeftFloor && isLeftEmpty) {
        // Original: getIndex(x - 1, y - 1) === FLOOR_KEYS && getIndex(x - 1, y) === 0
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM, x, y - 1);
        wallTopLowerLayer.putTileAt(SIDE_WALL_KEYS.RIGHT_HOLLOW, x - 1, y - 1);
      } else if (isDownLeftFloor) {
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM_LEFT_HOLLOW, x, y - 1);
        wallTopLowerLayer.putTileAt(SIDE_WALL_KEYS.LEFT, x, y);
      } else {
        wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.WE, x, y - 1);
      }

      // South-East Edge
      if (isRightEmpty) {
        wallLowerLayer.putTileAt(SIDE_WALL_KEYS.BOTTOM_RIGHT, x + 1, y);
        wallSideRightLayer.putTileAt(SIDE_WALL_KEYS.LEFT_HOLLOW, x + 1, y - 1);
        if (!isDownLeftFloor) {
          wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM, x, y - 1);
        }
      }

      // South-West Edge
      if (isLeftEmpty) {
        wallLowerLayer.putTileAt(SIDE_WALL_KEYS.BOTTOM_LEFT, x - 1, y);
        wallSideLeftLayer.putTileAt(SIDE_WALL_KEYS.RIGHT_HOLLOW, x - 1, y - 1);
        if (!isDownRightFloor) {
          wallTopLowerLayer.putTileAt(WALL_TOP_KEYS.BOTTOM, x, y - 1);
        }
      }
    }
  });
};
