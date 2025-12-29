import { WALL_KEYS, DIR } from "../../../../constants";
import { WallRule } from "../types";

/**
 * Rules for generating north-facing walls.
 * Ordered by specificity - most specific conditions first.
 */
export const northWallRules: WallRule[] = [
  // Rule: Skip if north has floor or gate
  {
    condition: (flags) => flags.isNorthFloor || flags.isNorthGate,
    commands: [], // No wall needed
  },

  // Rule: Base wall - both east and west have floor
  {
    condition: (flags) => flags.isEastFloor && flags.isWestFloor,
    commands: [
      {
        layer: "wallUpperLayer",
        tileKey: WALL_KEYS[DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
    ],
  },

  // Rule: Base wall - only west has floor
  {
    condition: (flags) => flags.isWestFloor && !flags.isEastFloor,
    commands: [
      {
        layer: "wallUpperLayer",
        tileKey: WALL_KEYS[DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
    ],
  },

  // Rule: Base wall - default (east orientation)
  {
    condition: () => true, // Fallback
    commands: [
      {
        layer: "wallUpperLayer",
        tileKey: WALL_KEYS[DIR.E],
        offsetX: 0,
        offsetY: -1,
      },
    ],
  },
];
