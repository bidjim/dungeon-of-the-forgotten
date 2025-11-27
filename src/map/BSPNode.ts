// src/map/BSPNode.ts
import { Rectangle, Room } from "../types/map";

// Represents a node in the Binary Space Partitioning tree
export class BSPNode {
  public rectangle: Rectangle;
  public leftChild: BSPNode | null = null;
  public rightChild: BSPNode | null = null;
  public room: Room | null = null; // A leaf node might contain a room

  constructor(rect: Rectangle) {
    this.rectangle = rect;
  }

  isLeaf(): boolean {
    return this.leftChild === null && this.rightChild === null;
  }
}
