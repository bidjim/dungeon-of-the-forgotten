import { WALL_GENERATING_TILES, GATE_KEYS } from "../../../constants";
import { Context } from "../Context";
import { WallFlags } from "./types";

export function deriveWallFlags(ctx: Context): WallFlags {
  const n = ctx.neighbors;

  const isNorthFloor = n.north !== null && WALL_GENERATING_TILES.has(n.north);
  const isNorthEastFloor =
    n.northEast !== null && WALL_GENERATING_TILES.has(n.northEast);
  const isEastFloor = n.east !== null && WALL_GENERATING_TILES.has(n.east);
  const isSouthEastFloor =
    n.southEast !== null && WALL_GENERATING_TILES.has(n.southEast);
  const isSouthFloor = n.south !== null && WALL_GENERATING_TILES.has(n.south);
  const isSouthWestFloor =
    n.southWest !== null && WALL_GENERATING_TILES.has(n.southWest);
  const isWestFloor = n.west !== null && WALL_GENERATING_TILES.has(n.west);
  const isNorthWestFloor =
    n.northWest !== null && WALL_GENERATING_TILES.has(n.northWest);

  const isNorthGate =
    n.north !== null &&
    (n.north === GATE_KEYS.BOTTOM_RIGHT_DOOR ||
      n.north === GATE_KEYS.BOTTOM_LEFT_DOOR);

  return {
    isNorthFloor,
    isNorthEastFloor,
    isEastFloor,
    isSouthEastFloor,
    isSouthFloor,
    isSouthWestFloor,
    isWestFloor,
    isNorthWestFloor,
    isNorthGate,
  };
}
