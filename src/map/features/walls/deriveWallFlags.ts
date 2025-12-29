import { FLOOR_KEYS, GATE_KEYS } from "../../../constants";
import { Context } from "../Context";

export function deriveWallFlags(ctx: Context) {
  const n = ctx.neighbors;

  const isNorthFloor = n.north !== null && FLOOR_KEYS.has(n.north);
  const isNorthEastFloor = n.northEast !== null && FLOOR_KEYS.has(n.northEast);
  const isEastFloor = n.east !== null && FLOOR_KEYS.has(n.east);
  const isSouthEastFloor = n.southEast !== null && FLOOR_KEYS.has(n.southEast);
  const isSouthFloor = n.south !== null && FLOOR_KEYS.has(n.south);
  const isSouthWestFloor = n.southWest !== null && FLOOR_KEYS.has(n.southWest);
  const isWestFloor = n.west !== null && FLOOR_KEYS.has(n.west);
  const isNorthWestFloor = n.northWest !== null && FLOOR_KEYS.has(n.northWest);

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
