import Phaser from "phaser";
import {
  COLORS,
  FONTS,
  createCard,
  paintPlayfulBackground,
  playSound,
} from "../utils.js";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: "HomeScene" });
  }

  create() {
    const { width, height } = this.scale;

    paintPlayfulBackground(this);

    const { shadow: heroShadow, card: heroCard } = createCard(
      this,
      width / 2,
      height * 0.2,
      Math.min(width * 0.88, 600),
      Math.min(height * 0.2, 220),
      COLORS.panel,
    );
    heroShadow.setAlpha(0.32);
    heroCard.setAlpha(0.94);

    const iconR = Math.min(width * 0.1, 68);
    this.add.circle(width / 2, height * 0.135, iconR, COLORS.sky, 0.95);
    this.add
      .text(width / 2, height * 0.135, "\u2728", {
        fontSize: `${Math.min(68, width * 0.12)}px`,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.2, "Enter Aahana's App", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(56, width * 0.092)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
        align: "center",
        lineSpacing: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.255,
        "Play, practice, and earn stars across colorful learning worlds.",
        {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(24, width * 0.042)}px`,
          color: COLORS.text,
          wordWrap: { width: width * 0.78 },
          align: "center",
        },
      )
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.33, "Choose a world to begin", {
        fontFamily: FONTS.body,
        fontSize: `${Math.min(28, width * 0.047)}px`,
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const btnW = Math.min(width * 0.78, 500);
    const btnH = Math.min(height * 0.11, 124);
    const btnGap = Math.min(height * 0.035, 40);
    const btn1Y = height * 0.45;
    const btn2Y = btn1Y + btnH + btnGap;

    this._makeBtn(
      width / 2,
      btn1Y,
      btnW,
      btnH,
      "\uD83D\uDD22  Math Quiz",
      "Numbers, shapes, patterns, and TCAP practice",
      COLORS.btn,
      COLORS.btnHover,
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
      "Reading, grammar, writing, and practice tests",
      COLORS.btnAlt,
      COLORS.btnAltHover,
      () => {
        playSound(this, "click");
        this.scene.start("SubjectMenuScene", { subject: "ela" });
      },
    );

    this.add
      .text(width / 2, height * 0.67, "Coming soon", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(28, width * 0.05)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    const roadmap = [
      { label: "\uD83E\uDDEA Science", color: COLORS.mint },
      { label: "\uD83C\uDF0D Geography", color: COLORS.orange },
      { label: "\u2600\uFE0F Solar System", color: COLORS.sky },
      { label: "\uD83E\uDDA6 Dinosaurs", color: COLORS.berry },
      { label: "\uD83D\uDCA1 Fun Facts", color: COLORS.teal },
    ];
    const chipW = Math.min(width * 0.26, 168);
    const chipH = 54;
    const cols = 2;
    const gapX = 18;
    const gapY = 14;
    const totalW = cols * chipW + gapX;
    const startX = width / 2 - totalW / 2 + chipW / 2;
    const startY = height * 0.73;

    roadmap.forEach((item, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const isLast = index === roadmap.length - 1;
      const x = isLast && row === 2 ? width / 2 : startX + col * (chipW + gapX);
      const y = startY + row * (chipH + gapY);
      const chip = this.add.rectangle(x, y, chipW, chipH, item.color, 0.92);
      chip.setStrokeStyle(3, 0xffffff, 0.2);
      this.add
        .text(x, y, item.label, {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(20, width * 0.032)}px`,
          fontStyle: "bold",
          color: COLORS.ink,
        })
        .setOrigin(0.5);
    });

    const year = new Date().getFullYear();
    this.add
      .text(
        width / 2,
        height * 0.975,
        `Developed by Dad \u2764\uFE0F  \u00A9 ${year} prateekchhabra.com`,
        {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(16, width * 0.028)}px`,
          color: "#ffffff",
          alpha: 0.55,
        },
      )
      .setOrigin(0.5)
      .setAlpha(0.55);
  }

  _makeBtn(x, y, w, h, label, subLabel, color, hoverColor, onClick) {
    const shadow = this.add.rectangle(x, y + 8, w, h, 0x120a22, 0.28);
    const btn = this.add
      .rectangle(x, y, w, h, color)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btn.setFillStyle(hoverColor))
      .on("pointerout", () => btn.setFillStyle(color))
      .on("pointerdown", onClick);
    btn.setStrokeStyle(4, 0xffffff, 0.18);

    this.add
      .text(x, y - h * 0.16, label, {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(38, w * 0.082)}px`,
        fontStyle: "bold",
        color: COLORS.text,
      })
      .setOrigin(0.5);

    this.add
      .text(x, y + h * 0.18, subLabel, {
        fontFamily: FONTS.body,
        fontSize: `${Math.min(20, w * 0.04)}px`,
        color: COLORS.text,
      })
      .setOrigin(0.5);

    return { shadow, btn };
  }
}
