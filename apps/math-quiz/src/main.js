import Phaser from "phaser";
import { HomeScene } from "./scenes/HomeScene.js";
import { SubjectMenuScene } from "./scenes/SubjectMenuScene.js";
import { TCAPQuizScene } from "./scenes/TCAPQuizScene.js";
import { MathQuizScene } from "./scenes/MathQuizScene.js";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#2d1b4e",
  antialias: true,
  antialiasGL: true,
  roundPixels: true,
  resolution: window.devicePixelRatio || 1,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 800,
    zoom: 1 / (window.devicePixelRatio || 1),
  },
  scene: [HomeScene, SubjectMenuScene, TCAPQuizScene, MathQuizScene],
});
