import {
  FloorData,
  EntityState,
  ItemState,
  MapGenerationResult,
} from "../types/map";
import { BSPMapGenerator } from "../map/BSPMapGenerator"; // Assuming this is the map generator
import { MAP_HEIGHT, MAP_WIDTH } from "../constants"; // Assuming map dimensions are in constants

class DungeonManager {
  private static instance: DungeonManager;
  private floors: Map<number, FloorData>;
  private generationRequests: Map<number, Promise<FloorData>> = new Map();

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
  public async getFloor(level: number): Promise<FloorData> {
    const existingFloor = this.floors.get(level);
    if (existingFloor) return existingFloor;

    if (this.generationRequests.has(level)) {
      return this.generationRequests.get(level)!;
    }

    const generationPromise = (async () => {
      try {
        console.log(`Generating new floor for level: ${level}`);
        const mapGenerator = new BSPMapGenerator(MAP_WIDTH, MAP_HEIGHT);
        const generationResult: MapGenerationResult =
          await mapGenerator.generate(level);

        const missingStairs =
          (level === 1 && !generationResult.nextFloorStairsLocation) ||
          (level !== 1 &&
            (!generationResult.previousFloorStairsLocation ||
              !generationResult.nextFloorStairsLocation));

        if (missingStairs) {
          throw new Error(
            `Map generation for level ${level} did not provide required stairs locations.`
          );
        }

        const newFloor: FloorData = {
          id: level,
          width: MAP_WIDTH,
          height: MAP_HEIGHT,
          tileData: generationResult.map,
          rooms: generationResult.rooms,
          entities: [],
          items: [],
          stairs: {
            up:
              level === 1
                ? null
                : generationResult.previousFloorStairsLocation || null,
            down: generationResult.nextFloorStairsLocation || null,
          },
          gate: generationResult.gateLocation || null,
          explorationMap: Array(MAP_HEIGHT)
            .fill(0)
            .map(() => Array(MAP_WIDTH).fill(0)),
        };

        newFloor.entities = this.generateInitialEntities(newFloor);

        this.floors.set(level, newFloor);
        return newFloor;
      } finally {
        this.generationRequests.delete(level);
      }
    })();

    this.generationRequests.set(level, generationPromise);
    return generationPromise;
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
    entities: EntityState[] | null,
    items: ItemState[] | null,
    exploration: number[][]
  ): void {
    if (this.floors.has(level)) {
      const currentFloor = this.floors.get(level)!;
      if (entities) currentFloor.entities = entities;
      if (items) currentFloor.items = items;
      currentFloor.explorationMap = exploration;
    }
  }

  private generateInitialEntities(floor: FloorData): EntityState[] {
    // Logic to pick random rooms and spawn monsters
    return [];
  }
}

export { DungeonManager };
