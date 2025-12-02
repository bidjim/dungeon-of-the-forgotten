import { GATE_KEYS, STAIRS_KEYS } from "../constants";
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
  nextFloorStairsLocation: { x: number; y: number } | undefined;
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

  // --- Stairs Down Placement Logic ---
  // Find the bottom-rightmost room
  allRooms.sort((a, b) => {
    if (!a.room || !b.room) return 0;
    // Sort primarily by y (descending), then by x (descending)
    if (a.room.y !== b.room.y) return b.room.y - a.room.y; // Largest Y first
    return b.room.x - a.room.x; // Largest X first
  });
  const bottomRightRoom = allRooms[0].room!;

  // Place stairs down in the bottom-right room, towards the center
  const stairsDownX = randomInt(
    bottomRightRoom.x + 1,
    bottomRightRoom.x + bottomRightRoom.w - 2
  );
  const stairsDownY = randomInt(
    bottomRightRoom.y + 1,
    bottomRightRoom.y + bottomRightRoom.h - 2
  );

  safeSet(stairsDownX, stairsDownY, STAIRS_KEYS.DOWN);
  const nextFloorStairsLocation = { x: stairsDownX, y: stairsDownY };

  console.log("First floor stairs down location:", nextFloorStairsLocation); // Debug log

  return { playerSpawn, gateLocation, entranceLocation, nextFloorStairsLocation };
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
  nextFloorStairsLocation: { x: number; y: number } | undefined;
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
  let nextFloorStairsLocation: { x: number; y: number } | undefined;

  // Place stairs to previous floor next to the player (e.g., just below the player)
  const stairsUpX = playerX;
  const stairsUpY = playerY + 1; // One tile below player

  // Ensure stairs are within the room boundaries and not overlapping with other map features if possible
  if (
    stairsUpX >= chosenRoom.x + 1 &&
    stairsUpX <= chosenRoom.x + chosenRoom.w - 2 &&
    stairsUpY >= chosenRoom.y + 1 &&
    stairsUpY <= chosenRoom.y + chosenRoom.h - 2
  ) {
    safeSet(stairsUpX, stairsUpY, STAIRS_KEYS.UP);
    previousFloorStairsLocation = { x: stairsUpX, y: stairsUpY };
  } else {
    // Fallback if stairs can't be placed ideally, try above or beside
    if (playerY - 1 >= chosenRoom.y + 1) {
      safeSet(playerX, playerY - 1, STAIRS_KEYS.UP);
      previousFloorStairsLocation = { x: playerX, y: playerY - 1 };
    } else if (playerX + 1 <= chosenRoom.x + chosenRoom.w - 2) {
      safeSet(playerX + 1, playerY, STAIRS_KEYS.UP);
      previousFloorStairsLocation = { x: playerX + 1, y: playerY };
    } else if (playerX - 1 >= chosenRoom.x + 1) {
      safeSet(playerX - 1, playerY, STAIRS_KEYS.UP);
      previousFloorStairsLocation = { x: playerX - 1, y: playerY };
    } else {
      console.warn(
        "Could not place previous floor stairs ideally near player spawn."
      );
    }
  }

  // --- Place Stairs Down for next floor ---
  // Find a suitable spot for stairs down, ideally in a different corner or opposite side of the room
  // to avoid overlap with stairs up and player spawn.
  let stairsDownX: number;
  let stairsDownY: number;

  // Try to place it in the top-right corner of the room, away from player spawn and stairs up
  // If player spawn is top-left, stairs up is bottom-left, try top-right for stairs down.
  // This logic should be more robust, but for now, let's pick a distinct corner.

  stairsDownX = randomInt(chosenRoom.x + 1, chosenRoom.x + chosenRoom.w - 2);
  stairsDownY = randomInt(chosenRoom.y + 1, chosenRoom.y + chosenRoom.h - 2);

  // Ensure stairsDown is not on the same tile as stairsUp or playerSpawn
  // This is a simple check; more complex logic might involve pathfinding or more intelligent placement
  // but for most rooms, a random spot should work.
  let attempts = 0;
  const maxAttempts = 10;
  while (
    (stairsDownX === playerSpawn.x && stairsDownY === playerSpawn.y) ||
    (previousFloorStairsLocation &&
      stairsDownX === previousFloorStairsLocation.x &&
      stairsDownY === previousFloorStairsLocation.y)
  ) {
    stairsDownX = randomInt(chosenRoom.x + 1, chosenRoom.x + chosenRoom.w - 2);
    stairsDownY = randomInt(chosenRoom.y + 1, chosenRoom.y + chosenRoom.h - 2);
    attempts++;
    if (attempts > maxAttempts) {
      console.warn(
        "Could not find a unique spot for stairs down after multiple attempts."
      );
      break;
    }
  }

  if (attempts <= maxAttempts) {
    safeSet(stairsDownX, stairsDownY, STAIRS_KEYS.DOWN);
    nextFloorStairsLocation = { x: stairsDownX, y: stairsDownY };
  }

  return {
    playerSpawn,
    previousFloorStairsLocation,
    nextFloorStairsLocation,
    entranceLocation,
  };
}
