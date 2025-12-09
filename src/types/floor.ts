import { Rect } from "./rect";
import { Vector2 } from "./vector";
import { EntityState } from "./entity";
import { ItemState } from "./item";

export interface FloorData {
  id: number; // e.g., 1, 2, 3
  width: number;
  height: number;
  tileData: number[][]; // The 0/1 grid
  rooms: Rect[]; // Room coordinates (for spawning logic)
  entities: EntityState[]; // Saved state of enemies (type, x, y, hp, isDead)
  items: ItemState[]; // Saved state of chests/pickups (isOpened)
  stairs: {
    up: Vector2 | null; // Position of stairs leading to prev floor, can be null for level 1
    down: Vector2 | null; // Position of stairs leading to next floor, also can be null for the last floor
  };
  explorationMap: number[][]; // 0=Unseen, 1=Explored (Fog of War memory)
}
