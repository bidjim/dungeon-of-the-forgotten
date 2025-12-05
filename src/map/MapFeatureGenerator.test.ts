import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateWallLayers } from "./MapFeatureGenerator";

// 1. Mock the constants used in the source file
vi.mock("../constants", () => ({
  FLOOR_KEYS: new Set([1]), // 1 represents a generic floor tile
  EMPTY_TILE_INDEX: 0,
  WALL_KEYS: { WE: 101 },
  SIDE_WALL_KEYS: {
    LEFT: 201,
    RIGHT: 202,
    BOTTOM_LEFT: 203,
    BOTTOM_RIGHT: 204,
    LEFT_HOLLOW: 205,
    RIGHT_HOLLOW: 206,
  },
  WALL_TOP_KEYS: {
    WE: 301,
    BOTTOM: 302,
    BOTTOM_LEFT_DOT: 303,
    BOTTOM_RIGHT_DOT: 304,
  },
  GATE_KEYS: {
    BOTTOM_LEFT_DOOR: 901,
    BOTTOM_RIGHT_DOOR: 902,
  },
  STAIRS_KEYS: { UP: 999 },
}));

// Import constants locally to use in assertions
import { WALL_KEYS, WALL_TOP_KEYS } from "../constants";

describe("MapFeatureGenerator", () => {
  let mockMap: any;
  let mockTileset: any;
  let mockFloorLayer: any;
  let layers: Record<string, any>;

  beforeEach(() => {
    // Reset mocks before each test
    layers = {};

    // Helper to create a mock layer with spies
    const createMockLayer = (name: string) => ({
      name,
      putTileAt: vi.fn(),
      setDepth: vi.fn(),
      layer: { data: [], width: 0, height: 0 },
    });

    mockTileset = {}; // Generic object

    mockMap = {
      createBlankLayer: vi.fn((name) => {
        const layer = createMockLayer(name);
        layers[name] = layer;
        return layer;
      }),
    };

    // Setup a basic mock Floor Layer
    mockFloorLayer = {
      layer: {
        data: [],
        width: 3,
        height: 3,
      },
      // Simple implementation of forEachTile to iterate our grid
      forEachTile: vi.fn((callback) => {
        const grid = mockFloorLayer.layer.data;
        for (let y = 0; y < grid.length; y++) {
          for (let x = 0; x < grid[y].length; x++) {
            callback(grid[y][x]);
          }
        }
      }),
    };
  });

  it("Autotiling Rules: Generates correct 'Island' walls for a single floor tile surrounded by empty tiles", () => {
    // Arrange: Create a 3x3 Grid
    // 0 = Empty, 1 = Floor
    // [0, 0, 0]
    // [0, 1, 0]  <-- The Island (x=1, y=1)
    // [0, 0, 0]
    const gridData = [
      [
        { index: 0, x: 0, y: 0 },
        { index: 0, x: 1, y: 0 },
        { index: 0, x: 2, y: 0 },
      ],
      [
        { index: 0, x: 0, y: 1 },
        { index: 1, x: 1, y: 1 },
        { index: 0, x: 2, y: 1 },
      ],
      [
        { index: 0, x: 0, y: 2 },
        { index: 0, x: 1, y: 2 },
        { index: 0, x: 2, y: 2 },
      ],
    ];

    mockFloorLayer.layer.data = gridData;
    mockFloorLayer.layer.width = 3;
    mockFloorLayer.layer.height = 3;

    // Act
    generateWallLayers(mockMap, mockTileset, mockFloorLayer);

    const wallUpper = layers["Wall Upper"];
    const wallLower = layers["Wall Lower"];
    const wallTopUpper = layers["Wall Top Upper"];
    const wallTopLower = layers["Wall Top Lower"];

    // Assert: North Wall Logic (Because y-1 is empty)
    // Expect Base Wall at (1, 0)
    expect(wallUpper.putTileAt).toHaveBeenCalledWith(WALL_KEYS.WE, 1, 0);
    // Expect Wall Top Decor at (1, -1) (Usually 2 tiles above floor)
    expect(wallTopUpper.putTileAt).toHaveBeenCalledWith(
      WALL_TOP_KEYS.WE,
      1,
      -1
    ); // y - 2

    // Assert: South Wall Logic (Because y+1 is empty)
    // Expect Base Wall at (1, 1) (Same y as floor, but on 'Wall Lower' layer)
    expect(wallLower.putTileAt).toHaveBeenCalledWith(WALL_KEYS.WE, 1, 1);

    // Assert: Top Lower logic (The cap of the lower wall)
    // In an island scenario with empty sides, it often creates a "Bottom" cap
    // The code logic for South wall with empty sides eventually places WALL_TOP_KEYS.BOTTOM
    expect(wallTopLower.putTileAt).toHaveBeenCalledWith(
      WALL_TOP_KEYS.BOTTOM,
      1,
      0
    ); // y - 1
  });

  it("Layer Depth: Verifies that 'Wall Top Upper' is set to depth 2", () => {
    // Arrange: Setup Minimal Grid (doesn't matter for depth check, but needed to run)
    const gridData = [[{ index: 0, x: 0, y: 0 }]];
    mockFloorLayer.layer.data = gridData;
    mockFloorLayer.layer.width = 1;
    mockFloorLayer.layer.height = 1;

    // Act
    generateWallLayers(mockMap, mockTileset, mockFloorLayer);

    // Assert
    const wallTopUpper = layers["Wall Top Upper"];
    const wallUpper = layers["Wall Upper"];
    const wallLower = layers["Wall Lower"];

    // Specific Requirement: Wall Top Upper must be above player (Depth 2)
    expect(wallTopUpper.setDepth).toHaveBeenCalledWith(2);

    // Verification of other layers to ensure relative correctness (Optional based on prompt)
    expect(wallUpper.setDepth).toHaveBeenCalledWith(0);
    expect(wallLower.setDepth).toHaveBeenCalledWith(1);
  });
});
