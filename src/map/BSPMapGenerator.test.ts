import { describe, it, expect } from "vitest";
import { BSPMapGenerator } from "./BSPMapGenerator";
import { EMPTY_TILE_INDEX } from "../constants";
import { Leaf } from "./Leaf";

describe("BSPMapGenerator", () => {
  const WIDTH = 50;
  const HEIGHT = 40;

  it("should generate a map with the correct dimensions", () => {
    const generator = new BSPMapGenerator(WIDTH, HEIGHT);
    const result = generator.generate(1);

    expect(result.map.length).toBe(HEIGHT);
    expect(result.map.every((row) => row.length === WIDTH)).toBe(true);
  });

  it("should return the correct number of leaves via getAllRooms", () => {
    const generator = new BSPMapGenerator(WIDTH, HEIGHT);
    generator.generate(1);

    // Access private properties/methods via casting to any
    const root = (generator as any).root as Leaf;
    const collectedRooms: Leaf[] = [];
    (generator as any).getAllRooms(root, collectedRooms);

    // Helper to manually count leaves with rooms in the tree
    const countRoomsInTree = (leaf: Leaf): number => {
      let count = 0;
      // If it's a leaf node with a room, count it
      if (leaf.room && !leaf.left && !leaf.right) {
        count = 1;
      }
      if (leaf.left) count += countRoomsInTree(leaf.left);
      if (leaf.right) count += countRoomsInTree(leaf.right);
      return count;
    };

    const expectedCount = countRoomsInTree(root);
    expect(collectedRooms.length).toBe(expectedCount);
    expect(collectedRooms.length).toBeGreaterThan(0);
  });

  it("should ensure all generated rooms are accessible from the spawn point", () => {
    // Retry a few times if random generation produces degenerate cases (unlikely but possible in BSP)
    // or just run once. BSP guarantees connectivity if implemented correctly.
    const generator = new BSPMapGenerator(WIDTH, HEIGHT);
    const result = generator.generate(1);
    const map = result.map;
    const spawn = result.playerSpawn;

    // 1. Get all rooms to verify they are reached
    const collectedRooms: Leaf[] = [];
    (generator as any).getAllRooms((generator as any).root, collectedRooms);

    // 2. Perform Flood Fill (BFS) from spawn
    const visited = new Set<string>();
    const queue: { x: number; y: number }[] = [spawn];
    visited.add(`${spawn.x},${spawn.y}`);

    const directions = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
    ];

    while (queue.length > 0) {
      const curr = queue.shift()!;

      for (const dir of directions) {
        const nx = curr.x + dir.x;
        const ny = curr.y + dir.y;

        // Check bounds
        if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
          // Check if walkable (not a wall/empty space)
          // We assume anything not EMPTY_TILE_INDEX is part of the dungeon (floor, hall, element)
          if (map[ny][nx] !== EMPTY_TILE_INDEX && !visited.has(`${nx},${ny}`)) {
            visited.add(`${nx},${ny}`);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    // 3. Verify every room has at least one reachable tile
    // We check intersection between the room's rect and the visited set
    for (const leaf of collectedRooms) {
      if (!leaf.room) continue;

      let isRoomReachable = false;
      // Scan the room area
      for (let y = leaf.room.y; y < leaf.room.y + leaf.room.h; y++) {
        for (let x = leaf.room.x; x < leaf.room.x + leaf.room.w; x++) {
          if (visited.has(`${x},${y}`)) {
            isRoomReachable = true;
            break;
          }
        }
        if (isRoomReachable) break;
      }

      expect(isRoomReachable).toBe(true);
    }
  });
});
