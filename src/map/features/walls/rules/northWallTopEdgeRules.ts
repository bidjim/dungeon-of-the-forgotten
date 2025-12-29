import {
  WALL_UPPER_TOP_KEYS,
  WALL_TOP_EDGE_KEYS,
  DIR,
} from "../../../../constants";
import { WallRule } from "../types";

/**
 * Rules for generating north-facing top edge walls.
 * Ordered by specificity - most specific conditions first.
 */
export const northWallTopEdgeRules: WallRule[] = [
  // Rule: Skip if north has floor or gate
  {
    condition: (flags) => flags.isNorthFloor || flags.isNorthGate,
    commands: [], // No wall needed
  },

  // Rule: East edge decoration with edge tile
  {
    condition: (flags) =>
      flags.isEastFloor && !flags.isWestFloor && !flags.isNorthEastFloor,
    commands: [
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_UPPER_TOP_KEYS[DIR.E],
        offsetX: 0,
        offsetY: -2,
      },
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_TOP_EDGE_KEYS[DIR.E],
        offsetX: -1,
        offsetY: -2,
      },
    ],
  },

  // Rule: East edge decoration without northeast corner
  {
    condition: (flags) => flags.isEastFloor && !flags.isWestFloor,
    commands: [
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_TOP_EDGE_KEYS[DIR.E],
        offsetX: -1,
        offsetY: -2,
      },
    ],
  },

  // Rule: West edge decoration with edge tile
  {
    condition: (flags) =>
      flags.isWestFloor && !flags.isEastFloor && !flags.isNorthWestFloor,
    commands: [
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_UPPER_TOP_KEYS[DIR.W],
        offsetX: 0,
        offsetY: -2,
      },
      {
        layer: "wallTopUpperEdgeLayer",
        tileKey: WALL_TOP_EDGE_KEYS[DIR.W],
        offsetX: 1,
        offsetY: -2,
      },
    ],
  },

  // Rule: West edge decoration without northwest corner
  {
    condition: (flags) => flags.isWestFloor && !flags.isEastFloor,
    commands: [
      {
        layer: "wallTopUpperEdgeLayer",
        tileKey: WALL_TOP_EDGE_KEYS[DIR.W],
        offsetX: 1,
        offsetY: -2,
      },
    ],
  },
];
