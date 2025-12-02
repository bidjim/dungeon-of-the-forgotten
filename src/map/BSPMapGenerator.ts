import { EMPTY_TILE_INDEX, FLOOR_KEYS, STAIRS_KEY } from "../constants";
import { Leaf } from "./Leaf";
import { MAX_LEAF_SIZE } from "./config";
import { Rect } from "../types/rect";
import { randomInt } from "../helper";

export class BSPMapGenerator {
  private width: number;
  private height: number;
  private root: Leaf;
  public map: number[][];
  public stairsLocation: { x: number; y: number; } | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.map = [];
    this.root = new Leaf(0, 0, width, height);
  }

  public generate(): number[][] {
    // 1. Initialize empty map with walls
    this.map = Array.from({ length: this.height }, () =>
      Array(this.width).fill(EMPTY_TILE_INDEX)
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

    // 5. Place Stairs
    const allRooms: Rect[] = [];
    this.getAllRooms(this.root, allRooms);

    if (allRooms.length > 0) {
      const chosenRoom = allRooms[randomInt(0, allRooms.length - 1)];
      const stairsX = randomInt(chosenRoom.x + 1, chosenRoom.x + chosenRoom.w - 2);
      const stairsY = randomInt(chosenRoom.y + 1, chosenRoom.y + chosenRoom.h - 2);
      this.safeSet(stairsX, stairsY, STAIRS_KEY);
      this.stairsLocation = { x: stairsX, y: stairsY };
    }


    return this.map;
  }

  private paintMap(leaf: Leaf): void {
    // Recursively paint children first
    if (leaf.left) this.paintMap(leaf.left);
    if (leaf.right) this.paintMap(leaf.right);

    const floorTile = Array.from(FLOOR_KEYS)[0];

    // Paint Room
    if (leaf.room) {
      for (let y = leaf.room.y; y < leaf.room.y + leaf.room.h; y++) {
        for (let x = leaf.room.x; x < leaf.room.x + leaf.room.w; x++) {
          this.safeSet(x, y, floorTile);
        }
      }
    }

    // Paint Halls
    if (leaf.halls && leaf.halls.length > 0) {
      for (const hall of leaf.halls) {
        for (let y = hall.y; y < hall.y + hall.h; y++) {
          for (let x = hall.x; x < hall.x + hall.w; x++) {
            this.safeSet(x, y, floorTile);
          }
        }
      }
    }
  }

  private getAllRooms(leaf: Leaf, rooms: Rect[]): void {
    if (leaf.room && !leaf.left && !leaf.right) {
      rooms.push(leaf.room);
    }
    if (leaf.left) {
      this.getAllRooms(leaf.left, rooms);
    }
    if (leaf.right) {
      this.getAllRooms(leaf.right, rooms);
    }
  }

  private safeSet(x: number, y: number, value: number) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.map[y][x] = value;
    }
  }
}
