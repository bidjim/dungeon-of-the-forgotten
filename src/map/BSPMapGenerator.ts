import { Leaf } from "./Leaf";
import { MAX_LEAF_SIZE } from "./config";

export class BSPMapGenerator {
  private width: number;
  private height: number;
  private root: Leaf;
  public map: number[][]; // 2D array: '#' for wall, '.' for floor

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.map = [];
    this.root = new Leaf(0, 0, width, height);
  }

  public generate(): number[][] {
    // 1. Initialize empty map with walls
    this.map = Array.from({ length: this.height }, () =>
      Array(this.width).fill(0)
    );

    // 2. Build the Tree
    const leaves: Leaf[] = [this.root];
    let didSplit = true;

    // Loop until no more splits can happen
    while (didSplit) {
      didSplit = false;
      for (const leaf of leaves) {
        // If this leaf has no children...
        if (leaf.left === null && leaf.right === null) {
          // Check if it's too big or just random chance
          if (
            leaf.w > MAX_LEAF_SIZE ||
            leaf.h > MAX_LEAF_SIZE ||
            Math.random() > 0.25
          ) {
            if (leaf.split()) {
              // Push new children to array
              leaves.push(leaf.left!);
              leaves.push(leaf.right!);
              didSplit = true;
            }
          }
        }
      }
    }

    // 3. Create Rooms (This recursively creates halls too)
    this.root.createRooms();

    // 4. Paint the result onto the 2D grid
    this.paintMap(this.root);

    return this.map;
  }

  private paintMap(leaf: Leaf): void {
    // Recursively paint children first
    if (leaf.left) this.paintMap(leaf.left);
    if (leaf.right) this.paintMap(leaf.right);

    // Paint Room
    if (leaf.room) {
      for (let y = leaf.room.y; y < leaf.room.y + leaf.room.h; y++) {
        for (let x = leaf.room.x; x < leaf.room.x + leaf.room.w; x++) {
          this.safeSet(x, y, 129);
        }
      }
    }

    // Paint Halls
    if (leaf.halls && leaf.halls.length > 0) {
      for (const hall of leaf.halls) {
        for (let y = hall.y; y < hall.y + hall.h; y++) {
          for (let x = hall.x; x < hall.x + hall.w; x++) {
            this.safeSet(x, y, 129);
          }
        }
      }
    }
  }

  private safeSet(x: number, y: number, value: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.map[y][x] = value;
    }
  }
}
