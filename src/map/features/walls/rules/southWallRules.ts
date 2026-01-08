import { WALL_KEYS, DIR } from "../../../../constants";
import { WallRule } from "../types";

/**
 * Rules for generating south-facing walls.
 * Ordered by specificity - most specific conditions first.
 */
export const southWallRules: WallRule[] = [
  // Rule: Skip if south has floor
  {
    condition: (flags) => flags.isSouthFloor,
    commands: [],
  },

  // Rule: Base wall (always full width)
  {
    condition: () => true,
    commands: [
      {
        layer: "wallLowerLayer",
        tileKey: WALL_KEYS[DIR.E | DIR.W],
        offsetX: 0,
        offsetY: 0,
      },
    ],
  },
];
