export interface ItemState {
  type: string; // e.g., 'chest', 'potion'
  x: number;
  y: number;
  isOpened: boolean;
  itemId?: string; // Unique identifier for specific items if needed
}
