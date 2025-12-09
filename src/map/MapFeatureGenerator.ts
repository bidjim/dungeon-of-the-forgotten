import Phaser from "phaser";
import {
  FLOOR_KEYS,
  SIDE_WALL_KEYS,
  WALL_KEYS,
  WALL_TOP_KEYS,
  EMPTY_TILE_INDEX,
  GATE_KEYS,
  STAIRS_KEYS,
  LAYER_DEPTHS,
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
  const stairsLayer = map.createBlankLayer("Stairs", tileset, 0, 0)!;

  // Set depths (Optimization: batch these if possible, but depth setting is cheap)
  stairsLayer.setDepth(LAYER_DEPTHS.STAIRS);
  wallSideLeftLayer.setDepth(LAYER_DEPTHS.WALL_SIDE);
  wallSideRightLayer.setDepth(LAYER_DEPTHS.WALL_SIDE);
  wallUpperLayer.setDepth(LAYER_DEPTHS.WALL_UPPER);
  wallTopUpperLayer.setDepth(LAYER_DEPTHS.WALL_TOP_UPPER);
  wallLowerLayer.setDepth(LAYER_DEPTHS.WALL_LOWER);
  wallTopLowerLayer.setDepth(LAYER_DEPTHS.WALL_TOP_LOWER);

  // Helper function to place multi-tile gate components
  const placeGateTiles = (
    tile: Phaser.Tilemaps.Tile,
    x: number,
    y: number,
    wallTopUpperLayer: Phaser.Tilemaps.TilemapLayer
  ) => {
    if (tile.index === GATE_KEYS.BOTTOM_LEFT_DOOR) {
      wallTopUpperLayer.putTileAt(GATE_KEYS.MIDDLE_LEFT_DOOR, x, y - 1);
      wallTopUpperLayer.putTileAt(GATE_KEYS.MIDDLE_LEFT_BRICK, x - 1, y - 1);
      wallTopUpperLayer.putTileAt(GATE_KEYS.TOP_LEFT_DOOR, x, y - 2);
    }

    if (tile.index === GATE_KEYS.BOTTOM_RIGHT_DOOR) {
      wallTopUpperLayer.putTileAt(GATE_KEYS.MIDDLE_RIGHT_DOOR, x, y - 1);
      wallTopUpperLayer.putTileAt(GATE_KEYS.MIDDLE_RIGHT_BRICK, x + 1, y - 1);
      wallTopUpperLayer.putTileAt(GATE_KEYS.TOP_RIGHT_DOOR, x, y - 2);
    }
  };

  // Access raw data array directly.
  const grid = floorLayer.layer.data;
  const mapWidth = floorLayer.layer.width;
  const mapHeight = floorLayer.layer.height;

  // Helper: Fast bounds check and index retrieval
  const getIndex = (x: number, y: number): number | null => {
    if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return null;
    return grid[y][x].index;
  };

  floorLayer.forEachTile((tile) => {
    const x = tile.x;
    const y = tile.y;

    // Handle multi-tile gate placement. These override standard wall generation
    // for tiles that are part of a gate structure.
    placeGateTiles(tile, x, y, wallTopUpperLayer);

    // --- Pre-calculate Neighbors ---
    const n_Left = getIndex(x - 1, y);
    const n_Right = getIndex(x + 1, y);
    const n_Up = getIndex(x, y - 1);
    const n_Down = getIndex(x, y + 1);
    const n_UpLeft = getIndex(x - 1, y - 1);
    const n_UpRight = getIndex(x + 1, y - 1);
    const n_DownLeft = getIndex(x - 1, y + 1);
    const n_DownRight = getIndex(x + 1, y + 1);

    if (tile.index === STAIRS_KEYS.UP) {
      let blendIndex: number | null = null; // Initialize to null

      // First, try the tile directly above (n_Up)
      if (n_Up !== null && n_Up !== EMPTY_TILE_INDEX) {
        blendIndex = n_Up;
      }

      // If no valid tile above, check other neighbors in a specific order
      if (blendIndex === null) {
        const potentialNeighbors = [
          n_Down,
          n_Left,
          n_Right, // Direct neighbors
          n_UpLeft,
          n_UpRight, // Diagonal-up neighbors
          n_DownLeft,
          n_DownRight, // Diagonal-down neighbors
        ];

        for (const neighborTileIndex of potentialNeighbors) {
          if (
            neighborTileIndex !== null &&
            neighborTileIndex !== EMPTY_TILE_INDEX
          ) {
            blendIndex = neighborTileIndex;
            break; // Found a valid blend tile, stop searching
          }
        }
      }

      // If a valid blendIndex was found, use it. Otherwise, default to EMPTY_TILE_INDEX.
      stairsLayer.putTileAt(
        blendIndex !== null ? blendIndex : EMPTY_TILE_INDEX,
        x,
        y
      );
    }

    // Skip if current tile is not a floor (we iterate floors to find where walls go)
    if (!FLOOR_KEYS.has(tile.index)) return;

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

    const isUpLeftGate =
      n_UpLeft !== null && GATE_KEYS.BOTTOM_RIGHT_DOOR == n_UpLeft;
    const isUpRightGate =
      n_UpRight !== null && GATE_KEYS.BOTTOM_LEFT_DOOR == n_UpRight;

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
        if (!isUpLeftGate && !isUpRightGate) {
          wallTopUpperLayer.putTileAt(WALL_TOP_KEYS.WE, x, y - 2);
        }
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
