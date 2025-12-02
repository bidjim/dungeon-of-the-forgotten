import {
  EMPTY_TILE_INDEX,
  FLOOR_KEYS,
  GATE_KEYS,
  STAIRS_KEY,
} from "../constants";
import { Leaf } from "./Leaf";
import { MAX_LEAF_SIZE } from "./config";
import { randomInt } from "../helper";
import { MapGenerationResult } from "../types/map";

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
    let previousFloorStairsLocation: { x: number; y: number } | undefined;
    let entranceLocation: { x: number; y: number } | undefined;

    if (floorNumber === 1) {
      // First floor: player spawns at top-left, big gate to town
      // Find the top-leftmost room
      allRooms.sort((a, b) => {
        if (!a.room || !b.room) return 0;
        // Sort primarily by y, then by x
        if (a.room.y !== b.room.y) return a.room.y - b.room.y;
        return a.room.x - b.room.x;
      });
      const topLeftRoom = allRooms[0].room!;

      // Player spawns at top-left of the room, away from walls
      playerSpawn = {
        x: topLeftRoom.x + 1,
        y: topLeftRoom.y + 1,
      };
      entranceLocation = { ...playerSpawn }; // Player enters here

      // --- Gate Placement Logic ---
      const gateWidth = 2;
      const gateHeight = 1; // It's 2x1, so height is 1 tile.

      // Gate should be at y-1 from the uppermost floor tiles of the top-left room.
      // The uppermost floor tiles are at topLeftRoom.y. So, gateY is topLeftRoom.y - 1.
      let gateY = topLeftRoom.y - 1;

      // Center the gate horizontally on the top wall of the room.
      let gateX = topLeftRoom.x + Math.floor((topLeftRoom.w - gateWidth) / 2);

      // Ensure the gate is within bounds and doesn't overlap room corners if possible.
      // It should span across the top wall of the room, so its x coordinates should be relative to the room's x coordinates.
      // Minimum x should be topLeftRoom.x (start of the room's top wall)
      // Maximum x should be topLeftRoom.x + topLeftRoom.w - gateWidth (end of the room's top wall)
      if (gateX < topLeftRoom.x) {
        gateX = topLeftRoom.x; // Align to the left edge of the room's top wall
      }
      if (gateX + gateWidth > topLeftRoom.x + topLeftRoom.w) {
        gateX = topLeftRoom.x + topLeftRoom.w - gateWidth; // Align to the right edge
      }

      // Ensure gateY is not out of bounds (e.g., above the map)
      if (gateY < 0) {
        console.warn(
          "Gate Y coordinate calculated to be out of map bounds (above 0). Adjusting to 0."
        );
        gateY = 0;
      }

      gateLocation = {
        x: gateX,
        y: gateY,
        width: gateWidth,
        height: gateHeight,
      };

      // Place the GATE_KEYS at the calculated wall position.
      // It will overwrite the EMPTY_TILE_INDEX which would later become a wall.
      this.safeSet(gateLocation.x, gateLocation.y, GATE_KEYS.BOTTOM_LEFT_DOOR);
      this.safeSet(
        gateLocation.x + 1,
        gateLocation.y,
        GATE_KEYS.BOTTOM_RIGHT_DOOR
      );
    } else {
      // Second and more floors: random spawn, stairs to previous floor
      const chosenRoomLeaf = allRooms[randomInt(0, allRooms.length - 1)];
      const chosenRoom = chosenRoomLeaf.room!;

      // Player spawns at least y-1 from the most bottom part of the room
      // This means y_spawn = chosenRoom.y + chosenRoom.h - 2 (1 for bottom wall, 1 for buffer)
      // And x_spawn is random within the room, away from side walls
      const playerX = randomInt(
        chosenRoom.x + 1,
        chosenRoom.x + chosenRoom.w - 2
      );
      const playerY = chosenRoom.y + chosenRoom.h - 2; // y-1 from bottom wall

      playerSpawn = { x: playerX, y: playerY };
      entranceLocation = { ...playerSpawn }; // Player enters here

      // Place stairs to previous floor next to the player (e.g., just below the player)
      const stairsX = playerX;
      const stairsY = playerY + 1; // One tile below player

      // Ensure stairs are within the room boundaries and not overlapping with other map features if possible
      if (
        stairsX >= chosenRoom.x + 1 &&
        stairsX <= chosenRoom.x + chosenRoom.w - 2 &&
        stairsY >= chosenRoom.y + 1 &&
        stairsY <= chosenRoom.y + chosenRoom.h - 2
      ) {
        this.safeSet(stairsX, stairsY, STAIRS_KEY);
        previousFloorStairsLocation = { x: stairsX, y: stairsY };
      } else {
        // Fallback if stairs can't be placed ideally, try above or beside
        // For simplicity, we'll try to find a spot. This might need more robust logic
        // but for now, if y+1 is out, try y-1, then x+1, x-1.
        if (playerY - 1 >= chosenRoom.y + 1) {
          this.safeSet(playerX, playerY - 1, STAIRS_KEY);
          previousFloorStairsLocation = { x: playerX, y: playerY - 1 };
        } else if (playerX + 1 <= chosenRoom.x + chosenRoom.w - 2) {
          this.safeSet(playerX + 1, playerY, STAIRS_KEY);
          previousFloorStairsLocation = { x: playerX + 1, y: playerY };
        } else if (playerX - 1 >= chosenRoom.x + 1) {
          this.safeSet(playerX - 1, playerY, STAIRS_KEY);
          previousFloorStairsLocation = { x: playerX - 1, y: playerY };
        } else {
          console.warn(
            "Could not place previous floor stairs ideally near player spawn."
          );
        }
      }
    }

    if (!playerSpawn) {
      throw new Error("Failed to determine player spawn location.");
    }

    return {
      map: this.map,
      playerSpawn: playerSpawn,
      gateLocation: gateLocation,
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
