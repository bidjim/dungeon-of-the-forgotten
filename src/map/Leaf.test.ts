import { describe, it, expect } from "vitest";
import { Leaf } from "./Leaf";
import { MIN_LEAF_SIZE } from "./config";
import { Rect } from "../types/rect";

describe("Leaf", () => {
  describe("split", () => {
    it("should return false if the leaf is too small to split", () => {
      // MIN_LEAF_SIZE is 10. Max split size = dim - MIN_LEAF_SIZE.
      // If max <= MIN_LEAF_SIZE, it returns false.
      // So if dim <= 2 * MIN_LEAF_SIZE (20), it fails.
      const size = MIN_LEAF_SIZE * 2;
      const leaf = new Leaf(0, 0, size, size);
      const result = leaf.split();
      expect(result).toBe(false);
      expect(leaf.left).toBeNull();
      expect(leaf.right).toBeNull();
    });

    it("should return true if the leaf is large enough", () => {
      // 25 is > 20, so max = 15 > 10. Should split.
      const size = MIN_LEAF_SIZE * 2 + 5;
      const leaf = new Leaf(0, 0, size, size);
      const result = leaf.split();
      expect(result).toBe(true);
      expect(leaf.left).not.toBeNull();
      expect(leaf.right).not.toBeNull();
    });
  });

  describe("createRooms", () => {
    it("should generate a room strictly within the Leaf boundaries (considering padding)", () => {
      // Use a size that won't split to ensure room creation happens on this leaf
      const size = MIN_LEAF_SIZE * 2;
      const leaf = new Leaf(0, 0, size, size);

      // Force room creation without splitting
      leaf.createRooms();

      expect(leaf.room).not.toBeNull();
      if (leaf.room) {
        // Check left/top bounds (padding is handled by randomInt logic inside createRooms)
        // roomX = randomInt(1, ...), so x >= leaf.x + 1
        expect(leaf.room.x).toBeGreaterThanOrEqual(leaf.x + 1);
        expect(leaf.room.y).toBeGreaterThanOrEqual(leaf.y + 1);

        // Check right/bottom bounds
        // right edge = x + w. Logic ensures room fits inside w - 2 space.
        // So x + w <= leaf.x + leaf.w - 1
        expect(leaf.room.x + leaf.room.w).toBeLessThanOrEqual(
          leaf.x + leaf.w - 1
        );
        expect(leaf.room.y + leaf.room.h).toBeLessThanOrEqual(
          leaf.y + leaf.h - 1
        );
      }
    });
  });

  describe("createHall", () => {
    it("should add rectangles that physically overlap both room1 and room2", () => {
      // Helper to check if two rects intersect
      const intersect = (r1: Rect, r2: Rect) => {
        return (
          r1.x < r2.x + r2.w &&
          r1.x + r1.w > r2.x &&
          r1.y < r2.y + r2.h &&
          r1.y + r1.h > r2.y
        );
      };

      const leaf = new Leaf(0, 0, 100, 100);
      const room1: Rect = { x: 10, y: 10, w: 10, h: 10 };
      const room2: Rect = { x: 50, y: 50, w: 10, h: 10 };

      leaf.createHall(room1, room2);

      expect(leaf.halls.length).toBeGreaterThan(0);

      // Verify at least one hall segment touches/overlaps room1
      const touchesRoom1 = leaf.halls.some((hall) => intersect(hall, room1));
      expect(touchesRoom1).toBe(true);

      // Verify at least one hall segment touches/overlaps room2
      const touchesRoom2 = leaf.halls.some((hall) => intersect(hall, room2));
      expect(touchesRoom2).toBe(true);
    });
  });
});
