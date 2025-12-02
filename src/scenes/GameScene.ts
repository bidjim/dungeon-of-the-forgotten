import { ASSET_KEYS, DEBUG_MAP } from "../constants";
import Phaser from "phaser";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";
import { generateWallLayers } from "../map/WallGenerator";
import { BSPMapGenerator } from "../map/BSPMapGenerator";
import { MapGenerationResult } from "../types/map"; // New import

const MAP_WIDTH = 50; // In tiles
const MAP_HEIGHT = 50; // In tiles
const TILE_SIZE = 16; // In pixels

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private mapGenerator!: BSPMapGenerator;
  private currentFloor: number = 1; // New property
  private map!: Phaser.Tilemaps.Tilemap;
  private fadedTiles: Phaser.Tilemaps.Tile[] = [];

  constructor() {
    super("GameScene");
  }

  create(data?: { floor: number }) {
    if (data && data.floor) {
      this.currentFloor = data.floor;
    }

    const cursors = this.input.keyboard!.createCursorKeys();

    const joystickConfig = createJoystickConfig(this);
    const joystick = (this.plugins.get("rexVirtualJoystick") as any).add(
      this,
      joystickConfig
    );
    joystick.setScrollFactor(0);

    let mapResult: MapGenerationResult;

    if (DEBUG_MAP) {
      this.map = this.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });
      // For debug map, we'll just hardcode a player spawn and no interactions for now
      mapResult = {
        map: [], // Not used for debug map
        playerSpawn: { x: 10, y: 10 }, // Default debug spawn
        entranceLocation: { x: 10, y: 10 },
      };
    } else {
      this.mapGenerator = new BSPMapGenerator(MAP_WIDTH, MAP_HEIGHT);
      mapResult = this.mapGenerator.generate(this.currentFloor); // Pass currentFloor
      this.map = this.make.tilemap({
        data: mapResult.map, // Use map data from result
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
      });
    }

    const tileset = this.map.addTilesetImage(
      ASSET_KEYS.TILESET,
      ASSET_KEYS.DUNGEON_TILES
    );

    if (!tileset) {
      throw new Error("Failed to load dungeon tileset.");
    }

    const floorLayer = this.map.createLayer(0, tileset)!;
    floorLayer.replaceByIndex(-1, 0);
    floorLayer.setCollision(0);

    this.physics.world.bounds.width = this.map.widthInPixels;
    this.physics.world.bounds.height = this.map.heightInPixels;

    generateWallLayers(this.map, tileset, floorLayer);

    // --- Player Creation ---
    const playerWorldX = mapResult.playerSpawn.x * TILE_SIZE + TILE_SIZE / 2;
    const playerWorldY = mapResult.playerSpawn.y * TILE_SIZE + TILE_SIZE / 2;

    this.player = new Player(
      this,
      playerWorldX,
      playerWorldY,
      ASSET_KEYS.KNIGHT,
      cursors,
      joystick
    );
    this.physics.add.collider(this.player, floorLayer);

    // --- Interaction Objects (Gate/Stairs) ---
    if (mapResult.gateLocation) {
      const gateWorldX =
        mapResult.gateLocation.x * TILE_SIZE +
        (mapResult.gateLocation.width * TILE_SIZE) / 2;
      const gateWorldY = mapResult.gateLocation.y * TILE_SIZE + TILE_SIZE / 2;
      const gate = this.createInteractionObject(
        gateWorldX,
        gateWorldY,
        mapResult.gateLocation.width * TILE_SIZE,
        mapResult.gateLocation.height * TILE_SIZE,
        "gate"
      );
      this.physics.add.overlap(
        this.player,
        gate,
        this.onInteractionOverlap,
        undefined,
        this
      );
    }

    if (mapResult.nextFloorStairsLocation) {
      const stairsWorldX =
        mapResult.nextFloorStairsLocation.x * TILE_SIZE + TILE_SIZE / 2;
      const stairsWorldY =
        mapResult.nextFloorStairsLocation.y * TILE_SIZE + TILE_SIZE / 2;
      const stairs = this.createInteractionObject(
        stairsWorldX,
        stairsWorldY,
        TILE_SIZE,
        TILE_SIZE,
        "stair_down"
      );
      this.physics.add.overlap(
        this.player,
        stairs,
        this.onInteractionOverlap,
        undefined,
        this
      );
    }

    if (mapResult.previousFloorStairsLocation) {
      const stairsWorldX =
        mapResult.previousFloorStairsLocation.x * TILE_SIZE + TILE_SIZE / 2;
      const stairsWorldY =
        mapResult.previousFloorStairsLocation.y * TILE_SIZE + TILE_SIZE / 2;
      const stairs = this.createInteractionObject(
        stairsWorldX,
        stairsWorldY,
        TILE_SIZE,
        TILE_SIZE,
        "stair_up"
      );
      this.physics.add.overlap(
        this.player,
        stairs,
        this.onInteractionOverlap,
        undefined,
        this
      );
    }

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
  }

  update() {
    this.player.update();
    this.handlePlayerTransparency();
  }

  private handlePlayerTransparency() {
    // Restore alpha for previously faded tiles
    this.fadedTiles.forEach((tile) => (tile.alpha = 1));
    this.fadedTiles = [];

    // Check overlaps
    const playerTileX = this.map.worldToTileX(this.player.x)!;
    const playerTileY = this.map.worldToTileY(this.player.y)!;

    // Layers that are drawn "above" the floor and might obscure the player
    // "Wall Lower" corresponds to south wall faces (depth 1)
    // "Wall Top Lower" corresponds to south wall tops (depth 2)
    const obscuringLayers = ["Wall Lower", "Wall Top Lower"];

    obscuringLayers.forEach((layerName) => {
      // Check the tile the player is on, and the one immediately above (for head overlap)
      [0, -1].forEach((yOffset) => {
        const tile = this.map.getTileAt(
          playerTileX,
          playerTileY + yOffset,
          false,
          layerName
        );

        if (tile) {
          tile.alpha = 0.6;
          this.fadedTiles.push(tile);
        }
      });
    });
  }

  private createInteractionObject(
    x: number,
    y: number,
    width: number,
    height: number,
    type: string
  ): Phaser.GameObjects.Sprite {
    const object = this.physics.add.sprite(x, y, "transparent");
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
  ) {
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
      this.currentFloor--; // Go up one floor
      if (this.currentFloor < 1) this.currentFloor = 1; // Prevent going below floor 1
      this.scene.restart({ floor: this.currentFloor });
    } else if (type === "stair_down") {
      this.currentFloor++; // Go down one floor
      this.scene.restart({ floor: this.currentFloor });
    }
  }
}
