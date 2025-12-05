import { describe, it, expect, vi, beforeEach, MockInstance } from "vitest";
import {
  placeFirstFloorElements,
  placeSubsequentFloorElements,
} from "./MapElementPlacer";
import { Leaf } from "./Leaf";
import { SafeSetFunction } from "../types/map";

// Mock dependencies
vi.mock("./constants", () => ({
  GATE_KEYS: {
    BOTTOM_LEFT_DOOR: 100,
    BOTTOM_RIGHT_DOOR: 101,
  },
  STAIRS_KEYS: {
    DOWN: 200,
    UP: 201,
  },
}));

// Helper to create a dummy Leaf with a room
const createRoomLeaf = (x: number, y: number, w: number, h: number): Leaf => {
  return {
    room: { x, y, w, h },
  } as unknown as Leaf;
};

describe("MapElementPlacer", () => {
  let map: number[][];
  let safeSet: MockInstance<SafeSetFunction> | SafeSetFunction;
  const MAP_WIDTH = 50;
  const MAP_HEIGHT = 50;

  beforeEach(() => {
    // Reset map and mock function before each test
    map = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(0));
    safeSet = vi.fn((x, y, value) => {
      if (y >= 0 && y < MAP_HEIGHT && x >= 0 && x < MAP_WIDTH) {
        map[y][x] = value;
      }
    });
  });

  describe("placeFirstFloorElements", () => {
    it("Gate Placement: gateLocation is always at room.y - 1 (North Wall)", () => {
      const roomY = 10;
      const leaf = createRoomLeaf(10, roomY, 10, 10);

      const result = placeFirstFloorElements(
        map,
        MAP_WIDTH,
        MAP_HEIGHT,
        safeSet as SafeSetFunction,
        [leaf]
      );

      expect(result.gateLocation).toBeDefined();
      expect(result.gateLocation!.y).toBe(roomY - 1);
    });

    it("Gate Placement: gateLocation is within the x-bounds of the room", () => {
      const roomX = 10;
      const roomW = 10;
      const leaf = createRoomLeaf(roomX, 10, roomW, 10);

      const result = placeFirstFloorElements(
        map,
        MAP_WIDTH,
        MAP_HEIGHT,
        safeSet as SafeSetFunction,
        [leaf]
      );
      const gate = result.gateLocation!;

      // Gate should start at or after room start
      expect(gate.x).toBeGreaterThanOrEqual(roomX);
      // Gate end (x + width) should be at or before room end
      expect(gate.x + gate.width).toBeLessThanOrEqual(roomX + roomW);

      // Specifically verifies centering logic: 10 + floor((10-2)/2) = 14
      expect(gate.x).toBe(14);
    });

    it("Gate Placement: Clamps gateY to 0 if room is at the very top of map", () => {
      const leaf = createRoomLeaf(10, 0, 10, 10);

      const result = placeFirstFloorElements(
        map,
        MAP_WIDTH,
        MAP_HEIGHT,
        safeSet as SafeSetFunction,
        [leaf]
      );

      expect(result.gateLocation!.y).toBe(0);
    });

    it("Spawn Validity: playerSpawn is strictly on a valid floor tile (inside walls)", () => {
      const x = 5,
        y = 5,
        w = 10,
        h = 10;
      const leaf = createRoomLeaf(x, y, w, h);

      const result = placeFirstFloorElements(
        map,
        MAP_WIDTH,
        MAP_HEIGHT,
        safeSet as SafeSetFunction,
        [leaf]
      );
      const { playerSpawn } = result;

      // Check against walls (x, x+w-1, y, y+h-1)
      expect(playerSpawn.x).toBeGreaterThan(x);
      expect(playerSpawn.x).toBeLessThan(x + w - 1);
      expect(playerSpawn.y).toBeGreaterThan(y);
      expect(playerSpawn.y).toBeLessThan(y + h - 1);

      // Specific implementation check (x+1, y+1)
      expect(playerSpawn.x).toBe(x + 1);
      expect(playerSpawn.y).toBe(y + 1);
    });
  });

  describe("placeSubsequentFloorElements", () => {
    it("Spawn Validity: playerSpawn is always on a valid floor tile (bottom of room)", () => {
      const x = 5,
        y = 5,
        w = 10,
        h = 10;
      const leaf = createRoomLeaf(x, y, w, h);

      const result = placeSubsequentFloorElements(
        map,
        MAP_WIDTH,
        MAP_HEIGHT,
        safeSet as SafeSetFunction,
        [leaf]
      );
      const { playerSpawn } = result;

      // Must be inside horizontal bounds
      expect(playerSpawn.x).toBeGreaterThan(x);
      expect(playerSpawn.x).toBeLessThan(x + w - 1);

      // Must be inside vertical bounds (implementation uses y + h - 2)
      expect(playerSpawn.y).toBeGreaterThan(y);
      expect(playerSpawn.y).toBeLessThan(y + h - 1);
    });

    it("Element Uniqueness: stairsDown and stairsUp never share (x, y) coordinates", () => {
      // Use a small room to force potential collisions and verify the retry logic works
      // Room 5x5 (Interior 3x3).
      // This constrains placement options significantly.
      const leaf = createRoomLeaf(20, 20, 5, 5);

      // Run multiple times to statistically ensure collision logic is exercised
      for (let i = 0; i < 50; i++) {
        (safeSet as MockInstance<SafeSetFunction>).mockClear();
        const result = placeSubsequentFloorElements(
          map,
          MAP_WIDTH,
          MAP_HEIGHT,
          safeSet as SafeSetFunction,
          [leaf]
        );

        const up = result.previousFloorStairsLocation;
        const down = result.nextFloorStairsLocation;

        if (up && down) {
          const isSameLocation = up.x === down.x && up.y === down.y;
          if (isSameLocation) {
            console.error(
              `Collision detected! Up: ${JSON.stringify(
                up
              )}, Down: ${JSON.stringify(down)}`
            );
          }
          expect(isSameLocation).toBe(false);
        }
      }
    });

    it("Element Uniqueness: Works when multiple rooms are available", () => {
      // Two distinct rooms, elements should definitely not collide
      const room1 = createRoomLeaf(0, 0, 10, 10);
      const room2 = createRoomLeaf(20, 20, 10, 10);

      const result = placeSubsequentFloorElements(
        map,
        MAP_WIDTH,
        MAP_HEIGHT,
        safeSet as SafeSetFunction,
        [room1, room2]
      );

      const up = result.previousFloorStairsLocation;
      const down = result.nextFloorStairsLocation;

      expect(up).toBeDefined();
      expect(down).toBeDefined();
      expect(up!.x === down!.x && up!.y === down!.y).toBe(false);
    });
  });
});
