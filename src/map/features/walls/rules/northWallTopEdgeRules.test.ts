import { describe, it, expect } from "vitest";
import { northWallTopEdgeRules } from "./northWallTopEdgeRules";
import { WallFlags } from "../types";
import {
  DIR,
  WALL_UPPER_TOP_KEYS,
  WALL_TOP_EDGE_KEYS,
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

describe("northWallTopEdgeRules", () => {
  it("should return empty commands if north is a floor (Skip Rule)", () => {
    const flags = createFlags({ isNorthFloor: true });
    const rule = northWallTopEdgeRules.find((r) => r.condition(flags));
    expect(rule?.commands.length).toBe(0);
  });

  it("should return east edge decoration with edge tile when east is floor and north-east is not", () => {
    const flags = createFlags({
      isEastFloor: true,
      isWestFloor: false,
      isNorthEastFloor: false,
    });
    const rule = northWallTopEdgeRules.find((r) => r.condition(flags));
    expect(rule?.commands).toContainEqual({
      layer: "wallTopUpperLayer",
      tileKey: WALL_UPPER_TOP_KEYS[DIR.E],
      offsetX: 0,
      offsetY: -2,
    });
    expect(rule?.commands).toContainEqual({
      layer: "wallTopUpperLayer",
      tileKey: WALL_TOP_EDGE_KEYS[DIR.E],
      offsetX: -1,
      offsetY: -2,
    });
  });

  it("should return west edge decoration when west is floor", () => {
    const flags = createFlags({ isWestFloor: true, isEastFloor: false });
    const rule = northWallTopEdgeRules.find((r) => r.condition(flags));
    expect(
      rule?.commands.some((c) => c.tileKey === WALL_TOP_EDGE_KEYS[DIR.W])
    ).toBe(true);
  });
});
