import { randomInt } from "../helper";
import { Rect } from "../types/rect";
import { MIN_LEAF_SIZE, MIN_ROOM_SIZE } from "./config";

export class Leaf {
  public x: number;
  public y: number;
  public w: number;
  public h: number;

  // Children
  public left: Leaf | null = null;
  public right: Leaf | null = null;

  // The actual room inside this leaf (only for bottom-level leaves)
  public room: Rect | null = null;

  // Corridors connecting this leaf's children
  public halls: Rect[] = [];

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  /**
   * The core BSP function. Determines direction and split point.
   */
  public split(): boolean {
    // 1. If we already have children, we don't split again.
    if (this.left != null || this.right != null) {
      return false;
    }

    // 2. Determine split direction
    // If width is 25% larger than height, split vertically.
    // If height is 25% larger than width, split horizontally.
    // Otherwise, random.
    let splitH: boolean = Math.random() > 0.5;

    if (this.w > this.h && this.w / this.h >= 1.25) {
      splitH = false; // Vertical split (cut x-axis)
    } else if (this.h > this.w && this.h / this.w >= 1.25) {
      splitH = true; // Horizontal split (cut y-axis)
    }

    // 3. Determine max split size
    // We must leave enough room for a MIN_LEAF_SIZE on both sides.
    const max = (splitH ? this.h : this.w) - MIN_LEAF_SIZE;

    // If the area is too small to split, return false
    if (max <= MIN_LEAF_SIZE) {
      return false;
    }

    // 4. Calculate split position
    const splitPos = randomInt(MIN_LEAF_SIZE, max);

    // 5. Create Children
    if (splitH) {
      // Horizontal Split: Top and Bottom
      this.left = new Leaf(this.x, this.y, this.w, splitPos);
      this.right = new Leaf(
        this.x,
        this.y + splitPos,
        this.w,
        this.h - splitPos
      );
    } else {
      // Vertical Split: Left and Right
      this.left = new Leaf(this.x, this.y, splitPos, this.h);
      this.right = new Leaf(
        this.x + splitPos,
        this.y,
        this.w - splitPos,
        this.h
      );
    }

    return true;
  }

  /**
   * Create a Room inside this Leaf.
   * Only works if this Leaf has no children.
   */
  public createRooms(): void {
    if (this.left != null || this.right != null) {
      // Recursively generate rooms for children
      if (this.left) this.left.createRooms();
      if (this.right) this.right.createRooms();

      // Once children have rooms, create corridors between them
      if (this.left && this.right) {
        this.createHall(this.left.getRoom()!, this.right.getRoom()!);
      }
    } else {
      // This is a final leaf, make a room inside it
      // Random size, but at least MIN_ROOM_SIZE, and keeping inside boundaries
      const roomW = randomInt(MIN_ROOM_SIZE, this.w - 2);
      const roomH = randomInt(MIN_ROOM_SIZE, this.h - 2);

      // Random position inside the leaf (with small padding)
      const roomX = randomInt(1, this.w - roomW - 1);
      const roomY = randomInt(1, this.h - roomH - 1);

      this.room = {
        x: this.x + roomX,
        y: this.y + roomY,
        w: roomW,
        h: roomH,
      };
    }
  }

  /**
   * Helper to retrieve the room from this leaf or one of its children
   */
  public getRoom(): Rect | null {
    if (this.room) return this.room;

    // If we are a branch, get a room from the left or right child randomly
    // This helps the corridor function find a connection point
    let lRoom: Rect | null = null;
    let rRoom: Rect | null = null;

    if (this.left) lRoom = this.left.getRoom();
    if (this.right) rRoom = this.right.getRoom();

    if (!lRoom && !rRoom) return null;
    if (!rRoom) return lRoom;
    if (!lRoom) return rRoom;

    return Math.random() > 0.5 ? lRoom : rRoom;
  }

  /**
   * Helper to add L-shaped corridor segments to the halls array.
   * @param p1 The starting point of the corridor (corridorStartPoint).
   * @param p2 The ending point of the corridor (corridorEndPoint).
   * @param horizontalFirst If true, draws the horizontal segment first, then vertical. Otherwise, vertical then horizontal.
   */
  private _addLShapedCorridorSegments(
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    horizontalFirst: boolean
  ): void {
    if (horizontalFirst) {
      // Horizontal segment
      this.halls.push({
        x: Math.min(p1.x, p2.x),
        y: p1.y,
        w: Math.abs(p1.x - p2.x),
        h: 2,
      });
      // Vertical segment
      this.halls.push({
        x: p2.x,
        y: Math.min(p1.y, p2.y),
        w: 2,
        h: Math.abs(p1.y - p2.y),
      });
    } else {
      // Vertical segment
      this.halls.push({
        x: p1.x,
        y: Math.min(p1.y, p2.y),
        w: 2,
        h: Math.abs(p1.y - p2.y),
      });
      // Horizontal segment
      this.halls.push({
        x: Math.min(p1.x, p2.x),
        y: p2.y,
        w: Math.abs(p1.x - p2.x),
        h: 2,
      });
    }
  }


