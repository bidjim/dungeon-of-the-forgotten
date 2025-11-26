// src/Player.ts
import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private joystick: any; // RexUI virtual joystick
  private playerSpeed: number = 160;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    joystick: any,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.cursors = cursors;
    this.joystick = joystick;
  }

  update() {
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
      // Horizontal movement
      if (this.cursors.left.isDown) {
        playerVelocityX = -this.playerSpeed;
        this.flipX = true; // Flip sprite to face left
        isMoving = true;
      } else if (this.cursors.right.isDown) {
        playerVelocityX = this.playerSpeed;
        this.flipX = false; // Face right
        isMoving = true;
      }

      // Vertical movement
      if (this.cursors.up.isDown) {
        playerVelocityY = -this.playerSpeed;
        isMoving = true;
      } else if (this.cursors.down.isDown) {
        playerVelocityY = this.playerSpeed;
        isMoving = true;
      }
    }

    this.setVelocityX(playerVelocityX);
    this.setVelocityY(playerVelocityY);

    // Animation control
    if (isMoving) {
      this.anims.play("knight_run", true);
    } else {
      this.anims.play("knight_idle", true);
    }
  }
}
