import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("GameScene");
  }

  preload() {
    // Assets are loaded in BootScene
  }

  create() {
    this.player = this.physics.add.sprite(100, 450, "knight_idle");
    this.player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update() {
    let playerVelocityX = 0;
    let playerVelocityY = 0;
    const playerSpeed = 160; // Define a speed constant

    // Horizontal movement
    if (this.cursors.left.isDown) {
      playerVelocityX = -playerSpeed;
      this.player.flipX = true; // Flip sprite to face left
    } else if (this.cursors.right.isDown) {
      playerVelocityX = playerSpeed;
      this.player.flipX = false; // Face right
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      playerVelocityY = -playerSpeed;
    } else if (this.cursors.down.isDown) {
      playerVelocityY = playerSpeed;
    }

    this.player.setVelocityX(playerVelocityX);
    this.player.setVelocityY(playerVelocityY);

    // Animation control
    if (playerVelocityX !== 0 || playerVelocityY !== 0) {
      this.player.anims.play("knight_run", true);
    } else {
      this.player.anims.play("knight_idle", true);
    }
  }
}
