import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameScene } from "./GameScene";
import { Player } from "../Player";

const mockFloorData = {
  id: 1,
  tileData: [
    [1, 1],
    [1, 1],
  ],
  rooms: [{ x: 0, y: 0, w: 2, h: 2 }],
  stairs: { up: null, down: null },
  gate: { x: 0, y: 0 },
  explorationMap: [
    [0, 0],
    [0, 0],
  ],
};

vi.mock("../map/MapFeatureGenerator");

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
  const mockTilemap = {
    addTilesetImage: vi.fn().mockReturnValue({}),
    createLayer: vi.fn().mockReturnValue({
      replaceByIndex: vi.fn(),
      setCollision: vi.fn(),
    }),
    worldToTileX: vi.fn().mockReturnValue(0),
    worldToTileY: vi.fn().mockReturnValue(0),
    getTileAt: vi.fn(),
    widthInPixels: 100,
    heightInPixels: 100,
  };

  return {
    default: {
      Scene: class {
        input: any;
        plugins: any;

        constructor(key: string) {
          this.input = {
            keyboard: {
              createCursorKeys: vi.fn().mockReturnValue({}),
            },
          };
          this.plugins = {
            get: vi.fn().mockReturnValue({
              add: vi.fn().mockReturnValue({
                setScrollFactor: vi.fn(),
              }),
            }),
          };
        }

        add = { existing: vi.fn(), circle: vi.fn(), zone: vi.fn() };
        make = { tilemap: vi.fn().mockReturnValue(mockTilemap) };
        physics = {
          add: {
            collider: vi.fn(),
            overlap: vi.fn(),
            existing: vi.fn(),
            sprite: vi.fn().mockReturnValue({
              setBodySize: vi.fn(),
              setImmovable: vi.fn(),
              setVisible: vi.fn(),
              setData: vi.fn(),
            }),
          },
          world: { bounds: {} },
        };
        cameras = { main: { startFollow: vi.fn(), setBounds: vi.fn() } };
      },
    },
  };
});

describe("GameScene", () => {
  let gameScene: GameScene;

  beforeEach(() => {
    gameScene = new GameScene();
  });

  it("should create Player instance with floor data", () => {
    gameScene.create({ floorData: mockFloorData as any });
    expect(Player).toHaveBeenCalled();
  });

  it("should initialize MapManager through create", () => {
    gameScene.create({ floorData: mockFloorData as any });
    expect(gameScene.make.tilemap).toHaveBeenCalled();
  });
});
