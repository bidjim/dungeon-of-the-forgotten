import Phaser from "phaser";
import { FloorData } from "../types/map";
import { DungeonManager } from "../managers/DungeonManager";
import { DEBUG_MAP } from "../constants";

interface LoadingSceneData {
  floor: number;
  cameFrom?: "up" | "down";
}

export class LoadingScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private width: number = 0;
  private height: number = 0;

  constructor() {
    super("LoadingScene");
  }

  init() {
    this.width = this.cameras.main.width;
    this.height = this.cameras.main.height;
  }

  preload() {
    // Create loading screen UI
    this.createLoadingScreen();
  }

  async create(data?: LoadingSceneData) {
    // Wait a bit to show the loading screen
    await this.sleep(500);

    // Load the floor data asynchronously
    const floorData = await this.loadFloorData(data?.floor || 1);

    // Transition to GameScene with the loaded data
    this.scene.start("GameScene", {
      floorData,
      cameFrom: data?.cameFrom,
    });

    // Clean up loading screen
    this.loadingText.destroy();
    this.progressBar.destroy();
    this.progressBox.destroy();
  }

  private createLoadingScreen() {
    // Background
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(
      this.width / 2 - 160,
      this.height / 2 - 30,
      320,
      60
    );
    this.progressBox.lineStyle(2, 0xffffff, 1);
    this.progressBox.strokeRect(
      this.width / 2 - 160,
      this.height / 2 - 30,
      320,
      60
    );

    // Progress bar background
    this.progressBar = this.add.graphics();
    this.progressBar.fillStyle(0x888888, 1);
    this.progressBar.fillRect(
      this.width / 2 - 150,
      this.height / 2 - 20,
      300,
      20
    );

    // Loading text
    this.loadingText = this.add.text(
      this.width / 2,
      this.height / 2 - 50,
      "Loading Dungeon...",
      {
        font: "24px Arial",
        color: "#ffffff",
      }
    );
    this.loadingText.setOrigin(0.5);

    // Center camera
    this.cameras.main.setBackgroundColor(0x000000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async loadFloorData(floor: number): Promise<FloorData> {
    // Show progress animation
    this.animateProgress();

    let floorData;

    // Load the floor data
    if (DEBUG_MAP) {
      // For debug map, we'll just hardcode a player spawn and no interactions for now
      floorData = {
        id: 1,
        width: 0, // Not used for debug map
        height: 0, // Not used for debug map
        tileData: [], // Not used for debug map
        rooms: [], // Not used for debug map
        entities: [], // Not used for debug map
        items: [], // Not used for debug map
        stairs: {
          up: null,
          down: null,
        },
        gate: null,
        explorationMap: [], // Not used for debug map
      };
    } else {
      floorData = await DungeonManager.getInstance().getFloor(floor);
    }

    return floorData;
  }

  private animateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      if (progress >= 1) {
        progress = 1;
        clearInterval(interval);
      }

      // Update progress bar
      this.progressBar.clear();
      this.progressBar.fillStyle(0x888888, 1);
      this.progressBar.fillRect(
        this.width / 2 - 150,
        this.height / 2 - 20,
        300,
        20
      );
      this.progressBar.fillStyle(0x00ff00, 1);
      this.progressBar.fillRect(
        this.width / 2 - 150,
        this.height / 2 - 20,
        300 * progress,
        20
      );
    }, 100);
  }
}
