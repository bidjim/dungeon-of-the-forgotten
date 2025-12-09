import { ACCEPTABLE_PATHFINDING_TILES } from "../constants";
import * as EasyStar from "easystarjs";

export class PathValidator {
  /**
   * Validates that a path exists from start to end using A* pathfinding
   * @param map - The 2D map array
   * @param startX - Starting X coordinate
   * @param startY - Starting Y coordinate
   * @param endX - Ending X coordinate
   * @param endY - Ending Y coordinate
   * @returns True if a valid path exists, false otherwise
   */
  static async validatePath(
    map: number[][],
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const astar = new EasyStar.js();

      // Convert the map to a format EasyStar can understand
      const grid = map.map((row) => [...row]);

      astar.setGrid(grid);
      astar.setAcceptableTiles(ACCEPTABLE_PATHFINDING_TILES);

      // Find path with a callback
      astar.findPath(startX, startY, endX, endY, (path) => {
        if (path === null) {
          // No path exists
          resolve(false);
        } else {
          // Path exists
          resolve(true);
        }
      });

      // Calculate the path with a timeout to prevent hanging
      astar.calculate();

      // Add a timeout to prevent infinite hanging
      setTimeout(() => {
        resolve(false); // Assume no path if it takes too long
      }, 5000); // 5 second timeout
    });
  }

  /**
   * Validates the map has a playable path from entrance to exit
   * @param map - The 2D map array
   * @param floorNumber - The current floor number
   * @param entranceLocation - The entrance location
   * @param exitLocation - The exit location (stairs down or gate)
   * @returns True if the map is valid, false otherwise
   */
  static async validateMapPath(
    map: number[][],
    floorNumber: number,
    entranceLocation: { x: number; y: number },
    exitLocation: { x: number; y: number }
  ): Promise<boolean> {
    try {
      return await this.validatePath(
        map,
        entranceLocation.x,
        entranceLocation.y,
        exitLocation.x,
        exitLocation.y
      );
    } catch (error) {
      console.error("Path validation error:", error);
      return false;
    }
  }
}
