export const ASSET_KEYS = {
  DUNGEON_TILES: "dungeon_tiles",
  KNIGHT: "knight",
  TILESET: "tileset",
};

export const ASSET_PATHS = {
  DUNGEON_TILES: "assets/tileset.png",
  DUNGEON_JSON: "assets/tileset.tmj",
  KNIGHT: "assets/knight.png",
};

export const ANIM_KEYS = {
  KNIGHT_IDLE: "knight_idle",
  KNIGHT_RUN: "knight_run",
};

// 0 is usually the index for "Empty" or "Transparent" in Phaser tilesets
export const EMPTY_TILE_INDEX = 0;

// Using a Set allows O(1) lookup and easy addition of multiple floor tile types later
export const FLOOR_KEYS = new Set([98]);

export const WALL_KEYS = {
  E: 2,
  WE: 3,
  W: 4,
};

export const WALL_TOP_KEYS = {
  E: 12,
  WE: 13,
  W: 14,
  BOTTOM_RIGHT_LONG: 80,
  BOTTOM_RIGHT_DOT: 44,
  BOTTOM_LEFT_LONG: 79,
  BOTTOM_LEFT_DOT: 46,
  TOP_RIGHT_LONG: 48,
  BOTTOM_RIGHT_HOLLOW: 112,
  BOTTOM_LEFT_HOLLOW: 111,
  BOTTOM_LEFT_HOLLOW_TOP: 175,
  BOTTOM: 109,
};

export const SIDE_WALL_KEYS = {
  RIGHT: 76,
  RIGHT_HOLLOW: 108,
  LEFT: 78,
  LEFT_HOLLOW: 110,
  BOTTOM_LEFT: 140,
  BOTTOM_RIGHT: 142,
};
