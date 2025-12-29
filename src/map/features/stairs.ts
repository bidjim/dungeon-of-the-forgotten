import { EMPTY_TILE_INDEX, STAIRS_KEYS } from "../../constants";

export function handleStairsTile(
  tile: Phaser.Tilemaps.Tile,
  neighbors: (number | null)[],
  stairsLayer: Phaser.Tilemaps.TilemapLayer
) {
  if (tile.index !== STAIRS_KEYS.UP) return;

  let blendIndex: number | null = null;

  for (const n of neighbors) {
    if (n !== null && n !== EMPTY_TILE_INDEX) {
      blendIndex = n;
      break;
    }
  }

  stairsLayer.putTileAt(blendIndex ?? EMPTY_TILE_INDEX, tile.x, tile.y);
}
