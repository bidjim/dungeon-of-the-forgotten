import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { GameScene } from "./scenes/GameScene";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";
import { LoadingScene } from "./scenes/LoadingScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      debug: import.meta.env.VITE_APP_DEBUG_MODE === "true",
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [BootScene, LoadingScene, GameScene],
  pixelArt: true,
  plugins: {
    global: [
      {
        key: "rexVirtualJoystick",
        plugin: VirtualJoystickPlugin,
        start: true,
      },
    ],
  },
};

new Phaser.Game(config);
