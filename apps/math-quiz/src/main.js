import Phaser from "phaser";
import { MathQuizScene } from "./scenes/MathQuizScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#2d1b4e",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
  },
  scene: [MathQuizScene],
  physics: { default: "arcade", arcade: { gravity: { y: 0 } } },
});
