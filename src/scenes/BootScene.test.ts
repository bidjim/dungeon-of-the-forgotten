import { describe, it, expect, vi, beforeEach } from "vitest";
import { BootScene } from "./BootScene";
import { ASSET_KEYS, ASSET_PATHS } from "../constants";

// Mock Phaser
vi.mock("phaser", () => {
  return {
    default: {
      Scene: class {
        load: any;
        anims: any;
        scene: any;

        constructor(key: string) {
          this.load = {
            spritesheet: vi.fn(),
          };
          this.anims = {
            create: vi.fn(),
            generateFrameNumbers: vi.fn().mockReturnValue([]),
          };
          this.scene = {
            start: vi.fn(),
          };
        }
      },
    },
  };
});

describe("BootScene", () => {
  let bootScene: BootScene;

  beforeEach(() => {
    bootScene = new BootScene();
  });

  it("should preload assets correctly", () => {
    bootScene.preload();

    expect(bootScene.load.spritesheet).toHaveBeenCalledWith(
      ASSET_KEYS.DUNGEON_TILES,
      ASSET_PATHS.DUNGEON_TILES,
      {
        frameWidth: 16,
        frameHeight: 16,
      }
    );

    expect(bootScene.load.spritesheet).toHaveBeenCalledWith(
      ASSET_KEYS.KNIGHT,
      ASSET_PATHS.KNIGHT,
      {
        frameWidth: 16,
        frameHeight: 24,
      }
    );
  });

  it("should create animations and start GameScene", () => {
    bootScene.create();

    // Verify animations are created
    expect(bootScene.anims.create).toHaveBeenCalledWith({
      key: "knight_idle",
      frames: expect.anything(), // We mock generateFrameNumbers, so the result is undefined or whatever the mock returns
      frameRate: 8,
      repeat: -1,
    });

    expect(bootScene.anims.create).toHaveBeenCalledWith({
      key: "knight_run",
      frames: expect.anything(),
      frameRate: 8,
      repeat: -1,
    });

    // Verify scene transition
    expect(bootScene.scene.start).toHaveBeenCalledWith("GameScene");
  });
});
