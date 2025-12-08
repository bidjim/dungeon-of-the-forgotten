import {
  FloorData,
  EntityState,
  ItemState,
  MapGenerationResult,
} from "./types/map";
import { BSPMapGenerator } from "./map/BSPMapGenerator"; // Assuming this is the map generator
import { MAP_HEIGHT, MAP_WIDTH } from "./constants"; // Assuming map dimensions are in constants

// Placeholder types for Entity and Item until they are properly defined
interface Entity {
  id: string; // Unique ID for the entity
  type: string;
  x: number;
  y: number;
  hp: number;
  isDead: boolean;
  getSerializableState(): EntityState; // Method to get state for saving
}

interface Item {
  id: string; // Unique ID for the item
  type: string;
  x: number;
  y: number;
  isOpened: boolean; // For chests, etc.
  getSerializableState(): ItemState; // Method to get state for saving
}

class DungeonManager {
  private static instance: DungeonManager;
  private floors: Map<number, FloorData>;

  private constructor() {
    this.floors = new Map<number, FloorData>();
  }

  public static getInstance(): DungeonManager {
    if (!DungeonManager.instance) {
      DungeonManager.instance = new DungeonManager();
    }
    return DungeonManager.instance;
  }

  /**
   * Returns existing floor data or generates a new one if it doesn't exist.
   * @param level The level number of the floor to retrieve.
   * @returns FloorData for the specified level.
   */
  public getFloor(level: number): FloorData {
    if (this.floors.has(level)) {
      return this.floors.get(level)!;
    }

    console.log(`Generating new floor for level: ${level}`);
    const mapGenerator = new BSPMapGenerator(MAP_WIDTH, MAP_HEIGHT);
    const generationResult: MapGenerationResult = mapGenerator.generate(level); // Pass level to generate, and call generate()

    // Determine stairs locations. For simplicity, let's assume they are always present after generation.
    // In a real scenario, you might want to ensure these are always set by the generator or handle their absence.
    if (
      !generationResult.previousFloorStairsLocation ||
      !generationResult.nextFloorStairsLocation
    ) {
      throw new Error(
        `Map generation for level ${level} did not provide required stairs locations.`
      );
    }

    const newFloor: FloorData = {
      id: level,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      tileData: generationResult.map,
      rooms: generationResult.rooms, // Use rooms directly from generationResult
      entities: [], // Initially empty, will be populated by game logic
      items: [], // Initially empty, will be populated by game logic
      stairs: {
        up: generationResult.previousFloorStairsLocation,
        down: generationResult.nextFloorStairsLocation,
      },
      explorationMap: Array(MAP_HEIGHT)
        .fill(0)
        .map(() => Array(MAP_WIDTH).fill(0)), // All unseen
    };

    this.floors.set(level, newFloor);
    return newFloor;
  }

  /**
   * Updates the state of the current floor before leaving it.
   * This saves the current state of entities, items, and exploration data.
   * @param level The level number of the floor to save.
   * @param entities An array of current entities on the floor.
   * @param items An array of current items on the floor.
   * @param exploration The current exploration map for the floor.
   */
  public saveFloorState(
    level: number,
    entities: Entity[],
    items: Item[],
    exploration: number[][]
  ): void {
    if (this.floors.has(level)) {
      const currentFloor = this.floors.get(level)!;
      currentFloor.entities = entities.map((e) => e.getSerializableState());
      currentFloor.items = items.map((i) => i.getSerializableState());
      currentFloor.explorationMap = exploration;
      console.log(`Saved state for floor ${level}`);
    } else {
      console.warn(
        `Attempted to save state for non-existent floor ${level}. This should not happen if getFloor is called first.`
      );
    }
  }
}

export { DungeonManager, Entity, Item };
