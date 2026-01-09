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
  private isTransitioning: boolean = false;

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
    object.setData("type", type);
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
    if (this.isTransitioning) return; // Guard clause

    if (!(gameObject1 instanceof Player)) return;
    if (!(gameObject2 instanceof Phaser.GameObjects.GameObject)) return;

    const type = gameObject2.getData("type");
    if (!type) return;

    if (type === "stair_up" || type === "stair_down") {
      this.isTransitioning = true; // Engage lock

      const floorManager = DungeonManager.getInstance();

      // Get live data from manager
      const currentExploration = this.mapManager.getExplorationMap();

      floorManager.saveFloorState(
        this.currentFloorData.id,
        [], // TODO: Integrate with EntityManager
        [], // TODO: Integrate with ItemManager
        currentExploration
      );

      const newFloor =
        type === "stair_up"
          ? Math.max(1, this.currentFloor - 1)
          : this.currentFloor + 1;
      const direction = type === "stair_up" ? "up" : "down";

      this.scene.scene.start("LoadingScene", {
        floor: newFloor,
        cameFrom: direction,
      });
    }
  }
}
