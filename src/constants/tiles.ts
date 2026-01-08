import { DEBUG_MAP } from "./map";

// 0 is usually the index for "Empty" or "Transparent" in Phaser tilesets
export const EMPTY_TILE_INDEX = 0;

// Iterates over an object and returns a new one with all values -1
const SPRITE_OFFSET = DEBUG_MAP ? 1 : 0;

const tile = (index: number): number => index + SPRITE_OFFSET;

export const DIR = {
  N: 1,
  NE: 2,
  E: 4,
  SE: 8,
  S: 16,
  SW: 32,
  W: 64,
  NW: 128,
} as const;

export const STAIRS_KEYS = {
  DOWN: tile(229),
  UP: tile(194),
} as const;

export const FLOOR_TILE = tile(97);

export const GATE_KEYS = {
  TOP_LEFT_DOOR: tile(290),
  TOP_RIGHT_DOOR: tile(291),
  MIDDLE_LEFT_DOOR: tile(325),
  MIDDLE_LEFT_BRICK: tile(321),
  MIDDLE_RIGHT_DOOR: tile(326),
  MIDDLE_RIGHT_BRICK: tile(324),
  BOTTOM_LEFT_DOOR: tile(357),
  BOTTOM_RIGHT_DOOR: tile(358),
} as const;

export const WALL_KEYS: number[] = [];
WALL_KEYS[DIR.E] = tile(1);
WALL_KEYS[DIR.E | DIR.W] = tile(2);
WALL_KEYS[DIR.W] = tile(3);

export const WALL_LOWER_KEYS: number[] = [];
WALL_LOWER_KEYS[DIR.E] = tile(139);
WALL_LOWER_KEYS[DIR.W] = tile(141);

export const WALL_UPPER_TOP_KEYS: number[] = [];
WALL_UPPER_TOP_KEYS[DIR.NE | DIR.NW | DIR.E | DIR.W] = tile(80);
WALL_UPPER_TOP_KEYS[DIR.NE | DIR.E] = tile(79);
WALL_UPPER_TOP_KEYS[DIR.NW | DIR.W] = tile(78);
WALL_UPPER_TOP_KEYS[DIR.E | DIR.W] = tile(12);
WALL_UPPER_TOP_KEYS[DIR.E] = tile(12);
WALL_UPPER_TOP_KEYS[DIR.W] = tile(12);

export const WALL_LOWER_TOP_KEYS: number[] = [];
WALL_LOWER_TOP_KEYS[DIR.SE | DIR.SW | DIR.E | DIR.W] = tile(48);
WALL_LOWER_TOP_KEYS[DIR.SE | DIR.E | DIR.W] = tile(111);
WALL_LOWER_TOP_KEYS[DIR.SW | DIR.E | DIR.W] = tile(110);
WALL_LOWER_TOP_KEYS[DIR.E | DIR.W] = tile(108);

export const WALL_TOP_EDGE_KEYS: number[] = [];
WALL_TOP_EDGE_KEYS[DIR.E] = tile(43);
WALL_TOP_EDGE_KEYS[DIR.W] = tile(45);

export const SIDE_WALL_KEYS: number[] = [];
SIDE_WALL_KEYS[DIR.E] = tile(75);
SIDE_WALL_KEYS[DIR.W] = tile(77);

export const WALL_GENERATING_TILES = new Set([
  FLOOR_TILE,
  STAIRS_KEYS.UP,
  STAIRS_KEYS.DOWN,
]);

export const WALKABLE_TILES = new Set([
  FLOOR_TILE,
  STAIRS_KEYS.UP,
  STAIRS_KEYS.DOWN,
]);

export const ACCEPTABLE_PATHFINDING_TILES: number[] = [
  tile(97),
  STAIRS_KEYS.UP,
  STAIRS_KEYS.DOWN,
] as const;
