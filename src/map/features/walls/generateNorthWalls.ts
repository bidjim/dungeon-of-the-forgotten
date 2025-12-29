import {
  WALL_KEYS,
  WALL_UPPER_TOP_KEYS,
  DIR,
  WALL_TOP_EDGE_KEYS,
} from "../../../constants";
import { Context } from "../Context";
import { deriveWallFlags } from "./deriveWallFlags";

export function generateNorthWalls(ctx: Context) {
  const { tile, layers } = ctx;
  const { wallUpperLayer, wallTopUpperLayer, wallTopUpperEdgeLayer } = layers;

  const x = tile.x;
  const y = tile.y;

  const flags = deriveWallFlags(ctx);

  if (flags.isNorthFloor || flags.isNorthGate) return;

  // Base wall
  if (flags.isEastFloor && flags.isWestFloor) {
    wallUpperLayer.putTileAt(WALL_KEYS[DIR.E | DIR.W], x, y - 1);
  } else if (flags.isWestFloor) {
    wallUpperLayer.putTileAt(WALL_KEYS[DIR.W], x, y - 1);
  } else {
    wallUpperLayer.putTileAt(WALL_KEYS[DIR.E], x, y - 1);
  }

  // Top decor
  // Center
  if (
    flags.isNorthEastFloor &&
    flags.isNorthWestFloor &&
    flags.isEastFloor &&
    flags.isWestFloor
  ) {
    wallTopUpperLayer.putTileAt(
      WALL_UPPER_TOP_KEYS[DIR.NE | DIR.NW | DIR.E | DIR.W],
      x,
      y - 2
    );
  } else if (flags.isNorthEastFloor && flags.isEastFloor) {
    wallTopUpperLayer.putTileAt(WALL_UPPER_TOP_KEYS[DIR.NE | DIR.E], x, y - 2);
  } else if (flags.isNorthWestFloor && flags.isWestFloor) {
    wallTopUpperLayer.putTileAt(WALL_UPPER_TOP_KEYS[DIR.NW | DIR.W], x, y - 2);
  } else if (flags.isEastFloor && flags.isWestFloor) {
    wallTopUpperLayer.putTileAt(WALL_UPPER_TOP_KEYS[DIR.E | DIR.W], x, y - 2);
  }

  if (flags.isEastFloor && !flags.isWestFloor) {
    if (!flags.isNorthEastFloor) {
      wallTopUpperLayer.putTileAt(WALL_UPPER_TOP_KEYS[DIR.E], x, y - 2);
    }
    wallTopUpperLayer.putTileAt(WALL_TOP_EDGE_KEYS[DIR.E], x - 1, y - 2);
  }

  if (flags.isWestFloor && !flags.isEastFloor) {
    if (!flags.isNorthWestFloor) {
      wallTopUpperLayer.putTileAt(WALL_UPPER_TOP_KEYS[DIR.W], x, y - 2);
    }
    wallTopUpperEdgeLayer.putTileAt(WALL_TOP_EDGE_KEYS[DIR.W], x + 1, y - 2);
  }
}
