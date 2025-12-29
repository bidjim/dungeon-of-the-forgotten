import { SIDE_WALL_KEYS, DIR } from "../../../../constants";
import { WallRule } from "../types";

/**
 * Rules for generating side walls (left).
 */
export const sideLeftWallRules: WallRule[] = [
  // Rule: Left side wall at current Y
  {
    condition: (flags) =>
      !flags.isWestFloor && !flags.isSouthWestFloor && flags.isSouthFloor,
    commands: [
      {
        layer: "wallSideLeftLayer",
        tileKey: SIDE_WALL_KEYS[DIR.E],
        offsetX: -1,
        offsetY: 0,
      },
    ],
  },

  // Rule: Left side wall at Y-1 (extends upward)
  {
    condition: (flags) =>
      !flags.isWestFloor &&
      !flags.isSouthWestFloor &&
      flags.isSouthFloor &&
      !flags.isNorthFloor,
    commands: [
      {
        layer: "wallSideLeftLayer",
        tileKey: SIDE_WALL_KEYS[DIR.E],
        offsetX: -1,
        offsetY: -1,
      },
    ],
  },

  // Rule: Left side wall (inner corner, west floor)
  {
    condition: (flags) =>
      flags.isWestFloor && flags.isSouthFloor && !flags.isSouthWestFloor,
    commands: [
      {
        layer: "wallSideLeftLayer",
        tileKey: SIDE_WALL_KEYS[DIR.E],
        offsetX: -1,
        offsetY: 0,
      },
    ],
  },
];
