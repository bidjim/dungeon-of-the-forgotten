import { describe, it, expect } from "vitest";
import { sideRightWallRules } from "./sideRightWallRules";
import { WallFlags } from "../types";
import { DIR, SIDE_WALL_KEYS } from "../../../../constants/tiles";

const createFlags = (overrides: Partial<WallFlags>): WallFlags => ({
  isNorthFloor: false,
  isNorthEastFloor: false,
  isEastFloor: false,
  isSouthEastFloor: false,
  isSouthFloor: false,
  isSouthWestFloor: false,
  isWestFloor: false,
  isNorthWestFloor: false,
  isNorthGate: false,
  ...overrides,
});

describe("sideRightWallRules", () => {
  it("should return additive commands for both current Y and Y-1 when North is not floor", () => {
    const flags = createFlags({
      isEastFloor: false,
      isSouthEastFloor: false,
      isSouthFloor: true,
      isNorthFloor: false,
    });

    const matches = sideRightWallRules.filter((r) => r.condition(flags));
    const allCommands = matches.flatMap((m) => m.commands);

    expect(allCommands).toContainEqual(
      expect.objectContaining({ offsetY: 0, tileKey: SIDE_WALL_KEYS[DIR.W] })
    );
    expect(allCommands).toContainEqual(
      expect.objectContaining({ offsetY: -1, tileKey: SIDE_WALL_KEYS[DIR.W] })
    );
  });

  it("should handle inner corner case where east floor is true but south-east is false", () => {
    const flags = createFlags({
      isEastFloor: true,
      isSouthFloor: true,
      isSouthEastFloor: false,
    });

    const matches = sideRightWallRules.filter((r) => r.condition(flags));
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].commands[0].tileKey).toBe(SIDE_WALL_KEYS[DIR.W]);
  });
});
