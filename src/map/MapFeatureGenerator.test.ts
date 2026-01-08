import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateFeatureLayers } from "./MapFeatureGenerator";
import {
  FLOOR_TILE,
  GATE_KEYS,
  STAIRS_KEYS,
  WALL_KEYS,
  DIR,
  EMPTY_TILE_INDEX,
} from "../constants/tiles";
import { LAYER_DEPTHS } from "../constants/layers";

// Mock Phaser Tile object
const createMockTile = (x: number, y: number, index: number) => ({
  x,
  y,
  index,
});

// Mock Phaser Layer object
const createMockLayer = (name: string) => ({
  name,
  putTileAt: vi.fn(),
  setDepth: vi.fn(),
  layer: { data: [] as any[][], width: 0, height: 0 },
});

describe("MapFeatureGenerator Integration", () => {
  let mockMap: any;
  let mockTileset: any;
  let mockFloorLayer: any;
  let layerMocks: Record<string, any>;

  beforeEach(() => {
    vi.clearAllMocks();
    layerMocks = {};

    mockTileset = { name: "main-tileset" };

    mockMap = {
      createBlankLayer: vi.fn((name) => {
        const layer = createMockLayer(name);
        layerMocks[name] = layer;
        return layer;
      }),
    };
  });

  const setupGrid = (data: number[][]) => {
    const height = data.length;
    const width = data[0]?.length || 0;
    const grid = data.map((row, y) =>
      row.map((index, x) => createMockTile(x, y, index))
    );

    mockFloorLayer = {
      layer: {
        data: grid,
        width,
        height,
      },
      forEachTile: vi.fn((callback) => {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            callback(grid[y][x]);
          }
        }
      }),
    };
  };

  it("should initialize all required layers with correct depths", () => {
    setupGrid([[FLOOR_TILE]]);
    generateFeatureLayers(mockMap, mockTileset, mockFloorLayer);

    expect(layerMocks["Gate"].setDepth).toHaveBeenCalledWith(LAYER_DEPTHS.GATE);
    expect(layerMocks["Stairs"].setDepth).toHaveBeenCalledWith(
      LAYER_DEPTHS.STAIRS
    );
    expect(layerMocks["Wall Upper"].setDepth).toHaveBeenCalledWith(
      LAYER_DEPTHS.WALL_UPPER
    );
    expect(layerMocks["Wall Top Upper"].setDepth).toHaveBeenCalledWith(
      LAYER_DEPTHS.WALL_TOP_UPPER
    );
    expect(layerMocks["Wall Lower"].setDepth).toHaveBeenCalledWith(
      LAYER_DEPTHS.WALL_LOWER
    );
    expect(layerMocks["Wall Top Lower"].setDepth).toHaveBeenCalledWith(
      LAYER_DEPTHS.WALL_TOP_LOWER
    );
  });

  it("should place multi-tile gate structures when a gate bottom is detected", () => {
    // Place a Bottom Left Door at 5,5
    setupGrid([
      [EMPTY_TILE_INDEX, EMPTY_TILE_INDEX],
      [EMPTY_TILE_INDEX, GATE_KEYS.BOTTOM_LEFT_DOOR],
    ]);

    generateFeatureLayers(mockMap, mockTileset, mockFloorLayer);

    const gateLayer = layerMocks["Gate"];
    // Verifies the vertical stacking logic in gates.ts
    expect(gateLayer.putTileAt).toHaveBeenCalledWith(
      GATE_KEYS.MIDDLE_LEFT_DOOR,
      1,
      0
    ); // y - 1
    expect(gateLayer.putTileAt).toHaveBeenCalledWith(
      GATE_KEYS.TOP_LEFT_DOOR,
      1,
      -1
    ); // y - 2
  });

  it("should blend stairs into the surrounding environment", () => {
    // Stairs at 1,1 surrounded by a floor tile at 1,0 (North)
    setupGrid([
      [EMPTY_TILE_INDEX, FLOOR_TILE, EMPTY_TILE_INDEX],
      [EMPTY_TILE_INDEX, STAIRS_KEYS.UP, EMPTY_TILE_INDEX],
    ]);

    generateFeatureLayers(mockMap, mockTileset, mockFloorLayer);

    const stairsLayer = layerMocks["Stairs"];
    // Should adopt the index of the first non-empty neighbor (FLOOR_TILE)
    expect(stairsLayer.putTileAt).toHaveBeenCalledWith(FLOOR_TILE, 1, 1);
  });

  it("should generate correct island walls for a single isolated floor tile", () => {
    // 3x3 grid with floor in middle
    setupGrid([
      [0, 0, 0],
      [0, FLOOR_TILE, 0],
      [0, 0, 0],
    ]);

    generateFeatureLayers(mockMap, mockTileset, mockFloorLayer);

    const upperWallLayer = layerMocks["Wall Upper"];

    // North Wall Rule check: Since neighbors are empty, it should use DIR.E (fallback) or DIR.W
    // Based on northWallRules.ts: fallback is WALL_KEYS[DIR.E] at offsetY: -1
    expect(upperWallLayer.putTileAt).toHaveBeenCalledWith(
      WALL_KEYS[DIR.E],
      1,
      0 // floor is at y=1, wall is at y-1
    );
  });

  it("should not crash when floor tile is at the top-left boundary (0,0)", () => {
    setupGrid([
      [FLOOR_TILE, 0],
      [0, 0],
    ]);

    // This triggers getIndex with x-1, y-1 (out of bounds)
    expect(() => {
      generateFeatureLayers(mockMap, mockTileset, mockFloorLayer);
    }).not.toThrow();
  });

  it("should ignore tiles that are not in WALL_GENERATING_TILES", () => {
    const UNKNOWN_TILE = 999;
    setupGrid([[UNKNOWN_TILE]]);

    generateFeatureLayers(mockMap, mockTileset, mockFloorLayer);

    // Wall layers should remain empty
    expect(layerMocks["Wall Upper"].putTileAt).not.toHaveBeenCalled();
    expect(layerMocks["Wall Lower"].putTileAt).not.toHaveBeenCalled();
  });

  it("should generate top edge tiles when north-west neighbor is empty", () => {
    // Floor at 1,1. Empty at 0,0 (North West).
    // This should trigger rules in northWallTopEdgeRules.ts
    setupGrid([
      [0, FLOOR_TILE, FLOOR_TILE],
      [FLOOR_TILE, FLOOR_TILE, FLOOR_TILE],
    ]);

    generateFeatureLayers(mockMap, mockTileset, mockFloorLayer);

    const topEdgeLayer = layerMocks["Wall Top Upper Edge"];
    // Verify that some tile was placed on the edge layer
    expect(topEdgeLayer.putTileAt).toHaveBeenCalled();
  });
});
