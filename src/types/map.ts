export type MapGenerationResult = {
  map: number[][];
  playerSpawn: { x: number; y: number };
  stairsLocation?: { x: number; y: number }; // For going down to the next floor
  gateLocation?: { x: number; y: number; width: number; height: number }; // For the first floor to town
  previousFloorStairsLocation?: { x: number; y: number }; // For going up to the previous floor (next to player)
  entranceLocation?: { x: number; y: number }; // The exact tile the player spawns on the new floor (within the playerSpawn rectangle)
};
