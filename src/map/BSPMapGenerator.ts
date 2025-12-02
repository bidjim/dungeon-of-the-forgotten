import { EMPTY_TILE_INDEX, FLOOR_KEYS } from "../constants";
import { Leaf } from "./Leaf";
import { MAX_LEAF_SIZE } from "./config";
import { MapGenerationResult } from "../types/map";
import {
  placeFirstFloorElements,
  placeSubsequentFloorElements,
} from "./MapElementPlacer";

export class BSPMapGenerator {
  private width: number;
  private height: number;
  private root: Leaf;
  public map: number[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.map = [];
    this.root = new Leaf(0, 0, width, height);
  }

  public generate(floorNumber: number = 1): MapGenerationResult {
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

    // Collect all rooms
    const allRooms: Leaf[] = [];
    this.getAllRooms(this.root, allRooms);

    if (allRooms.length === 0) {
      throw new Error("No rooms generated in the dungeon.");
    }

    let playerSpawn: { x: number; y: number } | undefined;
    let gateLocation:
      | { x: number; y: number; width: number; height: number }
      | undefined;
    let nextFloorStairsLocation: { x: number; y: number } | undefined;
    let previousFloorStairsLocation: { x: number; y: number } | undefined;
    let entranceLocation: { x: number; y: number } | undefined;

    const safeSetWrapper = (x: number, y: number, value: number) =>
      this.safeSet(x, y, value);

    if (floorNumber === 1) {
      const result = placeFirstFloorElements(
        this.map,
        this.width,
        this.height,
        safeSetWrapper,
        allRooms
      );
      playerSpawn = result.playerSpawn;
      gateLocation = result.gateLocation;
      entranceLocation = result.entranceLocation;
      nextFloorStairsLocation = result.nextFloorStairsLocation;
    } else {
      const result = placeSubsequentFloorElements(
        this.map,
        this.width,
        this.height,
        safeSetWrapper,
        allRooms
      );
      playerSpawn = result.playerSpawn;
      previousFloorStairsLocation = result.previousFloorStairsLocation;
      entranceLocation = result.entranceLocation;
      nextFloorStairsLocation = result.nextFloorStairsLocation;
    }

    if (!playerSpawn) {
      throw new Error("Failed to determine player spawn location.");
    }

    return {
      map: this.map,
      playerSpawn: playerSpawn,
      gateLocation: gateLocation,
      nextFloorStairsLocation: nextFloorStairsLocation,
      previousFloorStairsLocation: previousFloorStairsLocation,
      entranceLocation: entranceLocation,
    };
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

  private getAllRooms(leaf: Leaf, rooms: Leaf[]): void {
    if (leaf.room && !leaf.left && !leaf.right) {
      rooms.push(leaf); // Push the leaf, not just the room rect
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
