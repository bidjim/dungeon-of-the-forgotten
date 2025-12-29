import { WALL_UPPER_TOP_KEYS, DIR } from "../../../../constants";
import { WallRule } from "../types";

/**
 * Rules for generating north-facing top walls.
 * Ordered by specificity - most specific conditions first.
 */
export const northWallTopRules: WallRule[] = [
  // Rule: Skip if north has floor or gate
  {
    condition: (flags) => flags.isNorthFloor || flags.isNorthGate,
    commands: [], // No wall needed
  },

  // Rule: Top decor - all four corners with floor
  {
    condition: (flags) =>
      flags.isNorthEastFloor &&
      flags.isNorthWestFloor &&
      flags.isEastFloor &&
      flags.isWestFloor,
    commands: [
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_UPPER_TOP_KEYS[DIR.NE | DIR.NW | DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -2,
      },
    ],
  },

  // Rule: Top decor - northeast corner with east floor
  {
    condition: (flags) => flags.isNorthEastFloor && flags.isEastFloor,
    commands: [
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_UPPER_TOP_KEYS[DIR.NE | DIR.E],
        offsetX: 0,
        offsetY: -2,
      },
    ],
  },

  // Rule: Top decor - northwest corner with west floor
  {
    condition: (flags) => flags.isNorthWestFloor && flags.isWestFloor,
    commands: [
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_UPPER_TOP_KEYS[DIR.NW | DIR.W],
        offsetX: 0,
        offsetY: -2,
      },
    ],
  },

  // Rule: Top decor - both east and west floor (no corners)
  {
    condition: (flags) => flags.isEastFloor && flags.isWestFloor,
    commands: [
      {
        layer: "wallTopUpperLayer",
        tileKey: WALL_UPPER_TOP_KEYS[DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -2,
      },
    ],
  },
];
