import Phaser from "phaser";
import { COLORS, playSound, getHS } from "../utils.js";
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
    const baseColor = isMath ? 0x6b35c8 : 0x1a6fa8;
    const hoverColor = isMath ? 0x8855e8 : 0x2a8fd8;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg);

    // Title
    const titleLabel = isMath ? "\uD83D\uDD22 Math Quiz" : "\uD83D\uDCD6 ELA Quiz";
    this.add
      .text(width / 2, height * 0.08, titleLabel, {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(50, width * 0.088)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.155, "Choose a Practice Test", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(26, width * 0.046)}px`,
        color: COLORS.muted,
      })
      .setOrigin(0.5);

    const btnW = Math.min(width * 0.84, 540);
    const btnH = Math.min(height * 0.135, 155);
    const btnGap = Math.min(height * 0.032, 36);
    const startY = height * 0.28;

    tests.forEach((test, i) => {
      const y = startY + i * (btnH + btnGap) + btnH / 2;
      const hs = getHS(test.id);
      const stars =
        hs >= 90 ? "\u2B50\u2B50\u2B50" : hs >= 70 ? "\u2B50\u2B50" : hs > 0 ? "\u2B50" : "";
      const hsLabel =
        hs > 0 ? `Best: ${hs} / 100  ${stars}` : "Not played yet";

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

      // Test name
      this.add
        .text(width / 2, y - btnH * 0.18, `${test.emoji}  ${test.label}`, {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: `${Math.min(34, width * 0.06)}px`,
          fontStyle: "bold",
          color: COLORS.text,
        })
        .setOrigin(0.5);

      // Sub-label
      this.add
        .text(width / 2, y + btnH * 0.08, test.sub, {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: `${Math.min(20, width * 0.036)}px`,
          color: COLORS.muted,
        })
        .setOrigin(0.5);

      // High score
      this.add
        .text(width / 2, y + btnH * 0.30, hsLabel, {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: `${Math.min(20, width * 0.036)}px`,
          color: COLORS.accent,
        })
        .setOrigin(0.5);
    });

    // Home button
    const backY = startY + tests.length * (btnH + btnGap) + btnGap * 0.5;
    const backBtn = this.add
      .rectangle(width / 2, backY, Math.min(width * 0.45, 260), 62, 0x4a2c7a)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => backBtn.setFillStyle(0x5a3c8a))
      .on("pointerout", () => backBtn.setFillStyle(0x4a2c7a))
      .on("pointerdown", () => {
        playSound(this, "click");
        this.scene.start("HomeScene");
      });

    this.add
      .text(width / 2, backY, "\u2190 Home", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(28, width * 0.05)}px`,
        color: COLORS.muted,
      })
      .setOrigin(0.5);
  }
}
