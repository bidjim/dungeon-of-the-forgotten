import { describe, it, expect, vi, beforeEach } from "vitest";
import { Player } from "./Player";
import { Joystick } from "./types/joystick";
import Phaser from "phaser";

// Mock Phaser
vi.mock("phaser", () => {
  return {
    default: {
      Physics: {
        Arcade: {
          Sprite: class {
            scene: any;
            x: number;
            y: number;
            texture: string;
            frame: any;
            body: any;
            flipX: boolean = false;
            anims: any;

            constructor(
              scene: any,
              x: number,
              y: number,
              texture: string,
              frame?: any
            ) {
              this.scene = scene;
              this.x = x;
              this.y = y;
              this.texture = texture;
              this.frame = frame;
              this.anims = {
                play: vi.fn(),
              };
            }

            setCollideWorldBounds = vi.fn();
            setVelocityX = vi.fn();
            setVelocityY = vi.fn();

            destroy(fromScene?: boolean) {}
          },
        },
      },
      Math: {
        DegToRad: (deg: number) => (deg * Math.PI) / 180,
      },
    },
  };
});

describe("Player", () => {
  let player: Player;
  let mockScene: any;
  let mockCursors: any;
  let mockJoystick: Joystick;
  let mockHurtbox: any;

  beforeEach(() => {
    // 1. Setup the Hurtbox Mock
    mockHurtbox = {
      body: { moves: true },
      setPosition: vi.fn(),
      destroy: vi.fn(),
      x: 0,
      y: 0,
    };

    // 2. Setup Scene Mocks
    mockScene = {
      add: {
        existing: vi.fn(),
        // Mock the zone creation to return our mockHurtbox
        zone: vi.fn().mockReturnValue(mockHurtbox),
      },
      physics: {
        add: {
          existing: vi.fn((target: any) => {
            // Ensure the target (Player or Hurtbox) has a mock body
            if (!target.body) {
              target.body = {
                setSize: vi.fn(),
                setOffset: vi.fn(),
                moves: true,
              };
            }
          }),
        },
      },
    };

    mockCursors = {
      left: { isDown: false },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
    };

    mockJoystick = {
      force: 0,
      angle: 0,
      setScrollFactor: vi.fn(),
    };

    player = new Player(
      mockScene,
      100,
      100,
      "knight",
      mockCursors,
      mockJoystick
    );
  });

  it("should initialize correctly", () => {
    expect(mockScene.add.existing).toHaveBeenCalledWith(player);
    expect(mockScene.physics.add.existing).toHaveBeenCalledWith(player);
    expect(player.setCollideWorldBounds).toHaveBeenCalledWith(true);
  });

  describe("update", () => {
    it("should not move when no input is active", () => {
      player.update();
      expect(player.setVelocityX).toHaveBeenCalledWith(0);
      expect(player.setVelocityY).toHaveBeenCalledWith(0);
      expect(player.anims.play).toHaveBeenCalledWith("knight_idle", true);
    });

    it("should move left with keyboard input", () => {
      mockCursors.left.isDown = true;
      player.update();
      expect(player.setVelocityX).toHaveBeenCalledWith(-160);
      expect(player.setVelocityY).toHaveBeenCalledWith(0);
      expect(player.flipX).toBe(true);
      expect(player.anims.play).toHaveBeenCalledWith("knight_run", true);
    });

    it("should move right with keyboard input", () => {
      mockCursors.right.isDown = true;
      player.update();
      expect(player.setVelocityX).toHaveBeenCalledWith(160);
      expect(player.setVelocityY).toHaveBeenCalledWith(0);
      expect(player.flipX).toBe(false);
      expect(player.anims.play).toHaveBeenCalledWith("knight_run", true);
    });

    it("should move up with keyboard input", () => {
      mockCursors.up.isDown = true;
      player.update();
      expect(player.setVelocityX).toHaveBeenCalledWith(0);
      expect(player.setVelocityY).toHaveBeenCalledWith(-160);
      expect(player.anims.play).toHaveBeenCalledWith("knight_run", true);
    });

    it("should move down with keyboard input", () => {
      mockCursors.down.isDown = true;
      player.update();
      expect(player.setVelocityX).toHaveBeenCalledWith(0);
      expect(player.setVelocityY).toHaveBeenCalledWith(160);
      expect(player.anims.play).toHaveBeenCalledWith("knight_run", true);
    });

    it("should normalize diagonal movement speed", () => {
      mockCursors.right.isDown = true;
      mockCursors.down.isDown = true;
      player.update();

      const expectedVelocity = 160 * (1 / Math.sqrt(2));
      expect(player.setVelocityX).toHaveBeenCalledWith(expectedVelocity);
      expect(player.setVelocityY).toHaveBeenCalledWith(expectedVelocity);
      expect(player.anims.play).toHaveBeenCalledWith("knight_run", true);
    });

    it("should prioritize joystick over keyboard", () => {
      mockCursors.left.isDown = true; // Keyboard left
      mockJoystick.force = 20;
      mockJoystick.angle = 0; // Joystick right (0 degrees)

      player.update();

      // Should move right (joystick) instead of left (keyboard)
      expect(player.setVelocityX).toHaveBeenCalledWith(160);
      expect(player.setVelocityY).toHaveBeenCalledWith(0);
      expect(player.flipX).toBe(false);
    });

    it("should move with joystick input", () => {
      mockJoystick.force = 20;
      mockJoystick.angle = 90; // Down

      player.update();

      // cos(90) is approx 0 (might be slightly off due to float precision in JS Math)
      // sin(90) is 1
      // We check for close to values
      const callX = (player.setVelocityX as any).mock.calls[0][0];
      const callY = (player.setVelocityY as any).mock.calls[0][0];

      expect(callX).toBeCloseTo(0);
      expect(callY).toBeCloseTo(160);
      expect(player.anims.play).toHaveBeenCalledWith("knight_run", true);
    });

    it("should sync hurtbox position to match player", () => {
      // Move player manually to simulate change
      player.x = 250;
      player.y = 300;

      player.update();

      expect(mockHurtbox.setPosition).toHaveBeenCalledWith(250, 300);
    });
  });

  describe("destroy", () => {
    it("should destroy the hurtbox when player is destroyed", () => {
      player.destroy();
      expect(mockHurtbox.destroy).toHaveBeenCalled();
    });
  });
});
