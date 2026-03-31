import Phaser from "phaser";
import {
  COLORS,
  FONTS,
  shuffle,
  playSound,
  emitConfetti,
  getHS,
  createNavHeader,
  paintPlayfulBackground,
  setHS,
  updateBestStreak,
} from "../utils.js";

const QUESTIONS_PER_TEST = 10;
const CORRECT_MSGS = [
  "Nice! \uD83C\uDF89",
  "You got it! \u2B50",
  "Super star!",
  "Amazing! \uD83D\uDCAB",
  "Yes! \uD83C\uDF8A",
  "Brilliant! \uD83D\uDCAF",
];

export class TCAPQuizScene extends Phaser.Scene {
  constructor() {
    super({ key: "TCAPQuizScene" });
  }

  init(data) {
    this.testId = data?.testId || "unknown";
    this.testLabel = data?.testLabel || "Quiz";
    this.subject = data?.subject || "math";
    // Keep source for re-shuffle on replay
    this.sourceQuestions = data?.questions || [];
    this.questions = shuffle([...this.sourceQuestions]).slice(
      0,
      QUESTIONS_PER_TEST,
    );
    this.qIdx = 0;
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.locked = false;
    this.roundOver = false;
    this._dyn = []; // dynamic objects cleared between questions
    this._btnRefs = [];
  }

