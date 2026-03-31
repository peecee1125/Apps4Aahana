import Phaser from "phaser";
import { HomeScene } from "./scenes/HomeScene.js";
import { SubjectMenuScene } from "./scenes/SubjectMenuScene.js";
import { TCAPQuizScene } from "./scenes/TCAPQuizScene.js";
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
  scene: [HomeScene, SubjectMenuScene, TCAPQuizScene, MathQuizScene],
});
