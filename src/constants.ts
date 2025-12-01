export const DEBUG_MAP = false;

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

// Iterates over an object and returns a new one with all values -1
const SPRITE_OFFSET = DEBUG_MAP ? 0 : -1;

// 0 is usually the index for "Empty" or "Transparent" in Phaser tilesets
export const EMPTY_TILE_INDEX = 0;

// Using a Set allows O(1) lookup and easy addition of multiple floor tile types later
export const FLOOR_KEYS = new Set([98 + SPRITE_OFFSET]);

export const WALL_KEYS = {
  E: 2 + SPRITE_OFFSET,
  WE: 3 + SPRITE_OFFSET,
  W: 4 + SPRITE_OFFSET,
};

export const WALL_TOP_KEYS = {
  E: 12 + SPRITE_OFFSET,
  WE: 13 + SPRITE_OFFSET,
  W: 14 + SPRITE_OFFSET,
  BOTTOM_RIGHT_LONG: 80 + SPRITE_OFFSET,
  BOTTOM_RIGHT_DOT: 44 + SPRITE_OFFSET,
  BOTTOM_LEFT_LONG: 79 + SPRITE_OFFSET,
  BOTTOM_LEFT_DOT: 46 + SPRITE_OFFSET,
  TOP_LEFT_LONG: 47 + SPRITE_OFFSET,
  TOP_RIGHT_LONG: 48 + SPRITE_OFFSET,
  BOTTOM_RIGHT_HOLLOW: 112 + SPRITE_OFFSET,
  BOTTOM_LEFT_HOLLOW: 111 + SPRITE_OFFSET,
  BOTTOM_LEFT_HOLLOW_TOP: 176 + SPRITE_OFFSET,
  BOTTOM: 109 + SPRITE_OFFSET,
  LEFT_TOP_RIGHT: 49 + SPRITE_OFFSET,
  LEFT_BOTTOM_RIGHT: 81 + SPRITE_OFFSET,
};

export const SIDE_WALL_KEYS = {
  RIGHT: 76 + SPRITE_OFFSET,
  RIGHT_HOLLOW: 108 + SPRITE_OFFSET,
  LEFT: 78 + SPRITE_OFFSET,
  LEFT_HOLLOW: 110 + SPRITE_OFFSET,
  BOTTOM_LEFT: 140 + SPRITE_OFFSET,
  BOTTOM_RIGHT: 142 + SPRITE_OFFSET,
};
