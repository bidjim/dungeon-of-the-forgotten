import Phaser from "phaser";
import { ASSET_KEYS, DEBUG_MAP } from "../constants";
import { generateFeatureLayers } from "../map/MapFeatureGenerator";
import { FloorData } from "../types/map";

const TILE_SIZE = 16;

export class MapManager {
  private scene: Phaser.Scene;
  private map!: Phaser.Tilemaps.Tilemap;
  private floorLayer!: Phaser.Tilemaps.TilemapLayer;
  private fadedTiles: Phaser.Tilemaps.Tile[] = [];
  private obscuringLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  private fovLayer!: Phaser.Tilemaps.TilemapLayer;
  private explorationMap: number[][] = [];
  private visionRadius: number = 8;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  init(floorData: FloorData): Phaser.Tilemaps.Tilemap {
    if (DEBUG_MAP) {
      this.map = this.scene.make.tilemap({ key: ASSET_KEYS.DUNGEON_TILES });
    } else {
      this.map = this.scene.make.tilemap({
        data: floorData.tileData,
        tileWidth: TILE_SIZE,
        tileHeight: TILE_SIZE,
      });
    }

    const tileset = this.map.addTilesetImage(
      ASSET_KEYS.TILESET,
      ASSET_KEYS.DUNGEON_TILES
    );

    if (!tileset) throw new Error("Failed to load dungeon tileset.");

    this.floorLayer = this.map.createLayer(0, tileset)!;
    this.floorLayer.replaceByIndex(-1, 0);
    this.floorLayer.setCollision(0);

    generateFeatureLayers(this.map, tileset, this.floorLayer);

    const layerNames = ["Wall Lower", "Wall Top Lower"];
    this.obscuringLayers = layerNames
      .map((name) => this.map.getLayer(name)?.tilemapLayer)
      .filter((l): l is Phaser.Tilemaps.TilemapLayer => l !== null);

    this.explorationMap = floorData.explorationMap;
    this.createFogTexture(); // Safe creation

    // Create an empty map for the fog tiles
    const fogMap = this.scene.make.tilemap({
      data: Array(this.map.height)
        .fill(0)
        .map(() => Array(this.map.width).fill(0)),
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const fogTileset = fogMap.addTilesetImage(
      "fog-tiles",
      "fog-tiles",
      TILE_SIZE,
      TILE_SIZE,
      0,
      0
    );
    this.fovLayer = fogMap.createLayer(0, fogTileset!)!;
    this.fovLayer.setDepth(100);

    // Set initial visual state based on saved explorationMap
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const state = this.explorationMap[y][x];
        if (state >= 1) {
          this.fovLayer.putTileAt(1, x, y);

          // Vertical extension logic
          const tile = this.floorLayer.getTileAt(x, y);
          if (tile && tile.index === 0 && y > 0) {
            const tileAboveState = this.explorationMap[y - 1][x];
            // Only extension if the tile above isn't also revealed
            if (tileAboveState < 1) {
              this.fovLayer.putTileAt(1, x, y - 1);
            }
          }
        } else {
          this.fovLayer.putTileAt(0, x, y);
        }
      }
    }

    return this.map;
  }

  getFloorLayer(): Phaser.Tilemaps.TilemapLayer {
    return this.floorLayer;
  }

  updateTransparency(player: Phaser.GameObjects.Sprite) {
    this.fadedTiles.forEach((tile) => (tile.alpha = 1));
    this.fadedTiles = [];

    const playerTileX = this.map.worldToTileX(player.x)!;
    const playerTileY = this.map.worldToTileY(player.y)!;

    for (const layer of this.obscuringLayers) {
      // Check the tile the player is on and the tile immediately above
      for (let yOffset = 0; yOffset >= -1; yOffset--) {
        const targetX = playerTileX;
        const targetY = playerTileY + yOffset;

        const tile = layer.getTileAt(targetX, targetY);

        // Only fade if the base tile is currently visible (state 2)
        if (tile && this.explorationMap[targetY][targetX] === 2) {
          tile.alpha = 0.6;
          this.fadedTiles.push(tile);
        }
      }
    }
  }

