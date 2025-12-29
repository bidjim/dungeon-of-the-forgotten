import { LAYER_DEPTHS } from "../../constants";

export function createLayers(
  map: Phaser.Tilemaps.Tilemap,
  tileset: Phaser.Tilemaps.Tileset
) {
  const gateLayer = map.createBlankLayer("Gate", tileset, 0, 0)!;
  const wallSideLeftLayer = map.createBlankLayer(
    "Wall Side Left",
    tileset,
    0,
    0
  )!;
  const wallSideRightLayer = map.createBlankLayer(
    "Wall Side Right",
    tileset,
    0,
    0
  )!;
  const wallUpperLayer = map.createBlankLayer("Wall Upper", tileset, 0, 0)!;
  const wallTopUpperLayer = map.createBlankLayer(
    "Wall Top Upper",
    tileset,
    0,
    0
  )!;
  const wallTopUpperEdgeLayer = map.createBlankLayer(
    "Wall Top Upper Edge",
    tileset,
    0,
    0
  )!;
  const wallLowerLayer = map.createBlankLayer("Wall Lower", tileset, 0, 0)!;
  const wallTopLowerLayer = map.createBlankLayer(
    "Wall Top Lower",
    tileset,
    0,
    0
  )!;
  const stairsLayer = map.createBlankLayer("Stairs", tileset, 0, 0)!;

  stairsLayer.setDepth(LAYER_DEPTHS.STAIRS);
  gateLayer.setDepth(LAYER_DEPTHS.GATE);
  wallSideLeftLayer.setDepth(LAYER_DEPTHS.WALL_SIDE);
  wallSideRightLayer.setDepth(LAYER_DEPTHS.WALL_SIDE);
  wallUpperLayer.setDepth(LAYER_DEPTHS.WALL_UPPER);
  wallTopUpperLayer.setDepth(LAYER_DEPTHS.WALL_TOP_UPPER);
  wallTopUpperEdgeLayer.setDepth(LAYER_DEPTHS.WALL_TOP_UPPER);
  wallLowerLayer.setDepth(LAYER_DEPTHS.WALL_LOWER);
  wallTopLowerLayer.setDepth(LAYER_DEPTHS.WALL_TOP_LOWER);

  return {
    gateLayer,
    wallSideLeftLayer,
    wallSideRightLayer,
    wallUpperLayer,
    wallTopUpperLayer,
    wallTopUpperEdgeLayer,
    wallLowerLayer,
    wallTopLowerLayer,
    stairsLayer,
  };
}
