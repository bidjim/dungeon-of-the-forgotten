export function createNeighborAccessor(
  grid: Phaser.Tilemaps.Tile[][],
  width: number,
  height: number
) {
  return (x: number, y: number): number | null => {
    if (x < 0 || x >= width || y < 0 || y >= height) return null;
    return grid[y][x].index;
  };
}
