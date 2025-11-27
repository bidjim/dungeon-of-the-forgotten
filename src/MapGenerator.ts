// src/MapGenerator.ts

import Phaser from "phaser";
import { Rectangle, Room } from "./types/map";

import { BSPNode } from "./map/BSPNode";

export class MapGenerator {
  private width: number;
  private height: number;
  private mapData: number[][]; // 33 = Wall, 129 = Floor

  // BSP Algorithm parameters
  private minRoomSize: number = 5; // Minimum width/height of a room
  private maxRoomSize: number = 15; // Maximum width/height of a room
  private maxSplits: number = 5; // Maximum number of times a region can be split
  private roomPadding: number = 1; // Padding between room wall and container wall

  private rootNode: BSPNode | null = null;
  private allRooms: Room[] = []; // Store all generated rooms

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.mapData = [];
  }

  public generateMap(): number[][] {
    // Initialize map with all walls (tile index 33)
    this.mapData = Array(this.height)
      .fill(0)
      .map(() => Array(this.width).fill(33));

    // Start BSP algorithm
    const initialRect: Rectangle = {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
    this.rootNode = new BSPNode(initialRect);
    this.splitRectangle(this.rootNode, 0);

    // Create rooms for leaf nodes
    this.allRooms = []; // Reset rooms list
    this.createRooms(this.rootNode);

    // Draw rooms onto mapData
    for (const room of this.allRooms) {
      this.drawRoom(room);
    }

    // Connect rooms with hallways
    if (this.rootNode) {
      this.connectRooms(this.rootNode);
    }

    return this.mapData;
  }

  private splitRectangle(node: BSPNode, depth: number): void {
    if (
      depth >= this.maxSplits ||
      node.rectangle.width < this.minRoomSize * 2 + this.roomPadding * 2 ||
      node.rectangle.height < this.minRoomSize * 2 + this.roomPadding * 2
    ) {
      return; // Stop splitting if max depth reached or rectangle is too small to contain two rooms + padding
    }

    const rect = node.rectangle;
    const horizontalSplit = Phaser.Math.RND.between(0, 1) === 1; // Randomly choose horizontal or vertical split

    let splitPos: number;
    if (horizontalSplit) {
      const minSplit = rect.x + this.minRoomSize + this.roomPadding;
      const maxSplit =
        rect.x + rect.width - this.minRoomSize - this.roomPadding;
      if (maxSplit <= minSplit) return;
      splitPos = Phaser.Math.RND.between(minSplit, maxSplit);

      node.leftChild = new BSPNode({
        x: rect.x,
        y: rect.y,
        width: splitPos - rect.x,
        height: rect.height,
      });
      node.rightChild = new BSPNode({
        x: splitPos,
        y: rect.y,
        width: rect.width - (splitPos - rect.x),
        height: rect.height,
      });
    } else {
      const minSplit = rect.y + this.minRoomSize + this.roomPadding;
      const maxSplit =
        rect.y + rect.height - this.minRoomSize - this.roomPadding;
      if (maxSplit <= minSplit) return;
      splitPos = Phaser.Math.RND.between(minSplit, maxSplit);

      node.leftChild = new BSPNode({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: splitPos - rect.y,
      });
      node.rightChild = new BSPNode({
        x: rect.x,
        y: splitPos,
        width: rect.width,
        height: rect.height - (splitPos - rect.y),
      });
    }

    this.splitRectangle(node.leftChild!, depth + 1);
    this.splitRectangle(node.rightChild!, depth + 1);
  }

  private createRooms(node: BSPNode): void {
    if (node.isLeaf()) {
      const rect = node.rectangle;
      // Ensure room fits within the node's rectangle with padding
      const effectiveWidth = rect.width - this.roomPadding * 2;
      const effectiveHeight = rect.height - this.roomPadding * 2;

      if (
        effectiveWidth < this.minRoomSize ||
        effectiveHeight < this.minRoomSize
      ) {
        // If the effective area is too small for a room, don't create one
        return;
      }

      const roomWidth = Phaser.Math.RND.between(
        this.minRoomSize,
        Math.min(this.maxRoomSize, effectiveWidth)
      );
      const roomHeight = Phaser.Math.RND.between(
        this.minRoomSize,
        Math.min(this.maxRoomSize, effectiveHeight)
      );

      // Randomly position room within the effective area
      const roomX = Phaser.Math.RND.between(
        rect.x + this.roomPadding,
        rect.x + rect.width - this.roomPadding - roomWidth
      );
      const roomY = Phaser.Math.RND.between(
        rect.y + this.roomPadding,
        rect.y + rect.height - this.roomPadding - roomHeight
      );

      node.room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
      this.allRooms.push(node.room);
    } else {
      if (node.leftChild) this.createRooms(node.leftChild);
      if (node.rightChild) this.createRooms(node.rightChild);
    }
  }

  private drawRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          this.mapData[y][x] = 129; // 129 represents floor
        }
      }
    }
  }

  // Helper to get a random room from a given node's subtree
  private getRandomRoom(node: BSPNode): Room | null {
    if (node.room) {
      return node.room;
    }

    const rooms: Room[] = [];
    const findRooms = (n: BSPNode) => {
      if (n.room) {
        rooms.push(n.room);
      }
      if (n.leftChild) findRooms(n.leftChild);
      if (n.rightChild) findRooms(n.rightChild);
    };
    findRooms(node);

    if (rooms.length > 0) {
      return Phaser.Math.RND.pick(rooms);
    }
    return null;
  }

  private connectRooms(node: BSPNode): void {
    if (node.isLeaf() || !node.leftChild || !node.rightChild) {
      return;
    }

    // Recursively connect rooms in children
    this.connectRooms(node.leftChild);
    this.connectRooms(node.rightChild);

    // Connect a room from the left subtree to a room from the right subtree
    const room1 = this.getRandomRoom(node.leftChild);
    const room2 = this.getRandomRoom(node.rightChild);

    if (room1 && room2) {
      this.drawHallway(room1, room2);
    }
  }

  private drawHallway(room1: Room, room2: Room): void {
    // Find center points of the two rooms
    let p1x = Phaser.Math.Between(room1.x + 1, room1.x + room1.width - 2);
    let p1y = Phaser.Math.Between(room1.y + 1, room1.y + room1.height - 2);
    const p2x = Phaser.Math.Between(room2.x + 1, room2.x + room2.width - 2);
    const p2y = Phaser.Math.Between(room2.y + 1, room2.y + room2.height - 2);

    // Simple L-shaped hallway for now
    while (p1x !== p2x) {
      if (p2x > p1x) p1x++;
      else p1x--;
      this.mapData[p1y][p1x] = 129;
    }

    while (p1y !== p2y) {
      if (p2y > p1y) p1y++;
      else p1y--;
      this.mapData[p1y][p1x] = 129;
    }
  }
}
