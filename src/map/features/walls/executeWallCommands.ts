import Phaser from "phaser";
import { Layers } from "../Context";
import { WallCommand } from "./types";

/**
 * Executes a list of wall commands by placing tiles on the appropriate layers.
 * This is the only function that touches Phaser APIs directly.
 */
export function executeWallCommands(
  commands: WallCommand[],
  tile: Phaser.Tilemaps.Tile,
  layers: Layers
): void {
  const baseX = tile.x;
  const baseY = tile.y;

  for (const cmd of commands) {
    const targetX = baseX + cmd.offsetX;
    const targetY = baseY + cmd.offsetY;

    layers[cmd.layer].putTileAt(cmd.tileKey, targetX, targetY);
  }
}
