import {
  DIR,
  WALL_KEYS,
  WALL_LOWER_KEYS,
  WALL_LOWER_TOP_KEYS,
} from "../../../constants";
import { Context } from "../Context";
import { deriveWallFlags } from "./deriveWallFlags";

export function generateSouthWalls(ctx: Context) {
  const { tile, layers } = ctx;
  const { wallLowerLayer, wallTopLowerLayer } = layers;

  const x = tile.x;
  const y = tile.y;

  const flags = deriveWallFlags(ctx);

  if (flags.isSouthFloor) return;

  // Base wall
  wallLowerLayer.putTileAt(WALL_KEYS[DIR.E | DIR.W], x, y);

  // Top logic
  // Center
  if (
    flags.isSouthEastFloor &&
    flags.isSouthWestFloor &&
    flags.isEastFloor &&
    flags.isWestFloor
  ) {
    wallTopLowerLayer.putTileAt(
      WALL_LOWER_TOP_KEYS[DIR.SE | DIR.SW | DIR.E | DIR.W],
      x,
      y
    );
  } else if (flags.isSouthEastFloor && flags.isEastFloor && flags.isWestFloor) {
    wallTopLowerLayer.putTileAt(
      WALL_LOWER_TOP_KEYS[DIR.SE | DIR.E | DIR.W],
      x,
      y - 1
    );
  } else if (flags.isSouthWestFloor && flags.isEastFloor && flags.isWestFloor) {
    wallTopLowerLayer.putTileAt(
      WALL_LOWER_TOP_KEYS[DIR.SW | DIR.E | DIR.W],
      x,
      y - 1
    );
  } else if (flags.isEastFloor && flags.isWestFloor) {
    wallTopLowerLayer.putTileAt(WALL_LOWER_TOP_KEYS[DIR.E | DIR.W], x, y - 1);
  } else if (flags.isEastFloor) {
    if (flags.isSouthEastFloor) {
      wallTopLowerLayer.putTileAt(
        WALL_LOWER_TOP_KEYS[DIR.SE | DIR.E | DIR.W],
        x,
        y - 1
      );
    } else {
      wallTopLowerLayer.putTileAt(WALL_LOWER_TOP_KEYS[DIR.E | DIR.W], x, y - 1);
    }
    wallLowerLayer.putTileAt(WALL_LOWER_KEYS[DIR.E], x - 1, y);
  } else if (flags.isWestFloor) {
    if (flags.isSouthWestFloor) {
      wallTopLowerLayer.putTileAt(
        WALL_LOWER_TOP_KEYS[DIR.SW | DIR.E | DIR.W],
        x,
        y - 1
      );
    } else {
      wallTopLowerLayer.putTileAt(WALL_LOWER_TOP_KEYS[DIR.E | DIR.W], x, y - 1);
    }
    wallLowerLayer.putTileAt(WALL_LOWER_KEYS[DIR.W], x + 1, y);
  }
}
