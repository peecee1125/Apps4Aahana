import Phaser from "phaser";
import { COLORS, playSound } from "../utils.js";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: "HomeScene" });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg);

    // Twinkling background stars
    for (let i = 0; i < 22; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 1.5 + Math.random() * 3;
      const star = this.add.circle(x, y, r, 0xffd93d, 0.3 + Math.random() * 0.6);
      this.tweens.add({
        targets: star,
        alpha: 0.05,
        duration: 700 + Math.random() * 1300,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000,
      });
    }

    // Book icon circle
    const iconR = Math.min(width * 0.13, 82);
    this.add.circle(width / 2, height * 0.19, iconR, 0x6b35c8);
    this.add
      .text(width / 2, height * 0.19, "\uD83D\uDCDA", {
        fontSize: `${Math.min(68, width * 0.12)}px`,
      })
      .setOrigin(0.5);

    // Title
    this.add
      .text(width / 2, height * 0.34, "Aahana's\nLearning Apps", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(52, width * 0.09)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
        align: "center",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height * 0.46, "2nd Grade \u2022 TCAP Practice", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(26, width * 0.046)}px`,
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const btnW = Math.min(width * 0.78, 500);
    const btnH = Math.min(height * 0.11, 128);
    const btnGap = Math.min(height * 0.04, 44);
    const btn1Y = height * 0.59;
    const btn2Y = btn1Y + btnH + btnGap;

    this._makeBtn(
      width / 2,
      btn1Y,
      btnW,
      btnH,
      "\uD83D\uDD22  Math Quiz",
      0x6b35c8,
      0x8855e8,
      () => {
        playSound(this, "click");
        this.scene.start("SubjectMenuScene", { subject: "math" });
      },
    );

    this._makeBtn(
      width / 2,
      btn2Y,
      btnW,
      btnH,
      "\uD83D\uDCD6  ELA Quiz",
      0x1a6fa8,
      0x2a8fd8,
      () => {
        playSound(this, "click");
        this.scene.start("SubjectMenuScene", { subject: "ela" });
      },
    );
  }

  _makeBtn(x, y, w, h, label, color, hoverColor, onClick) {
    const btn = this.add
      .rectangle(x, y, w, h, color)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btn.setFillStyle(hoverColor))
      .on("pointerout", () => btn.setFillStyle(color))
      .on("pointerdown", onClick);

    this.add
      .text(x, y, label, {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(40, w * 0.1)}px`,
        fontStyle: "bold",
        color: COLORS.text,
      })
      .setOrigin(0.5);

    return btn;
  }
}
