import Phaser from "phaser";
import { ASSET_KEYS, DEBUG_MAP } from "../constants";
import { Player } from "../Player";
import { createJoystickConfig } from "../config/joystickConfig";
import { FloorData } from "../types/map";
import { InteractionManager } from "../managers/InteractionManager";
import { MapManager } from "../managers/MapManager";
import { SpawnManager } from "../managers/SpawnManager";
import VirtualJoyStickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

const TILE_SIZE = 16;

interface GameSceneData {
  floorData: FloorData;
  cameFrom?: "up" | "down" | "gate";
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private currentFloorData!: FloorData;
  private mapManager!: MapManager;
  private cameFrom: "up" | "down" | "gate" = "gate";

  constructor() {
    super("GameScene");
  }

  create(data: GameSceneData) {
    this.currentFloorData = data.floorData;
    this.cameFrom = data.cameFrom || "gate";

    const cursors = this.input.keyboard!.createCursorKeys();
    const joystickPlugin = this.plugins.get(
      "rexVirtualJoystick"
    ) as VirtualJoyStickPlugin;
    const joystick = joystickPlugin.add(this, createJoystickConfig(this));
    joystick.setScrollFactor(0);

    this.mapManager = new MapManager(this);
    const map = this.mapManager.init(this.currentFloorData);

    const spawnPoint = DEBUG_MAP
      ? { x: 10, y: 10 }
      : SpawnManager.getSpawnPoint(this.currentFloorData, this.cameFrom);

    this.player = new Player(
      this,
      spawnPoint.x * TILE_SIZE + TILE_SIZE / 2,
      spawnPoint.y * TILE_SIZE + TILE_SIZE / 2,
      ASSET_KEYS.KNIGHT,
      cursors,
      joystick
    );

    this.physics.add.collider(this.player, this.mapManager.getFloorLayer());

    const interactionManager = new InteractionManager(
      this,
      this.player,
      map,
      this.currentFloorData,
      this.currentFloorData.id,
      this.currentFloorData.explorationMap
    );
    interactionManager.setupInteractions();

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
  }

  update() {
    this.player?.update();
    this.mapManager.updateTransparency(this.player);
  }
}
