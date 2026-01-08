import { FloorData, Vector2 } from "../types/map";
import { EMPTY_TILE_INDEX } from "../constants/tiles";

export class SpawnManager {
  static getSpawnPoint(
    floorData: FloorData,
    cameFrom: "up" | "down" | "gate"
  ): Vector2 {
    let rawPoint: Vector2 | null = null;

    if (floorData.id === 1 && floorData.gate && cameFrom === "gate") {
      rawPoint = { x: floorData.gate.x, y: floorData.gate.y + 2 };
    } else if (cameFrom === "down" && floorData.stairs.up) {
      rawPoint = { x: floorData.stairs.up.x + 1, y: floorData.stairs.up.y };
    } else if (cameFrom === "up" && floorData.stairs.down) {
      rawPoint = { x: floorData.stairs.down.x - 1, y: floorData.stairs.down.y };
    }

    if (rawPoint && this.isWalkable(floorData, rawPoint.x, rawPoint.y)) {
      return rawPoint;
    }

    if (
      floorData.stairs.up &&
      this.isWalkable(
        floorData,
        floorData.stairs.up.x,
        floorData.stairs.up.y + 1
      )
    ) {
      return { x: floorData.stairs.up.x, y: floorData.stairs.up.y + 1 };
    }

    return this.getRoomCenter(floorData, 0);
  }

  private static isWalkable(data: FloorData, x: number, y: number): boolean {
    if (y < 0 || y >= data.tileData.length) return false;
    if (x < 0 || x >= data.tileData[y].length) return false;
    return data.tileData[y][x] !== EMPTY_TILE_INDEX;
  }

  private static getRoomCenter(data: FloorData, roomIndex: number): Vector2 {
    const room = data.rooms[roomIndex];
    if (!room) return { x: 10, y: 10 };
    return {
      x: Math.floor(room.x + room.w / 2),
      y: Math.floor(room.y + room.h / 2),
    };
  }
}
