import Phaser from "phaser";
import { Joystick } from "./types/joystick";
import { ANIM_KEYS } from "./constants";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private joystick: Joystick;
  private playerSpeed: number = 160;

  // Public property to access the damage hitbox from the Scene
  public hurtbox: Phaser.GameObjects.Zone;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    joystick: Joystick,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.cursors = cursors;
    this.joystick = joystick;

    // --- RESIZE MAIN BODY (THE FEET) ---
    // We cast to Arcade.Body to get TypeScript support for setSize/setOffset
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set the physics body to be the full width, but only bottom 25% height
    body.setSize(this.width, this.height * 0.25);

    // Push the offset down so the body sits at the feet
    // (x offset, y offset)
    body.setOffset(0, this.height * 0.75);

    // --- CREATE HURTBOX (FULL BODY) ---
    // Create a Zone (invisible entity) at the player's position with full size
    this.hurtbox = scene.add.zone(this.x, this.y, this.width, this.height);
    scene.physics.add.existing(this.hurtbox);

    const hurtboxBody = this.hurtbox.body as Phaser.Physics.Arcade.Body;
    hurtboxBody.moves = false; // Important: Don't let gravity pull the hurtbox down
  }

  update() {
    // --- SYNC HURTBOX POSITION ---
    // Ensure the hurtbox always follows the player perfectly
    this.hurtbox.setPosition(this.x, this.y);

    let playerVelocityX = 0;
    let playerVelocityY = 0;
    let isMoving = false;

    // Joystick input
    if (this.joystick.force > 10) {
      const angleDegrees = this.joystick.angle;
      const angleRadians = Phaser.Math.DegToRad(angleDegrees);

      playerVelocityX = Math.cos(angleRadians) * this.playerSpeed;
      playerVelocityY = Math.sin(angleRadians) * this.playerSpeed;
      isMoving = true;
      if (playerVelocityX < 0) {
        this.flipX = true;
      } else if (playerVelocityX > 0) {
        this.flipX = false;
      }
    } else {
      // Keyboard input
      let xInput = 0;
      let yInput = 0;

      // Horizontal movement
      if (this.cursors.left.isDown) {
        xInput = -1;
        this.flipX = true;
        isMoving = true;
      } else if (this.cursors.right.isDown) {
        xInput = 1;
        this.flipX = false;
        isMoving = true;
      }

      // Vertical movement
      if (this.cursors.up.isDown) {
        yInput = -1;
        isMoving = true;
      } else if (this.cursors.down.isDown) {
        yInput = 1;
        isMoving = true;
      }

      // Normalize diagonal movement
      if (xInput !== 0 && yInput !== 0) {
        const diagonalFactor = 1 / Math.sqrt(2);
        playerVelocityX = xInput * this.playerSpeed * diagonalFactor;
        playerVelocityY = yInput * this.playerSpeed * diagonalFactor;
      } else {
        playerVelocityX = xInput * this.playerSpeed;
        playerVelocityY = yInput * this.playerSpeed;
      }
    }

    this.setVelocityX(playerVelocityX);
    this.setVelocityY(playerVelocityY);

    // Animation control
    if (isMoving) {
      this.anims.play(ANIM_KEYS.KNIGHT_RUN, true);
    } else {
      this.anims.play(ANIM_KEYS.KNIGHT_IDLE, true);
    }
  }

  destroy(fromScene?: boolean) {
    // Clean up hurtbox if player is destroyed
    if (this.hurtbox) {
      this.hurtbox.destroy();
    }
    super.destroy(fromScene);
  }
}
