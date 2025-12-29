import Phaser from "phaser";

export interface Layers {
  gateLayer: Phaser.Tilemaps.TilemapLayer;
  wallSideLeftLayer: Phaser.Tilemaps.TilemapLayer;
  wallSideRightLayer: Phaser.Tilemaps.TilemapLayer;
  wallUpperLayer: Phaser.Tilemaps.TilemapLayer;
  wallTopUpperLayer: Phaser.Tilemaps.TilemapLayer;
  wallTopUpperEdgeLayer: Phaser.Tilemaps.TilemapLayer;
  wallLowerLayer: Phaser.Tilemaps.TilemapLayer;
  wallTopLowerLayer: Phaser.Tilemaps.TilemapLayer;
}

export interface NeighborIndexes {
  north: number | null;
  northEast: number | null;
  east: number | null;
  southEast: number | null;
  south: number | null;
  southWest: number | null;
  west: number | null;
  northWest: number | null;
}

export interface Context {
  tile: Phaser.Tilemaps.Tile;
  neighbors: NeighborIndexes;
  layers: Layers;
}
