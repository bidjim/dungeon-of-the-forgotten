import { describe, it, expect } from "vitest";
import { northWallTopRules } from "./northWallTopRules";
import { WallFlags } from "../types";
import { DIR, WALL_UPPER_TOP_KEYS } from "../../../../constants/tiles";

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

describe("northWallTopRules", () => {
  it("should return all-corners tile when all four directions are floor", () => {
    const flags = createFlags({
      isNorthEastFloor: true,
      isNorthWestFloor: true,
      isEastFloor: true,
      isWestFloor: true,
    });
    const rule = northWallTopRules.find((r) => r.condition(flags));
    expect(rule?.commands[0].tileKey).toBe(
      WALL_UPPER_TOP_KEYS[DIR.NE | DIR.NW | DIR.E | DIR.W]
    );
  });

  it("should return northeast tile when northeast and east are floors", () => {
    const flags = createFlags({ isNorthEastFloor: true, isEastFloor: true });
    const rule = northWallTopRules.find((r) => r.condition(flags));
    expect(rule?.commands[0].tileKey).toBe(WALL_UPPER_TOP_KEYS[DIR.NE | DIR.E]);
  });

  it("should return general EW tile when east and west are floor but no corners match", () => {
    const flags = createFlags({ isEastFloor: true, isWestFloor: true });
    const rule = northWallTopRules.find((r) => r.condition(flags));
    expect(rule?.commands[0].tileKey).toBe(WALL_UPPER_TOP_KEYS[DIR.E | DIR.W]);
  });
});
