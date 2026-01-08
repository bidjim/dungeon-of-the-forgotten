import {
  WALL_LOWER_KEYS,
  WALL_LOWER_TOP_KEYS,
  DIR,
} from "../../../../constants";
import { WallRule } from "../types";

/**
 * Rules for generating south-facing top walls.
 * Ordered by specificity - most specific conditions first.
 */
export const southWallTopRules: WallRule[] = [
  // Rule: Skip if south has floor
  {
    condition: (flags) => flags.isSouthFloor,
    commands: [],
  },

  // Rule: Top decor - all four corners
  {
    condition: (flags) =>
      flags.isSouthEastFloor &&
      flags.isSouthWestFloor &&
      flags.isEastFloor &&
      flags.isWestFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.SE | DIR.SW | DIR.E | DIR.W],
        offsetX: 0,
        offsetY: 0,
      },
    ],
  },

  // Rule: Top decor - southeast with east and west
  {
    condition: (flags) =>
      flags.isSouthEastFloor && flags.isEastFloor && flags.isWestFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.SE | DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
    ],
  },

  // Rule: Top decor - southwest with east and west
  {
    condition: (flags) =>
      flags.isSouthWestFloor && flags.isEastFloor && flags.isWestFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.SW | DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
    ],
  },

  // Rule: Top decor - both east and west (no corners)
  {
    condition: (flags) => flags.isEastFloor && flags.isWestFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
    ],
  },

  // Rule: East floor with southeast corner
  {
    condition: (flags) =>
      flags.isEastFloor && !flags.isWestFloor && flags.isSouthEastFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.SE | DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
      {
        layer: "wallLowerLayer",
        tileKey: WALL_LOWER_KEYS[DIR.E],
        offsetX: -1,
        offsetY: 0,
      },
    ],
  },

  // Rule: East floor without southeast corner
  {
    condition: (flags) => flags.isEastFloor && !flags.isWestFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
      {
        layer: "wallLowerLayer",
        tileKey: WALL_LOWER_KEYS[DIR.E],
        offsetX: -1,
        offsetY: 0,
      },
    ],
  },

  // Rule: West floor with southwest corner
  {
    condition: (flags) =>
      flags.isWestFloor && !flags.isEastFloor && flags.isSouthWestFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.SW | DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
      {
        layer: "wallLowerLayer",
        tileKey: WALL_LOWER_KEYS[DIR.W],
        offsetX: 1,
        offsetY: 0,
      },
    ],
  },

  // Rule: West floor without southwest corner
  {
    condition: (flags) => flags.isWestFloor && !flags.isEastFloor,
    commands: [
      {
        layer: "wallTopLowerLayer",
        tileKey: WALL_LOWER_TOP_KEYS[DIR.E | DIR.W],
        offsetX: 0,
        offsetY: -1,
      },
      {
        layer: "wallLowerLayer",
        tileKey: WALL_LOWER_KEYS[DIR.W],
        offsetX: 1,
        offsetY: 0,
      },
    ],
  },
];
