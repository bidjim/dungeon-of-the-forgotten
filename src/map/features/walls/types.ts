import { Layers } from "../Context";

/**
 * Flags derived from neighboring tiles.
 * Represents "what's around this tile?"
 */
export interface WallFlags {
  isNorthFloor: boolean;
  isNorthEastFloor: boolean;
  isEastFloor: boolean;
  isSouthEastFloor: boolean;
  isSouthFloor: boolean;
  isSouthWestFloor: boolean;
  isWestFloor: boolean;
  isNorthWestFloor: boolean;
  isNorthGate: boolean;
}

/**
 * A command to place a tile on a specific layer at an offset.
 * Pure data structure - no side effects.
 */
export interface WallCommand {
  layer: keyof Layers;
  tileKey: number;
  offsetX: number;
  offsetY: number;
}

/**
 * A rule that matches flags to rendering commands.
 * Condition determines if rule applies, commands define what to render.
 */
export interface WallRule {
  condition: (flags: WallFlags) => boolean;
  commands: WallCommand[];
}

/**
 * Organized set of rules for all wall directions.
 */
export interface WallRuleSet {
  north: WallRule[];
  south: WallRule[];
  side: WallRule[];
}
