import { DIR, SIDE_WALL_KEYS } from "../../../constants";
import { Context } from "../Context";
import { deriveWallFlags } from "./deriveWallFlags";

export function generateSideWalls(ctx: Context) {
  const { tile, layers } = ctx;
  const { wallSideLeftLayer, wallSideRightLayer } = layers;

  const x = tile.x;
  const y = tile.y;

  const flags = deriveWallFlags(ctx);

  if (!flags.isWestFloor && !flags.isSouthWestFloor && flags.isSouthFloor) {
    wallSideLeftLayer.putTileAt(SIDE_WALL_KEYS[DIR.E], x - 1, y);
    if (!flags.isNorthFloor) {
      wallSideLeftLayer.putTileAt(SIDE_WALL_KEYS[DIR.E], x - 1, y - 1);
    }
  }
  if (!flags.isEastFloor && !flags.isSouthEastFloor && flags.isSouthFloor) {
    wallSideRightLayer.putTileAt(SIDE_WALL_KEYS[DIR.W], x + 1, y);
    if (!flags.isNorthFloor) {
      wallSideRightLayer.putTileAt(SIDE_WALL_KEYS[DIR.W], x + 1, y - 1);
    }
  }
  if (flags.isEastFloor && flags.isSouthFloor && !flags.isSouthEastFloor) {
    wallSideRightLayer.putTileAt(SIDE_WALL_KEYS[DIR.W], x + 1, y);
  }
  if (flags.isWestFloor && flags.isSouthFloor && !flags.isSouthWestFloor) {
    wallSideLeftLayer.putTileAt(SIDE_WALL_KEYS[DIR.E], x - 1, y);
  }
}