  public updateFOV(playerX: number, playerY: number) {
    const tx = this.map.worldToTileX(playerX)!;
    const ty = this.map.worldToTileY(playerY)!;

    this.computeFOV(tx, ty);

    // Pass 1: Set base fog state for every tile
    const margin = 1;
    const startX = Math.max(0, tx - this.visionRadius - margin);
    const endX = Math.min(this.map.width - 1, tx + this.visionRadius + margin);
    const startY = Math.max(0, ty - this.visionRadius - margin);
    const endY = Math.min(this.map.height - 1, ty + this.visionRadius + margin);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const state = this.explorationMap[y][x];
        if (state === 2) {
          // Visible: No fog
          this.fovLayer.removeTileAt(x, y);
        } else if (state === 1) {
          // Explored: Dim fog
          this.fovLayer.putTileAt(1, x, y);
        } else {
          // Unseen: Black fog
          this.fovLayer.putTileAt(0, x, y);
        }
      }
    }

    // Pass 2: Apply Vertical Extensions (Wall Tops)
    // We only touch the tile ABOVE a wall here.
    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const tile = this.floorLayer.getTileAt(x, y);

        // If this is a wall (Index 0) and we have space above
        if (tile && tile.index === 0 && y > 0) {
          const state = this.explorationMap[y][x];
          const tileAboveState = this.explorationMap[y - 1][x];

          if (state === 2) {
            // Wall is visible: Force reveal the tile above
            this.fovLayer.removeTileAt(x, y - 1);
          } else if (state === 1) {
            // Wall is explored: Dim the tile above, BUT ONLY if it isn't currently Visible (2)
            // This prevents the flickering/overwrite bug
            if (tileAboveState !== 2) {
              this.fovLayer.putTileAt(1, x, y - 1);
            }
          }
        }
      }
    }
  }

  public getExplorationMap(): number[][] {
    // Return the map, ensuring current 'Visible' (2) are saved as 'Explored' (1)
    return this.explorationMap.map((row) =>
      row.map((cell) => (cell === 2 ? 1 : cell))
    );
  }

  private createFogTexture() {
    const size = TILE_SIZE;
    if (this.scene.textures.exists("fog-tiles")) {
      return; // Already exists, skip generation
    }

    // Safety: Destroy existing texture to prevent corruption
    if (this.scene.textures.exists("fog-tiles")) {
      this.scene.textures.remove("fog-tiles");
    }

    const graphics = this.scene.make.graphics(
      {
        x: 0,
        y: 0,
      },
      false
    );

    // Index 0: Black (Unseen)
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, size, size);

    // Index 1: Dim (Explored)
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRect(size, 0, size, size);

    // Generate the texture
    graphics.generateTexture("fog-tiles", size * 2, size);
    graphics.destroy();
  }

  private computeFOV(centerX: number, centerY: number) {
    // Optimization: Only iterate and convert currently visible tiles (2) back to explored (1)
    // instead of checking every tile in the map.
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.explorationMap[y][x] === 2) {
          this.explorationMap[y][x] = 1;
        }
      }
    }

    // Source tile is always visible
    this.explorationMap[centerY][centerX] = 2;

    // Scan 8 octants to find new visible tiles
    for (let i = 0; i < 8; i++) {
      this.scanOctant(centerX, centerY, this.visionRadius, 1, 1.0, 0.0, i);
    }
  }

  private scanOctant(
    cx: number,
    cy: number,
    radius: number,
    row: number,
    start: number,
    end: number,
    octant: number
  ) {
    if (start < end) return;
    let radiusSq = radius * radius;

    for (let j = row; j <= radius; j++) {
      let dx = -j - 1;
      let dy = -j;
      let blocked = false;
      let nextStart = start;

      for (let i = j; i >= 0; i--) {
        dx++;
        // Map relative coordinates to world grid based on octant
        const [rx, ry] = this.transformOctant(dx, dy, octant);
        const wx = cx + rx;
        const wy = cy + ry;

        if (wx < 0 || wx >= this.map.width || wy < 0 || wy >= this.map.height)
          continue;

        let l_slope = (dx - 0.5) / (dy + 0.5);
        let r_slope = (dx + 0.5) / (dy - 0.5);

        if (start < r_slope) continue;
        if (end > l_slope) break;

        if (dx * dx + dy * dy <= radiusSq) {
          this.explorationMap[wy][wx] = 2;
        }

        const isOpaque = this.floorLayer.getTileAt(wx, wy)?.index === 0;

        if (blocked) {
          if (isOpaque) {
            nextStart = r_slope;
          } else {
            blocked = false;
            start = nextStart;
          }
        } else {
          if (isOpaque && j < radius) {
            blocked = true;
            this.scanOctant(cx, cy, radius, j + 1, start, l_slope, octant);
            nextStart = r_slope;
          }
        }
      }
      if (blocked) break;
    }
  }

  private transformOctant(
    x: number,
    y: number,
    octant: number
  ): [number, number] {
    switch (octant) {
      case 0:
        return [y, -x];
      case 1:
        return [x, -y];
      case 2:
        return [x, y];
      case 3:
        return [y, x];
      case 4:
        return [-y, x];
      case 5:
        return [-x, y];
      case 6:
        return [-x, -y];
      case 7:
        return [-y, -x];
      default:
        return [x, y];
    }
  }
}
