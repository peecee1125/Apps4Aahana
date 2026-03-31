import Phaser from "phaser";
import {
  COLORS,
  FONTS,
  createNavHeader,
  paintPlayfulBackground,
  playSound,
} from "../utils.js";

const SUBJECTS = [
  { key: "math",      emoji: "\u{1F522}", label: "Math",        sub: "Numbers, operations & TCAP",     color: 0xff6b9d, hover: 0xff8fb8, textColor: "#22153d" },
  { key: "ela",       emoji: "\u{1F4D6}", label: "ELA",         sub: "Reading, grammar & writing",     color: 0x4dc7ff, hover: 0x7ed9ff, textColor: "#22153d" },
  { key: "science",   emoji: "\u{1F9EA}", label: "Science",     sub: "Life, earth & physical science", color: 0x6bcb77, hover: 0x8fdd8f, textColor: "#22153d" },
  { key: "geography", emoji: "\u{1F30D}", label: "Geography",   sub: "Continents, maps & landforms",   color: 0xffb347, hover: 0xffc96b, textColor: "#22153d" },
  { key: "solar",     emoji: "\u2600\uFE0F", label: "Solar System", sub: "Planets, stars & space",  color: 0xb39ddb, hover: 0xcab8ef, textColor: "#22153d" },
  { key: "dinosaurs", emoji: "\u{1F996}", label: "Dinosaurs",   sub: "Fossils, periods & dino facts",  color: 0xef476f, hover: 0xf56d8d, textColor: "#fff8f0" },
  { key: "facts",     emoji: "\u{1F4A1}", label: "Fun Facts",   sub: "Amazing world knowledge",        color: 0x2ec4b6, hover: 0x4dd9cc, textColor: "#22153d" },
  { key: "advanced",  emoji: "\u2B50",   label: "Advanced",    sub: "2nd\u21923rd grade challenge",  color: 0xffd93d, hover: 0xffe570, textColor: "#22153d", special: true },
];

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: "HomeScene" });
  }

  create() {
    const { width, height } = this.scale;

    paintPlayfulBackground(this);
    createNavHeader(this, { title: "\u2728 Aahana\u2019s App", showHome: false });

    const heroY = height * 0.14;
    this.add
      .text(width / 2, heroY, "\u{1F31F} Enter Aahana\u2019s App \u{1F31F}", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(44, width * 0.073)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
        align: "center",
        wordWrap: { width: width * 0.88 },
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, heroY + Math.min(52, height * 0.044), "Pick a world below and earn stars! \u2B50", {
        fontFamily: FONTS.body,
        fontSize: `${Math.min(22, width * 0.038)}px`,
        color: COLORS.muted,
        align: "center",
      })
      .setOrigin(0.5);

    const cols = 2;
    const padX = width * 0.04;
    const gapX = width * 0.03;
    const gapY = Math.min(height * 0.016, 18);
    const cardW = (width - padX * 2 - gapX) / cols;
    const cardH = Math.min(height * 0.118, 138);
    const gridStartY = height * 0.25;

    SUBJECTS.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = padX + col * (cardW + gapX) + cardW / 2;
      const cy = gridStartY + row * (cardH + gapY) + cardH / 2;
      this._makeCard(cx, cy, cardW, cardH, s);
    });

    const year = new Date().getFullYear();
    this.add
      .text(width / 2, height * 0.977, `Developed by Dad \u2764\uFE0F  \u00A9 ${year} prateekchhabra.com`, {
        fontFamily: FONTS.body,
        fontSize: `${Math.min(15, width * 0.026)}px`,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setAlpha(0.5);
  }

  _makeCard(cx, cy, w, h, subject) {
    const { key, emoji, label, sub, color, hover, textColor, special } = subject;

    this.add.rectangle(cx + 4, cy + 6, w, h, 0x000000, 0.22);

    const card = this.add
      .rectangle(cx, cy, w, h, color)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        card.setFillStyle(hover);
        this.tweens.add({ targets: card, scaleX: 1.03, scaleY: 1.03, duration: 80 });
      })
      .on("pointerout", () => {
        card.setFillStyle(color);
        this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 80 });
      })
      .on("pointerdown", () => {
        playSound(this, "click");
        this.scene.start("SubjectMenuScene", { subject: key });
      });
    card.setStrokeStyle(special ? 5 : 3, special ? 0xffa500 : 0xffffff, special ? 0.7 : 0.18);

    const emojiSize = Math.min(h * 0.52, 58);
    this.add.text(cx - w * 0.26, cy, emoji, { fontSize: `${emojiSize}px` }).setOrigin(0.5);

    const labelX = cx + w * 0.08;
    this.add.text(labelX, cy - h * 0.17, label, {
      fontFamily: FONTS.display,
      fontSize: `${Math.min(27, w * 0.135)}px`,
      fontStyle: "bold",
      color: textColor,
    }).setOrigin(0.5);

    this.add.text(labelX, cy + h * 0.16, sub, {
      fontFamily: FONTS.body,
      fontSize: `${Math.min(15, w * 0.078)}px`,
      color: textColor,
      wordWrap: { width: w * 0.6 },
      align: "center",
    }).setOrigin(0.5).setAlpha(0.82);

    if (special) {
      this.add.text(cx + w * 0.3, cy - h * 0.28, "\u{1F3C6} CHALLENGE", {
        fontFamily: FONTS.body,
        fontSize: `${Math.min(12, w * 0.06)}px`,
        fontStyle: "bold",
        color: "#7a3c00",
      }).setOrigin(0.5);
    }
  }
}
