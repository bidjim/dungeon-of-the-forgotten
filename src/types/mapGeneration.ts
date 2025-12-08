import { Rect } from "./rect";

export type MapGenerationResult = {
  map: number[][];
  rooms: Rect[]; // Add rooms here
  playerSpawn: { x: number; y: number };
  nextFloorStairsLocation?: { x: number; y: number }; // For going down to the next floor
  gateLocation?: { x: number; y: number; width: number; height: number }; // For the first floor to town
  previousFloorStairsLocation?: { x: number; y: number }; // For going up to the previous floor (next to player)
  entranceLocation?: { x: number; y: number }; // The exact tile the player spawns on the new floor (within the playerSpawn rectangle)
};

// Define a type for the safeSet function that will be passed in
export type SafeSetFunction = (x: number, y: number, value: number) => void;
