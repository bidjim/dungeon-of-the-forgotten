import { Rect } from "./rect";
import { Vector2 } from "./vector";

export type MapGenerationResult = {
  map: number[][];
  rooms: Rect[]; // Add rooms here
  playerSpawn: Vector2;
  nextFloorStairsLocation: Vector2 | null; // For going down to the next floor
  gateLocation: { x: number; y: number; width: number; height: number } | null; // For the first floor to town
  previousFloorStairsLocation: Vector2 | null; // For going up to the previous floor (next to player)
  entranceLocation: Vector2 | null; // The exact tile the player spawns on the new floor (within the playerSpawn rectangle)
};

// Define a type for the safeSet function that will be passed in
export type SafeSetFunction = (x: number, y: number, value: number) => void;
