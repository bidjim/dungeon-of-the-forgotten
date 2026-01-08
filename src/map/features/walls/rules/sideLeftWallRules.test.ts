import { describe, it, expect } from "vitest";
import { sideLeftWallRules } from "./sideLeftWallRules";
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

describe("sideLeftWallRules", () => {
  it("should return additive commands for both current Y and Y-1 when North is not floor", () => {
    const flags = createFlags({
      isWestFloor: false,
      isSouthWestFloor: false,
      isSouthFloor: true,
      isNorthFloor: false,
    });

    // Side walls are evaluated with isExclusive: false, so we check all matching rules
    const matches = sideLeftWallRules.filter((r) => r.condition(flags));
    const allCommands = matches.flatMap((m) => m.commands);

    expect(allCommands).toContainEqual(
      expect.objectContaining({ offsetY: 0, tileKey: SIDE_WALL_KEYS[DIR.E] })
    );
    expect(allCommands).toContainEqual(
      expect.objectContaining({ offsetY: -1, tileKey: SIDE_WALL_KEYS[DIR.E] })
    );
  });

  it("should only return current Y command when North is floor", () => {
    const flags = createFlags({
      isWestFloor: false,
      isSouthWestFloor: false,
      isSouthFloor: true,
      isNorthFloor: true,
    });

    const matches = sideLeftWallRules.filter((r) => r.condition(flags));
    const allCommands = matches.flatMap((m) => m.commands);

    expect(allCommands.some((c) => c.offsetY === 0)).toBe(true);
    expect(allCommands.some((c) => c.offsetY === -1)).toBe(false);
  });
});
