// src/types/map.ts

// Helper interface for a rectangular area
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Helper interface for a room
export interface Room extends Rectangle {
  // Rooms might have additional properties later, e.g., doors, contents
}
