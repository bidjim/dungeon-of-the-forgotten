import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameScene } from "./GameScene";
import { Player } from "../Player";

// Mock Player
vi.mock("../Player", () => {
  return {
    Player: vi.fn().mockImplementation(function () {
      return {
        update: vi.fn(),
      };
    }),
  };
});

// Mock Phaser
vi.mock("phaser", () => {
  return {
    default: {
      Scene: class {
        input: any;
        add: any;
        plugins: any;
        cameras: any;

        constructor(key: string) {
          this.input = {
            keyboard: {
              createCursorKeys: vi.fn().mockReturnValue({}),
            },
          };
          this.add = {
            circle: vi.fn(),
          };
          this.plugins = {
            get: vi.fn().mockReturnValue({
              add: vi.fn().mockReturnValue({
                setScrollFactor: vi.fn(),
              }),
            }),
          };
          this.cameras = {
            main: {
              startFollow: vi.fn(),
            },
          };
        }
      },
    },
  };
});

describe("GameScene", () => {
  let gameScene: GameScene;

  beforeEach(() => {
    gameScene = new GameScene();
  });

  it("should create Player instance", () => {
    gameScene.create();
    expect(Player).toHaveBeenCalled();
  });

  it("should add Joystick plugin", () => {
    gameScene.create();
    expect(gameScene.plugins.get).toHaveBeenCalledWith("rexVirtualJoystick");
  });
});
