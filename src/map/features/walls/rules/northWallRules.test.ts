import { northWallRules } from "./northWallRules";
import { WallFlags } from "../types";
import { describe, it, expect, vi, beforeEach, MockInstance } from "vitest";
import { DIR, WALL_KEYS } from "../../../../constants";

describe("northWallRules", () => {
  it("should return empty commands if north is a floor", () => {
    const flags: Partial<WallFlags> = { isNorthFloor: true };
    const rule = northWallRules.find((r) => r.condition(flags as WallFlags));
    expect(rule?.commands.length).toBe(0);
  });

  it("should return WE wall if east and west are floors", () => {
    const flags: Partial<WallFlags> = {
      isNorthFloor: false,
      isEastFloor: true,
      isWestFloor: true,
    };
    const rule = northWallRules.find((r) => r.condition(flags as WallFlags));
    expect(rule?.commands[0].tileKey).toBe(WALL_KEYS[DIR.E | DIR.W]);
  });
});
