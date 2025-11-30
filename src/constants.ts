import { LEFT, RIGHT } from "phaser";

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

export const FLOOR_KEYS = 66;

export const WALL_KEYS = {
  E: 18,
  WE: 19,
  W: 20,
};

export const WALL_TOP_KEYS = {
  E: 2,
  WE: 3,
  W: 4,
  BOTTOM_RIGHT_LONG: 117,
  BOTTOM_RIGHT_DOT: 114,
  BOTTOM_LEFT_LONG: 149,
  BOTTOM_LEFT_DOT: 116,
};

export const SIDE_WALL_KEYS = {
  RIGHT: 146,
  LEFT: 148,
};
