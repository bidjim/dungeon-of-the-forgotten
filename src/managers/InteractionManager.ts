import Phaser from "phaser";
import { Player } from "../Player";
import { DungeonManager } from "./DungeonManager";
import { FloorData } from "../types/map";

const TILE_SIZE = 16; // In pixels

export class InteractionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private map: Phaser.Tilemaps.Tilemap;
  private currentFloorData: FloorData;
  private currentFloor: number;
  private explorationMap: number[][];

  constructor(
    scene: Phaser.Scene,
    player: Player,
    map: Phaser.Tilemaps.Tilemap,
    currentFloorData: FloorData,
    currentFloor: number,
    explorationMap: number[][]
  ) {
    this.scene = scene;
    this.player = player;
    this.map = map;
    this.currentFloorData = currentFloorData;
    this.currentFloor = currentFloor;
    this.explorationMap = explorationMap;
  }

  public setupInteractions(): void {
    if (this.currentFloorData.stairs.down) {
      const stairsWorldX =
        this.currentFloorData.stairs.down.x * TILE_SIZE + TILE_SIZE / 2;
      const stairsWorldY =
        this.currentFloorData.stairs.down.y * TILE_SIZE + TILE_SIZE / 2;
      const stairs = this.createInteractionObject(
        stairsWorldX,
        stairsWorldY,
        TILE_SIZE,
        TILE_SIZE,
        "stair_down"
      );
      this.scene.physics.add.overlap(
        this.player,
        stairs,
        this
          .onInteractionOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }

    if (this.currentFloorData.stairs.up) {
      const stairsWorldX =
        this.currentFloorData.stairs.up.x * TILE_SIZE + TILE_SIZE / 2;
      const stairsWorldY =
        this.currentFloorData.stairs.up.y * TILE_SIZE + TILE_SIZE / 2;
      const stairs = this.createInteractionObject(
        stairsWorldX,
        stairsWorldY,
        TILE_SIZE,
        TILE_SIZE,
        "stair_up"
      );
      this.scene.physics.add.overlap(
        this.player,
        stairs,
        this
          .onInteractionOverlap as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this
      );
    }
  }

  private createInteractionObject(
    x: number,
    y: number,
    width: number,
    height: number,
    type: string
  ): Phaser.GameObjects.Sprite {
    const object = this.scene.physics.add.sprite(x, y, "transparent");
    object.setBodySize(width, height);
    object.setImmovable(true);
    object.setVisible(false);
    object.setData("type", type); // Store type for overlap handler
    return object;
  }

  private onInteractionOverlap(
    gameObject1:
      | Phaser.GameObjects.GameObject
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile,
    gameObject2:
      | Phaser.GameObjects.GameObject
      | Phaser.Physics.Arcade.Body
      | Phaser.Physics.Arcade.StaticBody
      | Phaser.Tilemaps.Tile
  ): void {
    if (!(gameObject1 instanceof Player)) {
      console.warn("Overlap detected with non-Player object:", gameObject1);
      return;
    }
    const player = gameObject1 as Player;
    const object = gameObject2 as Phaser.GameObjects.Sprite;
    const type = object.getData("type");

    if (type === "gate") {
      // TODO: Make this a proper town transition. For now, it's a placeholder.
      // this.scene.restart({ floor: 1 });
    } else if (type === "stair_up") {
      DungeonManager.getInstance().saveFloorState(
        this.currentFloorData.id, // Use the ID of the current floor being left
        [], // Empty array for entities for now
        [], // Empty array for items for now
        this.explorationMap // Pass the current exploration map
      );
      let newFloor = this.currentFloor - 1;
      if (newFloor < 1) newFloor = 1; // Prevent going below floor 1
      this.scene.scene.restart({ floor: newFloor, cameFrom: 'up' });
    } else if (type === "stair_down") {
      DungeonManager.getInstance().saveFloorState(
        this.currentFloorData.id, // Use the ID of the current floor being left
        [], // Empty array for entities for now
        [], // Empty array for items for now
        this.explorationMap // Pass the current exploration map
      );
      const newFloor = this.currentFloor + 1;
      this.scene.scene.restart({ floor: newFloor, cameFrom: 'down' });
    }
  }
}
