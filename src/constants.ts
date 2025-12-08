export const MAP_WIDTH = 64; // In tiles
export const MAP_HEIGHT = 64; // In tiles

export const DEBUG_MAP = false;

export const MAP_MARGINS = {
  TOP: 2,
  BOTTOM: 0,
  LEFT: 1,
  RIGHT: 1,
};

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

export const PLAYER_PHYSICS_BODY = {
  WIDTH_MULTIPLIER: 0.75,
  HEIGHT_MULTIPLIER: 0.25,
  OFFSET_X_MULTIPLIER: 0.125,
  OFFSET_Y_MULTIPLIER: 0.75,
};

// Iterates over an object and returns a new one with all values -1
const SPRITE_OFFSET = DEBUG_MAP ? 0 : -1;

// 0 is usually the index for "Empty" or "Transparent" in Phaser tilesets
export const EMPTY_TILE_INDEX = 0;

// Using a Set allows O(1) lookup and easy addition of multiple floor tile types later
export const FLOOR_KEYS = new Set([98 + SPRITE_OFFSET]);

export const GATE_KEYS = {
  TOP_LEFT_DOOR: 291 + SPRITE_OFFSET,
  TOP_RIGHT_DOOR: 292 + SPRITE_OFFSET,
  MIDDLE_LEFT_DOOR: 326 + SPRITE_OFFSET,
  MIDDLE_LEFT_BRICK: 322 + SPRITE_OFFSET,
  MIDDLE_RIGHT_DOOR: 327 + SPRITE_OFFSET,
  MIDDLE_RIGHT_BRICK: 325 + SPRITE_OFFSET,
  BOTTOM_LEFT_DOOR: 358 + SPRITE_OFFSET,
  BOTTOM_RIGHT_DOOR: 359 + SPRITE_OFFSET,
};

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

export const STAIRS_KEYS = {
  DOWN: 230 + SPRITE_OFFSET,
  UP: 195 + SPRITE_OFFSET,
};

export const LAYER_DEPTHS = {
  STAIRS: -1,
  WALL_SIDE: 0,
  WALL_UPPER: 0,
  WALL_TOP_UPPER: 2,
  WALL_LOWER: 1,
  WALL_TOP_LOWER: 2,
};
