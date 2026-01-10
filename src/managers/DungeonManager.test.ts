import { describe, it, expect } from "vitest";
import { DungeonManager } from "./DungeonManager";
import { EntityState } from "../types/entity";

describe("DungeonManager", () => {
  it("should not overwrite entities when passing null to saveFloorState", async () => {
    const manager = DungeonManager.getInstance();
    const initialEntities: EntityState[] = [];
    // ... setup floor with initialEntities ...
    manager.saveFloorState(1, null, null, [[]]);
    const floor = await manager.getFloor(1);
    expect(floor.entities).toEqual(initialEntities);
  });
});
