import { GATE_KEYS } from "../../constants";

export function placeGateTiles(
  tile: Phaser.Tilemaps.Tile,
  x: number,
  y: number,
  gateLayer: Phaser.Tilemaps.TilemapLayer
) {
  if (tile.index === GATE_KEYS.BOTTOM_LEFT_DOOR) {
    gateLayer.putTileAt(GATE_KEYS.MIDDLE_LEFT_DOOR, x, y - 1);
    gateLayer.putTileAt(GATE_KEYS.MIDDLE_LEFT_BRICK, x - 1, y - 1);
    gateLayer.putTileAt(GATE_KEYS.TOP_LEFT_DOOR, x, y - 2);
  }

  if (tile.index === GATE_KEYS.BOTTOM_RIGHT_DOOR) {
    gateLayer.putTileAt(GATE_KEYS.MIDDLE_RIGHT_DOOR, x, y - 1);
    gateLayer.putTileAt(GATE_KEYS.MIDDLE_RIGHT_BRICK, x + 1, y - 1);
    gateLayer.putTileAt(GATE_KEYS.TOP_RIGHT_DOOR, x, y - 2);
  }
}
