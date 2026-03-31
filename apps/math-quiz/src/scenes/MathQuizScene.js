import Phaser from "phaser";

const QUESTIONS_PER_ROUND = 10;

const COLORS = {
  bg: 0x2d1b4e,
  panel: 0x4a2c7a,
  btn: 0xff6b9d,
  btnHover: 0xff8fb8,
  correct: 0x6bcb77,
  wrong: 0xff6b6b,
  text: "#fff8f0",
  accent: "#ffd93d",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeProblem(round = 1) {
  const scale = Math.min(round, 5);
  // Round 1: addition/subtraction only; round 2+: multiplication unlocks
  const kinds =
    round < 2 ? ["add", "add", "sub"] : ["add", "add", "sub", "mul"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const maxAdd = 8 + scale * 2; // 10 → 18 across rounds
  const maxMul = 2 + scale; // 3 → 7 across rounds

  let a, b, op, answer;

  if (kind === "add") {
    a = 1 + Math.floor(Math.random() * maxAdd);
    b = 1 + Math.floor(Math.random() * maxAdd);
    op = "+";
    answer = a + b;
  } else if (kind === "sub") {
    a = 5 + Math.floor(Math.random() * (maxAdd + 5));
    b = 1 + Math.floor(Math.random() * (a - 1));
    op = "−";
    answer = a - b;
  } else {
    a = 2 + Math.floor(Math.random() * maxMul);
    b = 2 + Math.floor(Math.random() * maxMul);
    op = "×";
    answer = a * b;
  }

  const wrong = new Set();
  let guard = 0;
  while (wrong.size < 3 && guard++ < 80) {
    const delta = -8 + Math.floor(Math.random() * 17);
    if (delta === 0) continue;
    const guess = answer + delta;
    if (guess >= 0 && guess !== answer) wrong.add(guess);
  }
  let extra = 1;
  while (wrong.size < 3) {
    wrong.add(answer + extra);
    extra += 1;
  }
  const choices = shuffle([answer, ...wrong]);

  return { a, b, op, answer, choices };
}

export class MathQuizScene extends Phaser.Scene {
  constructor() {
    super({ key: "MathQuizScene" });
  }

  init(data) {
    this.round = data?.round || 1;
    this.roundOver = false;
  }

  create() {
    const { width, height } = this.scale;

    this.score = 0;
    this.streak = 0;
    this.questionNum = 0;
    this.correctCount = 0;
    this.locked = false;
    this.problem = makeProblem(this.round);

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg);

    this.title = this.add
      .text(width / 2, height * 0.07, "Math Quiz \u2728", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(42, width * 0.07)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    this.questionNumText = this.add
      .text(width / 2, height * 0.13, "", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(22, width * 0.04)}px`,
        color: COLORS.text,
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(width * 0.1, height * 0.2, "", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(24, width * 0.045)}px`,
        color: COLORS.text,
      })
      .setOrigin(0, 0.5);

    this.streakText = this.add
      .text(width * 0.9, height * 0.2, "", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(22, width * 0.04)}px`,
        color: "#ffb347",
      })
      .setOrigin(1, 0.5);

    this.questionText = this.add
      .text(width / 2, height * 0.34, "", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(56, width * 0.1)}px`,
        fontStyle: "bold",
        color: COLORS.text,
      })
      .setOrigin(0.5);

    this.feedback = this.add
      .text(width / 2, height * 0.88, "", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(28, width * 0.05)}px`,
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    this.buttons = [];
    this.answerLabels = [];
    this.refreshUI();

    // Guard against duplicate listeners across scene restarts
    this.scale.off("resize", this.layout, this);
    this.scale.on("resize", this.layout, this);
  }

  shutdown() {
    this.scale.off("resize", this.layout, this);
  }

  layout() {
    if (this.roundOver) return;
    const { width, height } = this.scale;
    this.title.setPosition(width / 2, height * 0.07);
    this.questionNumText.setPosition(width / 2, height * 0.13);
    this.scoreText.setPosition(width * 0.1, height * 0.2);
    this.streakText.setPosition(width * 0.9, height * 0.2);
    this.questionText.setPosition(width / 2, height * 0.34);
    this.feedback.setPosition(width / 2, height * 0.88);
    this.placeButtons();
  }

  refreshUI() {
    const p = this.problem;
    this.questionText.setText(`${p.a} ${p.op} ${p.b} = ?`);
    this.scoreText.setText(`Score: ${this.score}`);
    this.streakText.setText(
      this.streak > 1 ? `${this.streak} in a row! \uD83D\uDD25` : "",
    );
    this.questionNumText.setText(
      `Question ${this.questionNum + 1} / ${QUESTIONS_PER_ROUND}`,
    );
    this.feedback.setText("");
    this.locked = false;
    this.placeButtons();
  }

  placeButtons() {
    if (this.roundOver) return;
    const { width, height } = this.scale;
    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
    (this.answerLabels || []).forEach((t) => t.destroy());
    this.answerLabels = [];

    const p = this.problem;
    const pad = Math.min(18, width * 0.03);
    const cols = 2;
    const bw = Math.min(width * 0.38, 320);
    const bh = Math.min(height * 0.12, 88);
    const gap = pad;
    const gridW = cols * bw + (cols - 1) * gap;
    const startX = width / 2 - gridW / 2 + bw / 2;
    const startY = height * 0.48;

    p.choices.forEach((val, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (bw + gap);
      const y = startY + row * (bh + gap);

      const btn = this.add
        .rectangle(x, y, bw, bh, COLORS.btn)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          if (!this.locked) btn.setFillStyle(COLORS.btnHover);
        })
        .on("pointerout", () => {
          if (btn.fillColor !== COLORS.correct) btn.setFillStyle(COLORS.btn);
        })
        .on("pointerdown", () => this.pick(val));

      const label = this.add
        .text(x, y, String(val), {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: `${Math.min(40, bw * 0.22)}px`,
          fontStyle: "bold",
          color: COLORS.text,
        })
        .setOrigin(0.5);

      this.buttons.push(btn);
      this.answerLabels.push(label);
    });
  }

  pick(choice) {
    if (this.locked) return;
    this.locked = true;
    this.buttons.forEach((b) => b.disableInteractive());

    const correct = choice === this.problem.answer;
    const { width, height } = this.scale;

    if (correct) {
      this.score += 10 + this.streak * 2;
      this.streak += 1;
      this.correctCount += 1;
      const msgs = [
        "Nice! \uD83C\uDF89",
        "You got it! \u2B50",
        "Super star!",
        "Amazing! \uD83D\uDCAB",
        "Yes! \uD83C\uDF8A",
      ];
      this.feedback.setText(msgs[Math.floor(Math.random() * msgs.length)]);
      this.emitConfetti(width / 2, height * 0.42);
      this.playSound("correct");
    } else {
      this.streak = 0;
      // Highlight the correct answer in green so the child learns
      const correctIdx = this.problem.choices.indexOf(this.problem.answer);
      if (correctIdx >= 0 && this.buttons[correctIdx]) {
        this.buttons[correctIdx].setFillStyle(COLORS.correct);
      }
      this.feedback.setText(`The answer was ${this.problem.answer}`);
      this.cameras.main.shake(200, 0.012);
      this.playSound("wrong");
    }

    this.scoreText.setText(`Score: ${this.score}`);
    this.streakText.setText(
      this.streak > 1 ? `${this.streak} in a row! \uD83D\uDD25` : "",
    );

    this.questionNum += 1;
    const delay = correct ? 700 : 1200;
    if (this.questionNum >= QUESTIONS_PER_ROUND) {
      this.time.delayedCall(delay, () => this.showResults());
    } else {
      this.time.delayedCall(delay, () => {
        this.problem = makeProblem(this.round);
        this.refreshUI();
      });
    }
  }

  showResults() {
    this.roundOver = true;
    const { width, height } = this.scale;

    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
    this.answerLabels.forEach((t) => t.destroy());
    this.answerLabels = [];

    this.questionText.setVisible(false);
    this.questionNumText.setVisible(false);
    this.streakText.setVisible(false);
    this.feedback.setVisible(false);

    this.title.setText("Round Complete!");
    this.scoreText
      .setOrigin(0.5)
      .setPosition(width / 2, height * 0.22)
      .setText(`Score: ${this.score}`);

    const pct = this.correctCount / QUESTIONS_PER_ROUND;
    const stars =
      pct >= 0.9
        ? "\u2B50\u2B50\u2B50"
        : pct >= 0.7
          ? "\u2B50\u2B50"
          : "\u2B50";

    this.add
      .text(width / 2, height * 0.36, stars, {
        fontSize: `${Math.min(72, width * 0.13)}px`,
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        height * 0.48,
        `${this.correctCount} / ${QUESTIONS_PER_ROUND} correct`,
        {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: `${Math.min(38, width * 0.07)}px`,
          color: COLORS.accent,
        },
      )
      .setOrigin(0.5);

    const bw = Math.min(width * 0.55, 320);
    const bh = 84;

    const playAgainY = height * 0.62;
    const btn = this.add
      .rectangle(width / 2, playAgainY, bw, bh, COLORS.btn)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btn.setFillStyle(COLORS.btnHover))
      .on("pointerout", () => btn.setFillStyle(COLORS.btn))
      .on("pointerdown", () => this.scene.restart({ round: this.round + 1 }));

    this.add
      .text(width / 2, playAgainY, "Play Again! \uD83D\uDE80", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(36, width * 0.065)}px`,
        fontStyle: "bold",
        color: COLORS.text,
      })
      .setOrigin(0.5);

    this.playSound("fanfare");
    this.emitConfetti(width / 2, height * 0.5);
  }

  playSound(type) {
    try {
      if (!this._audioCtx) {
        this._audioCtx = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      const ctx = this._audioCtx;
      if (ctx.state === "suspended") ctx.resume();

      const schedule = (freq, startOffset, duration, oscType = "sine") => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = oscType;
        const t = ctx.currentTime + startOffset;
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
        osc.start(t);
        osc.stop(t + duration);
      };

      if (type === "correct") {
        schedule(523, 0, 0.28);
        schedule(659, 0.13, 0.28);
      } else if (type === "wrong") {
        schedule(180, 0, 0.3, "sawtooth");
      } else if (type === "fanfare") {
        [523, 659, 784, 1047].forEach((freq, i) =>
          schedule(freq, i * 0.16, 0.35),
        );
      }
    } catch (e) {
      // Silent fallback when Web Audio is unavailable
    }
  }

  emitConfetti(x, y) {
    const colors = [0xffd93d, 0xff6b9d, 0x6bcb77, 0x4d96ff, 0xffa500];
    for (let i = 0; i < 28; i++) {
      const c = colors[i % colors.length];
      const star = this.add.circle(x, y, 6 + Math.random() * 6, c);
      this.tweens.add({
        targets: star,
        x: x + (Math.random() - 0.5) * 220,
        y: y + (Math.random() - 0.5) * 180,
        alpha: 0,
        scale: 0.2,
        duration: 500 + Math.random() * 400,
        ease: "Cubic.easeOut",
        onComplete: () => star.destroy(),
      });
    }
  }
}
