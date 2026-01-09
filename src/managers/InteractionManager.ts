import Phaser from "phaser";
import { Player } from "../Player";
import { DungeonManager } from "./DungeonManager";
import { FloorData } from "../types/map";
import { MapManager } from "./MapManager";

const TILE_SIZE = 16; // In pixels

export class InteractionManager {
  private scene: Phaser.Scene;
  private player: Player;
  private map: Phaser.Tilemaps.Tilemap;
  private currentFloorData: FloorData;
  private currentFloor: number;
  private mapManager: MapManager;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    map: Phaser.Tilemaps.Tilemap,
    currentFloorData: FloorData,
    currentFloor: number,
    mapManager: MapManager
  ) {
    this.scene = scene;
    this.player = player;
    this.map = map;
    this.currentFloorData = currentFloorData;
    this.currentFloor = currentFloor;
    this.mapManager = mapManager;
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
    // 1. Ensure the first object is the Player
    if (!(gameObject1 instanceof Player)) return;

    // 2. Safely check if the second object is a GameObject capable of holding data
    if (!(gameObject2 instanceof Phaser.GameObjects.GameObject)) return;

    const type = gameObject2.getData("type");
    if (!type) return;

    const floorManager = DungeonManager.getInstance();

    switch (type) {
      case "stair_up": {
        floorManager.saveFloorState(
          this.currentFloorData.id,
          [],
          [],
          this.mapManager.getExplorationMap()
        );
        const newFloor = Math.max(1, this.currentFloor - 1);
        this.scene.scene.start("LoadingScene", {
          floor: newFloor,
          cameFrom: "up",
        });
        break;
      }

      case "stair_down": {
        floorManager.saveFloorState(
          this.currentFloorData.id,
          [],
          [],
          this.mapManager.getExplorationMap()
        );
        const newFloor = this.currentFloor + 1;
        this.scene.scene.start("LoadingScene", {
          floor: newFloor,
          cameFrom: "down",
        });
        break;
      }

      case "gate": {
        // TODO: Implement proper town transition logic
        console.log("Gate interaction triggered");
        break;
      }

      default:
        break;
    }
  }
}
