import { describe, it, expect } from "vitest";
import { southWallTopRules } from "./southWallTopRules";
import { WallFlags } from "../types";
import {
  DIR,
  WALL_LOWER_TOP_KEYS,
  WALL_LOWER_KEYS,
} from "../../../../constants/tiles";

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

describe("southWallTopRules", () => {
  it("should prioritize all-four-corners rule", () => {
    const flags = createFlags({
      isSouthEastFloor: true,
      isSouthWestFloor: true,
      isEastFloor: true,
      isWestFloor: true,
    });
    const rule = southWallTopRules.find((r) => r.condition(flags));
    expect(rule?.commands[0].tileKey).toBe(
      WALL_LOWER_TOP_KEYS[DIR.SE | DIR.SW | DIR.E | DIR.W]
    );
  });

  it("should handle east floor without west floor correctly", () => {
    const flags = createFlags({ isEastFloor: true, isWestFloor: false });
    const rule = southWallTopRules.find((r) => r.condition(flags));
    expect(
      rule?.commands.some((c) => c.tileKey === WALL_LOWER_KEYS[DIR.E])
    ).toBe(true);
    expect(
      rule?.commands.some(
        (c) => c.tileKey === WALL_LOWER_TOP_KEYS[DIR.E | DIR.W]
      )
    ).toBe(true);
  });
});
