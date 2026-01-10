import { describe, it, expect, beforeEach } from "vitest";
import { DungeonManager } from "./DungeonManager";

describe("DungeonManager", () => {
  let manager: DungeonManager;

  beforeEach(() => {
    // @ts-ignore - Accessing private for testing reset
    DungeonManager.instance = undefined;
    manager = DungeonManager.getInstance();
  });

  it("should not overwrite entities when passing null to saveFloorState", async () => {
    const level = 1;
    // Mocking an existing floor state
    const mockFloor: any = {
      id: level,
      entities: [{ type: "goblin", x: 5, y: 5, hp: 10, isDead: false }],
      items: [],
      explorationMap: [[0]],
    };

    // Inject mock floor into private map
    (manager as any).floors.set(level, mockFloor);

    // Act: Save with null entities
    manager.saveFloorState(level, null, null, [[1]]);

    // Assert
    const floor = await manager.getFloor(level);
    expect(floor.entities).toHaveLength(1);
    expect(floor.entities[0].type).toBe("goblin");
    expect(floor.explorationMap[0][0]).toBe(1);
  });
});
