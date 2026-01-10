import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameScene } from "./GameScene";
import { Player } from "../Player";
import { MapManager } from "../managers/MapManager";
import { InteractionManager } from "../managers/InteractionManager";

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

// 1. Mock MapManager
vi.mock("../managers/MapManager", () => {
  return {
    MapManager: vi.fn().mockImplementation(function () {
      return {
        init: vi.fn().mockReturnValue({
          widthInPixels: 100,
          heightInPixels: 100,
        }),
        getFloorLayer: vi.fn().mockReturnValue({}),
        updateFOV: vi.fn(),
        updateTransparency: vi.fn(),
      };
    }),
  };
});

// 2. Mock InteractionManager
vi.mock("../managers/InteractionManager", () => {
  return {
    InteractionManager: vi.fn().mockImplementation(function () {
      return {
        setupInteractions: vi.fn(),
      };
    }),
  };
});

// 3. Mock Player
vi.mock("../Player", () => {
  return {
    Player: vi.fn().mockImplementation(function () {
      return {
        update: vi.fn(),
        x: 0,
        y: 0,
      };
    }),
  };
});

// 4. Mock MapFeatureGenerator
vi.mock("../map/MapFeatureGenerator");

// 5. Mock Phaser
vi.mock("phaser", () => {
  return {
    default: {
      Scene: class {
        input: any;
        plugins: any;
        scene: any;

        constructor() {
          this.input = {
            keyboard: {
              createCursorKeys: vi.fn().mockReturnValue({
                up: {},
                down: {},
                left: {},
                right: {},
              }),
            },
          };
          this.plugins = {
            get: vi.fn().mockReturnValue({
              add: vi.fn().mockReturnValue({
                setScrollFactor: vi.fn(),
              }),
            }),
          };
          // Mock the scene manager for transitions
          this.scene = {
            start: vi.fn(),
          };
        }

        add = {
          existing: vi.fn(),
          circle: vi.fn(),
          zone: vi.fn().mockReturnValue({
            body: {},
          }),
        };
        make = { tilemap: vi.fn() };
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
              body: {},
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

    // Check constructor call
    expect(MapManager).toHaveBeenCalledWith(gameScene);

    // Check method call on the instance
    const mapManagerInstance = (MapManager as any).mock.results[0].value;
    expect(mapManagerInstance.init).toHaveBeenCalledWith(mockFloorData);
  });

  it("should initialize InteractionManager", () => {
    gameScene.create({ floorData: mockFloorData as any });
    expect(InteractionManager).toHaveBeenCalled();
  });
});
