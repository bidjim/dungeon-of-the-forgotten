import { describe, it, expect } from "vitest";
import { southWallRules } from "./southWallRules";
import { WallFlags } from "../types";
import { DIR, WALL_KEYS } from "../../../../constants/tiles";

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

describe("southWallRules", () => {
  it("should return empty commands if south is floor", () => {
    const flags = createFlags({ isSouthFloor: true });
    const rule = southWallRules.find((r) => r.condition(flags));
    expect(rule?.commands.length).toBe(0);
  });

  it("should return base wall tile as fallback", () => {
    const flags = createFlags({ isSouthFloor: false });
    const rule = southWallRules.find((r) => r.condition(flags));
    expect(rule?.commands[0].tileKey).toBe(WALL_KEYS[DIR.E | DIR.W]);
  });
});
