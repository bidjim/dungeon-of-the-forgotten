import { GATE_KEYS, STAIRS_KEY } from "../constants";
import { Leaf } from "./Leaf";
import { randomInt } from "../helper";

// Define a type for the safeSet function that will be passed in
type SafeSetFunction = (x: number, y: number, value: number) => void;

export function placeFirstFloorElements(
  map: number[][],
  width: number,
  height: number,
  safeSet: SafeSetFunction,
  allRooms: Leaf[]
): {
  playerSpawn: { x: number; y: number };
  gateLocation:
    | { x: number; y: number; width: number; height: number }
    | undefined;
  entranceLocation: { x: number; y: number };
} {
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
  const playerSpawn = {
    x: topLeftRoom.x + 1,
    y: topLeftRoom.y + 1,
  };
  const entranceLocation = { ...playerSpawn }; // Player enters here

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

  const gateLocation = {
    x: gateX,
    y: gateY,
    width: gateWidth,
    height: gateHeight,
  };

  // Place the GATE_KEYS at the calculated wall position.
  // It will overwrite the EMPTY_TILE_INDEX which would later become a wall.
  safeSet(gateLocation.x, gateLocation.y, GATE_KEYS.BOTTOM_LEFT_DOOR);
  safeSet(gateLocation.x + 1, gateLocation.y, GATE_KEYS.BOTTOM_RIGHT_DOOR);

  return { playerSpawn, gateLocation, entranceLocation };
}

export function placeSubsequentFloorElements(
  map: number[][],
  width: number,
  height: number,
  safeSet: SafeSetFunction,
  allRooms: Leaf[]
): {
  playerSpawn: { x: number; y: number };
  previousFloorStairsLocation: { x: number; y: number } | undefined;
  entranceLocation: { x: number; y: number };
} {
  // Second and more floors: random spawn, stairs to previous floor
  const chosenRoomLeaf = allRooms[randomInt(0, allRooms.length - 1)];
  const chosenRoom = chosenRoomLeaf.room!;

  // Player spawns at least y-1 from the most bottom part of the room
  // This means y_spawn = chosenRoom.y + chosenRoom.h - 2 (1 for bottom wall, 1 for buffer)
  // And x_spawn is random within the room, away from side walls
  const playerX = randomInt(chosenRoom.x + 1, chosenRoom.x + chosenRoom.w - 2);
  const playerY = chosenRoom.y + chosenRoom.h - 2; // y-1 from bottom wall

  const playerSpawn = { x: playerX, y: playerY };
  const entranceLocation = { ...playerSpawn }; // Player enters here

  let previousFloorStairsLocation: { x: number; y: number } | undefined;

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
    safeSet(stairsX, stairsY, STAIRS_KEY);
    previousFloorStairsLocation = { x: stairsX, y: stairsY };
  } else {
    // Fallback if stairs can't be placed ideally, try above or beside
    // For simplicity, we'll try to find a spot. This might need more robust logic
    // but for now, if y+1 is out, try y-1, then x+1, x-1.
    if (playerY - 1 >= chosenRoom.y + 1) {
      safeSet(playerX, playerY - 1, STAIRS_KEY);
      previousFloorStairsLocation = { x: playerX, y: playerY - 1 };
    } else if (playerX + 1 <= chosenRoom.x + chosenRoom.w - 2) {
      safeSet(playerX + 1, playerY, STAIRS_KEY);
      previousFloorStairsLocation = { x: playerX + 1, y: playerY };
    } else if (playerX - 1 >= chosenRoom.x + 1) {
      safeSet(playerX - 1, playerY, STAIRS_KEY);
      previousFloorStairsLocation = { x: playerX - 1, y: playerY };
    } else {
      console.warn(
        "Could not place previous floor stairs ideally near player spawn."
      );
    }
  }
  return { playerSpawn, previousFloorStairsLocation, entranceLocation };
}