  /**
   * Connects two rooms with an L-shaped corridor.
   * This method calculates random points within each room and generates
   * two orthogonal corridor segments to connect them, forming an L-shape.
   * The choice of drawing horizontal-then-vertical or vertical-then-horizontal
   * is randomized for each connection.
   *
   * @param room1 The first room (a Rect object with x, y, width, height) from which the corridor will start.
   * @param room2 The second room (a Rect object with x, y, width, height) where the corridor will end.
   */
  public createHall(room1: Rect, room2: Rect): void {
    // Calculate a random starting point within the first room.
    // The `randomInt` function ensures the point is at least 1 unit away from the room's borders,
    // preventing corridors from being placed exactly on the room edge.
    const corridorStartPoint = {
      x: randomInt(room1.x + 1, room1.x + room1.w - 2),
      y: randomInt(room1.y + 1, room1.y + room1.h - 2),
    };

    // Calculate a random ending point within the second room,
    // similarly keeping it away from the border.
    const corridorEndPoint = {
      x: randomInt(room2.x + 1, room2.x + room2.w - 2),
      y: randomInt(room2.y + 1, room2.y + room2.h - 2),
    };

    // Calculate the horizontal distance (width difference) and vertical distance (height difference)
    // between the two points. These values can be negative, indicating direction.
    const horizontalDistance = corridorEndPoint.x - corridorStartPoint.x;
    const verticalDistance = corridorEndPoint.y - corridorStartPoint.y;

    // The 'halls' array (also a member of the Leaf class) will store the generated
    // corridor segments as Rect objects (x, y, w, h). Each segment will have a width or height of 1
    // to represent a thin corridor.

    // --- Core Logic: Determine corridor path based on relative positions of points ---

    // Case 1: The corridorEndPoint is to the left of the corridorStartPoint (horizontalDistance is negative).
    if (horizontalDistance < 0) {
      // Subcase 1.1: The corridorEndPoint is also above the corridorStartPoint (verticalDistance is negative).
      if (verticalDistance < 0) {
        // Randomly decide which segment to draw first: horizontal or vertical.
        if (Math.random() < 0.5) {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, true);
        } else {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, false);
        }
      }
      // Subcase 1.2: The corridorEndPoint is below the corridorStartPoint (verticalDistance is positive).
      else if (verticalDistance > 0) {
        if (Math.random() < 0.5) {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, true);
        } else {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, false);
        }
      }
      // Subcase 1.3: The corridorEndPoint and corridorStartPoint are on the same Y-axis (verticalDistance is zero).
      else {
        // verticalDistance === 0
        // Only a single horizontal segment is needed to connect them.
        this.halls.push({
          x: corridorEndPoint.x,
          y: corridorEndPoint.y,
          w: Math.abs(horizontalDistance),
          h: 2,
        });
      }
    }
    // Case 2: The corridorEndPoint is to the right of the corridorStartPoint (horizontalDistance is positive).
    else if (horizontalDistance > 0) {
      // Subcase 2.1: The corridorEndPoint is above the corridorStartPoint (verticalDistance is negative).
      if (verticalDistance < 0) {
        if (Math.random() < 0.5) {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, true);
        } else {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, false);
        }
      }
      // Subcase 2.2: The corridorEndPoint is below the corridorStartPoint (verticalDistance is positive).
      else if (verticalDistance > 0) {
        if (Math.random() < 0.5) {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, true);
        } else {
          this._addLShapedCorridorSegments(corridorStartPoint, corridorEndPoint, false);
        }
      }
      // Subcase 2.3: The corridorEndPoint and corridorStartPoint are on the same Y-axis (verticalDistance is zero).
      else {
        // verticalDistance === 0
        // Only a single horizontal segment is needed.
        this.halls.push({
          x: corridorStartPoint.x,
          y: corridorStartPoint.y,
          w: Math.abs(horizontalDistance),
          h: 2,
        });
      }
    }
    // Case 3: The corridorEndPoint and corridorStartPoint are on the same X-axis (horizontalDistance is zero).
    else {
      // horizontalDistance === 0
      // Subcase 3.1: The corridorEndPoint is above the corridorStartPoint (verticalDistance is negative).
      if (verticalDistance < 0) {
        // Only a single vertical segment is needed.
        this.halls.push({
          x: corridorEndPoint.x,
          y: corridorEndPoint.y,
          w: 2,
          h: Math.abs(verticalDistance),
        });
      }
      // Subcase 3.2: The corridorEndPoint is below the corridorStartPoint (verticalDistance is positive).
      else if (verticalDistance > 0) {
        // Only a single vertical segment is needed.
        this.halls.push({
          x: corridorStartPoint.x,
          y: corridorStartPoint.y,
          w: 2,
          h: Math.abs(verticalDistance),
        });
      }
      // Subcase 3.3: Both horizontalDistance and verticalDistance are zero.
      // This implies corridorStartPoint and corridorEndPoint are the same.
      // In this scenario, no corridor is needed, so no segments are pushed to `this.halls`.
    }
  }
}
