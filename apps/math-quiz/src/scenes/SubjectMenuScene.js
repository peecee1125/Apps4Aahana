import Phaser from "phaser";
import {
  COLORS,
  FONTS,
  createCard,
  createNavHeader,
  getHS,
  paintPlayfulBackground,
  playSound,
} from "../utils.js";
import { mathPractice1, mathPractice2 } from "../data/mathQuestions.js";
import {
  elaPractice1,
  elaPractice2,
  elaPractice3,
} from "../data/elaQuestions.js";

const TESTS = {
  math: [
    {
      id: "math1",
      label: "TCAP Practice 1",
      sub: "Operations & Number Sense",
      emoji: "\uD83D\uDD22",
      questions: mathPractice1,
    },
    {
      id: "math2",
      label: "TCAP Practice 2",
      sub: "Measurement, Geometry & Data",
      emoji: "\uD83D\uDCD0",
      questions: mathPractice2,
    },
  ],
  ela: [
    {
      id: "ela1",
      label: "Practice 1",
      sub: "Reading Comprehension",
      emoji: "\uD83D\uDCD6",
      questions: elaPractice1,
    },
    {
      id: "ela2",
      label: "Practice 2",
      sub: "Language & Grammar",
      emoji: "\u270D\uFE0F",
      questions: elaPractice2,
    },
    {
      id: "ela3",
      label: "Practice 3",
      sub: "Writing & Research",
      emoji: "\uD83D\uDCDD",
      questions: elaPractice3,
    },
  ],
};

export class SubjectMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "SubjectMenuScene" });
  }

  init(data) {
    this.subject = data?.subject || "math";
  }

  create() {
    const { width, height } = this.scale;
    const tests = TESTS[this.subject];
    const isMath = this.subject === "math";
    const baseColor = isMath ? COLORS.btn : COLORS.btnAlt;
    const hoverColor = isMath ? COLORS.btnHover : COLORS.btnAltHover;
    const accentEmoji = isMath ? "\uD83E\uDDEE" : "\uD83D\uDCDA";

    paintPlayfulBackground(this);
    createNavHeader(this, {
      title: isMath ? "🔢 Math Quiz" : "📖 ELA Quiz",
      showHome: true,
    });

    const titleLabel = isMath
      ? "\uD83D\uDD22 Math Quiz"
      : "\uD83D\uDCD6 ELA Quiz";
    const { card: headerCard } = createCard(
      this,
      width / 2,
      height * 0.12,
      Math.min(width * 0.88, 600),
      Math.min(height * 0.14, 158),
      isMath ? COLORS.panel : COLORS.panelAlt,
    );
    headerCard.setAlpha(0.96);

    this.add
      .text(width / 2, height * 0.08, `${accentEmoji} ${titleLabel}`, {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(50, width * 0.088)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.125,
        "Choose a bright practice path and earn stars.",
        {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(26, width * 0.046)}px`,
          color: COLORS.text,
        },
      )
      .setOrigin(0.5);

    const btnW = Math.min(width * 0.84, 540);
    const btnH = Math.min(height * 0.14, 162);
    const btnGap = Math.min(height * 0.028, 30);
    const startY = height * 0.26;

    tests.forEach((test, i) => {
      const y = startY + i * (btnH + btnGap) + btnH / 2;
      const hs = getHS(test.id);
      const stars =
        hs >= 90
          ? "\u2B50\u2B50\u2B50"
          : hs >= 70
            ? "\u2B50\u2B50"
            : hs > 0
              ? "\u2B50"
              : "";
      const hsLabel = hs > 0 ? `Best: ${hs} / 100  ${stars}` : "Not played yet";

      const shadow = this.add.rectangle(
        width / 2,
        y + 8,
        btnW,
        btnH,
        0x120a22,
        0.28,
      );
      const btn = this.add
        .rectangle(width / 2, y, btnW, btnH, baseColor)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setFillStyle(hoverColor))
        .on("pointerout", () => btn.setFillStyle(baseColor))
        .on("pointerdown", () => {
          playSound(this, "click");
          this.scene.start("TCAPQuizScene", {
            testId: test.id,
            testLabel: `${isMath ? "Math" : "ELA"} \u2022 ${test.label}`,
            questions: test.questions,
            subject: this.subject,
          });
        });
      btn.setStrokeStyle(4, 0xffffff, 0.18);
      shadow.setDepth(0);

      this.add
        .text(width / 2, y - btnH * 0.23, `${test.emoji}  ${test.label}`, {
          fontFamily: FONTS.display,
          fontSize: `${Math.min(36, width * 0.062)}px`,
          fontStyle: "bold",
          color: COLORS.text,
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, y + btnH * 0.02, test.sub, {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(22, width * 0.038)}px`,
          color: COLORS.text,
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, y + btnH * 0.31, hsLabel, {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(20, width * 0.034)}px`,
          color: COLORS.accent,
        })
        .setOrigin(0.5);
    });
  }
}
