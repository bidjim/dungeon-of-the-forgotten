import { GATE_KEYS, STAIRS_KEYS } from "../constants";
import { Leaf } from "./Leaf";
import { randomInt } from "../helper";
import { SafeSetFunction } from "../types/map";

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
  // Find a room for stairs down that is different from the top-left room (where the gate is).
  const otherRooms = allRooms.filter((leaf) => leaf.room !== topLeftRoom);

  if (otherRooms.length === 0) {
    console.warn(
      "No other rooms available to place stairs down. Placing in topLeftRoom as fallback."
    );
    // Fallback: if there are no other rooms, place in topLeftRoom
    const stairsDownX = randomInt(
      topLeftRoom.x + 1,
      topLeftRoom.x + topLeftRoom.w - 2
    );
    const stairsDownY = randomInt(
      topLeftRoom.y + 1,
      topLeftRoom.y + topLeftRoom.h - 2
    );
    safeSet(stairsDownX, stairsDownY, STAIRS_KEYS.DOWN);
    const nextFloorStairsLocation = { x: stairsDownX, y: stairsDownY };
    return {
      playerSpawn,
      gateLocation,
      entranceLocation,
      nextFloorStairsLocation,
    };
  }

  const stairsDownRoomLeaf = otherRooms[randomInt(0, otherRooms.length - 1)];
  const stairsDownRoom = stairsDownRoomLeaf.room!;

  // Place stairs down in the chosen room
  const stairsDownX = randomInt(
    stairsDownRoom.x + 1,
    stairsDownRoom.x + stairsDownRoom.w - 2
  );
  const stairsDownY = randomInt(
    stairsDownRoom.y + 1,
    stairsDownRoom.y + stairsDownRoom.h - 2
  );

  safeSet(stairsDownX, stairsDownY, STAIRS_KEYS.DOWN);
  const nextFloorStairsLocation = { x: stairsDownX, y: stairsDownY };

  return {
    playerSpawn,
    gateLocation,
    entranceLocation,
    nextFloorStairsLocation,
  };
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
  // Select two different rooms for stairs up and stairs down
  if (allRooms.length < 2) {
    console.warn(
      "Not enough rooms to place stairs up and down in separate rooms. Placing them in the same room as fallback."
    );
    // Fallback: if only one room, place both in it
    const chosenRoomLeaf = allRooms[randomInt(0, allRooms.length - 1)];
    const chosenRoom = chosenRoomLeaf.room!;

    const playerX = randomInt(
      chosenRoom.x + 1,
      chosenRoom.x + chosenRoom.w - 2
    );
    const playerY = chosenRoom.y + chosenRoom.h - 2;

    const playerSpawn = { x: playerX, y: playerY };
    const entranceLocation = { ...playerSpawn };

    let previousFloorStairsLocation: { x: number; y: number } | undefined;
    let nextFloorStairsLocation: { x: number; y: number } | undefined;

    const stairsUpX = playerX;
    const stairsUpY = playerY + 1;

    if (
      stairsUpX >= chosenRoom.x + 1 &&
      stairsUpX <= chosenRoom.x + chosenRoom.w - 2 &&
      stairsUpY >= chosenRoom.y + 1 &&
      stairsUpY <= chosenRoom.y + chosenRoom.h - 2
    ) {
      safeSet(stairsUpX, stairsUpY, STAIRS_KEYS.UP);
      previousFloorStairsLocation = { x: stairsUpX, y: stairsUpY };
    } else {
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

    let stairsDownX: number = randomInt(
      chosenRoom.x + 1,
      chosenRoom.x + chosenRoom.w - 2
    );
    let stairsDownY: number = randomInt(
      chosenRoom.y + 1,
      chosenRoom.y + chosenRoom.h - 2
    );

    let attempts = 0;
    const maxAttempts = 10;
    while (
      ((stairsDownX === playerSpawn.x && stairsDownY === playerSpawn.y) ||
        (previousFloorStairsLocation &&
          stairsDownX === previousFloorStairsLocation.x &&
          stairsDownY === previousFloorStairsLocation.y)) &&
      attempts < maxAttempts
    ) {
      stairsDownX = randomInt(
        chosenRoom.x + 1,
        chosenRoom.x + chosenRoom.w - 2
      );
      stairsDownY = randomInt(
        chosenRoom.y + 1,
        chosenRoom.y + chosenRoom.h - 2
      );
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error(
        "Failed to find a unique spot for stairs down after multiple attempts."
      );
    }
    // Only set if a unique spot was found
    safeSet(stairsDownX, stairsDownY, STAIRS_KEYS.DOWN);
    nextFloorStairsLocation = { x: stairsDownX, y: stairsDownY };

    return {
      playerSpawn,
      previousFloorStairsLocation,
      nextFloorStairsLocation,
      entranceLocation,
    };
  } // This is the correct closing brace for the `if (allRooms.length < 2)` block

  // Choose two distinct rooms
  const roomIndices = Array.from({ length: allRooms.length }, (_, i) => i);
  const firstRoomIndex = randomInt(0, roomIndices.length - 1);
  const chosenRoomForPlayerAndStairsUp = allRooms[firstRoomIndex].room!;
  roomIndices.splice(firstRoomIndex, 1); // Remove the first chosen room index

  const secondRoomIndex = randomInt(0, roomIndices.length - 1);
  const chosenRoomForStairsDown = allRooms[roomIndices[secondRoomIndex]].room!;

  // Place player spawn and stairs up in the first chosen room
  const playerX = randomInt(
    chosenRoomForPlayerAndStairsUp.x + 1,
    chosenRoomForPlayerAndStairsUp.x + chosenRoomForPlayerAndStairsUp.w - 2
  );
  const playerY =
    chosenRoomForPlayerAndStairsUp.y + chosenRoomForPlayerAndStairsUp.h - 2;

  const playerSpawn = { x: playerX, y: playerY };
  const entranceLocation = { ...playerSpawn };

  let previousFloorStairsLocation: { x: number; y: number } | undefined;
  let nextFloorStairsLocation: { x: number; y: number } | undefined;

  const stairsUpX = playerX;
  const stairsUpY = playerY + 1;

  if (
    stairsUpX >= chosenRoomForPlayerAndStairsUp.x + 1 &&
    stairsUpX <=
      chosenRoomForPlayerAndStairsUp.x + chosenRoomForPlayerAndStairsUp.w - 2 &&
    stairsUpY >= chosenRoomForPlayerAndStairsUp.y + 1 &&
    stairsUpY <=
      chosenRoomForPlayerAndStairsUp.y + chosenRoomForPlayerAndStairsUp.h - 2
  ) {
    safeSet(stairsUpX, stairsUpY, STAIRS_KEYS.UP);
    previousFloorStairsLocation = { x: stairsUpX, y: stairsUpY };
  } else {
    // Fallback if stairs can't be placed ideally, try above or beside
    if (playerY - 1 >= chosenRoomForPlayerAndStairsUp.y + 1) {
      safeSet(playerX, playerY - 1, STAIRS_KEYS.UP);
      previousFloorStairsLocation = { x: playerX, y: playerY - 1 };
    } else if (
      playerX + 1 <=
      chosenRoomForPlayerAndStairsUp.x + chosenRoomForPlayerAndStairsUp.w - 2
    ) {
      safeSet(playerX + 1, playerY, STAIRS_KEYS.UP);
      previousFloorStairsLocation = { x: playerX + 1, y: playerY };
    } else if (playerX - 1 >= chosenRoomForPlayerAndStairsUp.x + 1) {
      safeSet(playerX - 1, playerY, STAIRS_KEYS.UP);
      previousFloorStairsLocation = { x: playerX - 1, y: playerY };
    } else {
      console.warn(
        "Could not place previous floor stairs ideally near player spawn."
      );
    }
  }

  // Place stairs down in the second chosen room
  let stairsDownX: number = randomInt(
    chosenRoomForStairsDown.x + 1,
    chosenRoomForStairsDown.x + chosenRoomForStairsDown.w - 2
  );
  let stairsDownY: number = randomInt(
    chosenRoomForStairsDown.y + 1,
    chosenRoomForStairsDown.y + chosenRoomForStairsDown.h - 2
  );

  let attempts = 0;
  const maxAttempts = 10;
  // Make sure stairsDown is not on the same tile as previousFloorStairsLocation
  // PlayerSpawn is in a different room, so no need to check against it.
  while (
    previousFloorStairsLocation &&
    stairsDownX === previousFloorStairsLocation.x &&
    stairsDownY === previousFloorStairsLocation.y &&
    attempts < maxAttempts
  ) {
    stairsDownX = randomInt(
      chosenRoomForStairsDown.x + 1,
      chosenRoomForStairsDown.x + chosenRoomForStairsDown.w - 2
    );
    stairsDownY = randomInt(
      chosenRoomForStairsDown.y + 1,
      chosenRoomForStairsDown.y + chosenRoomForStairsDown.h - 2
    );
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error(
      "Failed to find a unique spot for stairs down after multiple attempts in a separate room."
    );
  }

  safeSet(stairsDownX, stairsDownY, STAIRS_KEYS.DOWN);
  nextFloorStairsLocation = { x: stairsDownX, y: stairsDownY };

  return {
    playerSpawn,
    previousFloorStairsLocation,
    nextFloorStairsLocation,
    entranceLocation,
  };
}