  create() {
    const { width, height } = this.scale;

    paintPlayfulBackground(this);

    // Persistent nav bar (64px) — shows test label + Home button
    const { titleObj: navTitle } = createNavHeader(this, {
      title: this.testLabel,
      showHome: true,
      onHome: () => this.scene.start("HomeScene"),
    });
    this._navTitle = navTitle;

    // Score band just below the nav bar
    this.headerPanel = this.add.rectangle(
      width / 2,
      104,
      Math.min(width * 0.92, 640),
      76,
      this.subject === "math" ? COLORS.panel : COLORS.panelAlt,
      0.95,
    );
    this.headerPanel.setStrokeStyle(3, 0xffffff, 0.14);

    this.qCountText = this.add
      .text(width / 2, 94, "", {
        fontFamily: FONTS.body,
        fontSize: `${Math.min(22, width * 0.04)}px`,
        color: COLORS.text,
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(width * 0.08, 118, "", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(20, width * 0.036)}px`,
        color: COLORS.text,
      })
      .setOrigin(0, 0.5);

    this.streakText = this.add
      .text(width * 0.92, 118, "", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(19, width * 0.034)}px`,
        color: "#ffb347",
      })
      .setOrigin(1, 0.5);

    this.feedbackText = this.add
      .text(width / 2, height * 0.93, "", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(26, width * 0.047)}px`,
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    this._renderQuestion();

    this.scale.off("resize", this._onResize, this);
    this.scale.on("resize", this._onResize, this);
  }

  shutdown() {
    this.scale.off("resize", this._onResize, this);
  }

  _onResize() {
    if (this.roundOver || this.locked) return;
    const { width, height } = this.scale;
    this.headerPanel.setPosition(width / 2, 104);
    this.qCountText.setPosition(width / 2, 94);
    this.scoreText.setPosition(width * 0.08, 118);
    this.streakText.setPosition(width * 0.92, 118);
    this.feedbackText.setPosition(width / 2, height * 0.93);
    this._clearDyn();
    this._renderQuestion();
  }

  _clearDyn() {
    this._dyn.forEach((o) => o.destroy());
    this._dyn = [];
    this._btnRefs = [];
  }

  _updateHeader() {
    this.qCountText.setText(
      `Question ${this.qIdx + 1} / ${QUESTIONS_PER_TEST}`,
    );
    this.scoreText.setText(`Score: ${this.score}`);
    this.streakText.setText(
      this.streak > 1 ? `${this.streak} in a row! \uD83D\uDD25` : "",
    );
  }

  _renderQuestion() {
    this.locked = false;
    const { width, height } = this.scale;
    const q = this.questions[this.qIdx];
    const textPad = 16;
    const boxW = width * 0.88;

    this._updateHeader();

    let curY = height * 0.2;

    if (q.passage) {
      const pBg = this.add
        .rectangle(width / 2, curY, boxW, 10, COLORS.passage)
        .setOrigin(0.5, 0);
      pBg.setStrokeStyle(3, 0xffffff, 0.12);

      const pText = this.add
        .text(width / 2 - boxW / 2 + textPad, curY + textPad, q.passage, {
          fontFamily: FONTS.body,
          fontSize: `${Math.min(21, width * 0.038)}px`,
          color: COLORS.muted,
          wordWrap: { width: boxW - textPad * 2 },
        })
        .setOrigin(0, 0);

      const pHeight = pText.height + textPad * 2;
      pBg.setSize(boxW, pHeight);

      this._dyn.push(pBg, pText);
      curY += pHeight + 16;
    }

    const qText = this.add
      .text(width / 2, curY, q.question, {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(30, width * 0.056)}px`,
        fontStyle: "bold",
        color: COLORS.text,
        wordWrap: { width: width * 0.88 },
        align: "center",
      })
      .setOrigin(0.5, 0);

    this._dyn.push(qText);
    curY += qText.height + 22;

    const shuffledChoices = shuffle(q.choices);
    const btnW = Math.min(width * 0.85, 560);
    const btnH = Math.min(height * 0.1, 108);
    const btnGap = Math.min(height * 0.015, 16);
    const labelFontSize = `${Math.min(25, btnW * 0.072)}px`;

    shuffledChoices.forEach((choice, i) => {
      const y = curY + i * (btnH + btnGap) + btnH / 2;

      const shadow = this.add.rectangle(
        width / 2,
        y + 7,
        btnW,
        btnH,
        0x120a22,
        0.26,
      );
      const btn = this.add
        .rectangle(width / 2, y, btnW, btnH, COLORS.btn)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          if (!this.locked) btn.setFillStyle(COLORS.btnHover);
        })
        .on("pointerout", () => {
          if (
            btn.fillColor !== COLORS.correct &&
            btn.fillColor !== COLORS.wrong
          ) {
            btn.setFillStyle(COLORS.btn);
          }
        })
        .on("pointerdown", () => this._pick(choice, btn));
      btn.setStrokeStyle(3, 0xffffff, 0.15);

      const label = this.add
        .text(width / 2, y, choice, {
          fontFamily: FONTS.body,
          fontSize: labelFontSize,
          fontStyle: "bold",
          color: COLORS.text,
          wordWrap: { width: btnW - 24 },
          align: "center",
        })
        .setOrigin(0.5);

      this._dyn.push(shadow, btn, label);
      this._btnRefs.push({ btn, choice });
    });
  }

  _pick(choice, pickedBtn) {
    if (this.locked) return;
    this.locked = true;
    this._btnRefs.forEach(({ btn }) => btn.disableInteractive());

    const q = this.questions[this.qIdx];
    const correct = choice === q.answer;
    const { width, height } = this.scale;

    if (correct) {
      this.score += 10;
      this.streak += 1;
      this.maxStreak = Math.max(this.maxStreak, this.streak);
      this.correctCount += 1;
      pickedBtn.setFillStyle(COLORS.correct);
      const msg = CORRECT_MSGS[Math.floor(Math.random() * CORRECT_MSGS.length)];
      this.feedbackText.setText(msg);
      emitConfetti(this, width / 2, height * 0.5);
      playSound(this, "correct");
    } else {
      this.streak = 0;
      pickedBtn.setFillStyle(COLORS.wrong);
      const correctRef = this._btnRefs.find((r) => r.choice === q.answer);
      if (correctRef) correctRef.btn.setFillStyle(COLORS.correct);
      this.feedbackText.setText(`Answer: ${q.answer}`);
      this.cameras.main.shake(180, 0.012);
      playSound(this, "wrong");
    }

    this.scoreText.setText(`Score: ${this.score}`);

    this.qIdx += 1;
    const delay = correct ? 700 : 1400;
    if (this.qIdx >= QUESTIONS_PER_TEST) {
      this.time.delayedCall(delay, () => this._showResults());
    } else {
      this.time.delayedCall(delay, () => {
        this.feedbackText.setText("");
        this._clearDyn();
        this._renderQuestion();
      });
    }
  }

  _showResults() {
    this.roundOver = true;
    const { width, height } = this.scale;

    const isNewHS = setHS(this.testId, this.score);
    updateBestStreak(this.maxStreak);

    this._clearDyn();
    this.qCountText.setVisible(false);
    this.streakText.setVisible(false);
    this.feedbackText.setVisible(false);

    // Update the persistent nav bar title
    if (this._navTitle) this._navTitle.setText("Round Complete! \uD83C\uDF93");

    this.scoreText
      .setOrigin(0.5)
      .setPosition(width / 2, height * 0.16)
      .setText(`Score: ${this.score} / 100`);

    const pct = this.correctCount / QUESTIONS_PER_TEST;
    const stars =
      pct >= 0.9
        ? "\u2B50\u2B50\u2B50"
        : pct >= 0.7
          ? "\u2B50\u2B50"
          : "\u2B50";

    this.add
      .text(width / 2, height * 0.26, stars, {
        fontSize: `${Math.min(76, width * 0.13)}px`,
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.38,
        `${this.correctCount} / ${QUESTIONS_PER_TEST} correct`,
        {
          fontFamily: FONTS.display,
          fontSize: `${Math.min(36, width * 0.065)}px`,
          color: COLORS.accent,
        },
      )
      .setOrigin(0.5);

    let badgeY = height * 0.47;

    if (isNewHS) {
      this.add
        .text(width / 2, badgeY, "\uD83C\uDFC6 New High Score!", {
          fontFamily: FONTS.display,
          fontSize: `${Math.min(30, width * 0.055)}px`,
          fontStyle: "bold",
          color: "#ffd93d",
        })
        .setOrigin(0.5);
      badgeY += 50;
    }

    if (this.maxStreak >= 4) {
      this.add
        .text(
          width / 2,
          badgeY,
          `\uD83D\uDD25 ${this.maxStreak}-answer streak!`,
          {
            fontFamily: FONTS.display,
            fontSize: `${Math.min(26, width * 0.047)}px`,
            color: "#ffb347",
          },
        )
        .setOrigin(0.5);
      badgeY += 46;
    }

    if (pct === 1.0) {
      this.add
        .text(width / 2, badgeY, "\uD83C\uDF1F Perfect Score!", {
          fontFamily: FONTS.display,
          fontSize: `${Math.min(28, width * 0.052)}px`,
          fontStyle: "bold",
          color: "#ff6b9d",
        })
        .setOrigin(0.5);
      emitConfetti(this, width / 2, height * 0.5);
    }

    playSound(this, "fanfare");

    const btnW = Math.min(width * 0.62, 380);
    const btnH = 82;
    const btn1Y = height * 0.76;

    const playAgainBtn = this.add
      .rectangle(width / 2, btn1Y, btnW, btnH, COLORS.btn)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => playAgainBtn.setFillStyle(COLORS.btnHover))
      .on("pointerout", () => playAgainBtn.setFillStyle(COLORS.btn))
      .on("pointerdown", () =>
        this.scene.restart({
          testId: this.testId,
          testLabel: this.testLabel,
          questions: this.sourceQuestions,
          subject: this.subject,
        }),
      );

    this.add
      .text(width / 2, btn1Y, "Play Again! \uD83D\uDE80", {
        fontFamily: FONTS.display,
        fontSize: `${Math.min(32, width * 0.058)}px`,
        fontStyle: "bold",
        color: COLORS.text,
      })
      .setOrigin(0.5);
  }
}
