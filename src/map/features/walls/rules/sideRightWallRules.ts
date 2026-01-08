import { SIDE_WALL_KEYS, DIR } from "../../../../constants";
import { WallRule } from "../types";

/**
 * Rules for generating side walls (right).
 */
export const sideRightWallRules: WallRule[] = [
  // Rule: Right side wall at current Y
  {
    condition: (flags) =>
      !flags.isEastFloor && !flags.isSouthEastFloor && flags.isSouthFloor,
    commands: [
      {
        layer: "wallSideRightLayer",
        tileKey: SIDE_WALL_KEYS[DIR.W],
        offsetX: 1,
        offsetY: 0,
      },
    ],
  },

  // Rule: Right side wall at Y-1 (extends upward)
  {
    condition: (flags) =>
      !flags.isEastFloor &&
      !flags.isSouthEastFloor &&
      flags.isSouthFloor &&
      !flags.isNorthFloor,
    commands: [
      {
        layer: "wallSideRightLayer",
        tileKey: SIDE_WALL_KEYS[DIR.W],
        offsetX: 1,
        offsetY: -1,
      },
    ],
  },

  // Rule: Right side wall (inner corner, east floor)
  {
    condition: (flags) =>
      flags.isEastFloor && flags.isSouthFloor && !flags.isSouthEastFloor,
    commands: [
      {
        layer: "wallSideRightLayer",
        tileKey: SIDE_WALL_KEYS[DIR.W],
        offsetX: 1,
        offsetY: 0,
      },
    ],
  },
];
