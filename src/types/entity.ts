export interface EntityState {
  type: string; // e.g., 'goblin', 'orc'
  x: number;
  y: number;
  hp: number;
  isDead: boolean;
}
