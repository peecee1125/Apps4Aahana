import Phaser from "phaser";

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

function makeProblem() {
  const kinds = ["add", "add", "sub", "mul"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  let a;
  let b;
  let op;
  let answer;

  if (kind === "add") {
    a = 1 + Math.floor(Math.random() * 12);
    b = 1 + Math.floor(Math.random() * 12);
    op = "+";
    answer = a + b;
  } else if (kind === "sub") {
    a = 5 + Math.floor(Math.random() * 15);
    b = 1 + Math.floor(Math.random() * (a - 1));
    op = "−";
    answer = a - b;
  } else {
    a = 2 + Math.floor(Math.random() * 9);
    b = 2 + Math.floor(Math.random() * 9);
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

  create() {
    const { width, height } = this.scale;

    this.score = 0;
    this.streak = 0;
    this.problem = makeProblem();

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.bg);

    this.title = this.add
      .text(width / 2, height * 0.08, "Math Quiz", {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: `${Math.min(42, width * 0.07)}px`,
        fontStyle: "bold",
        color: COLORS.accent,
      })
      .setOrigin(0.5);

    this.sub = this.add
      .text(width / 2, height * 0.14, "Tap the right answer!", {
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
    this.scale.on("resize", this.layout, this);
  }

  layout() {
    const { width, height } = this.scale;
    this.title.setPosition(width / 2, height * 0.08);
    this.sub.setPosition(width / 2, height * 0.14);
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
    this.streakText.setText(this.streak > 1 ? `${this.streak} in a row!` : "");
    this.feedback.setText("");
    this.placeButtons();
  }

  placeButtons() {
    const { width, height } = this.scale;
    this.buttons.forEach((b) => b.destroy());
    this.buttons = [];
    (this.answerLabels || []).forEach((t) => t.destroy());
    this.answerLabels = [];

    const p = this.problem;
    const pad = Math.min(18, width * 0.03);
    const cols = 2;
    const rows = 2;
    const bw = Math.min(width * 0.38, 320);
    const bh = Math.min(height * 0.12, 88);
    const gap = pad;
    const gridW = cols * bw + (cols - 1) * gap;
    const startX = width / 2 - gridW / 2 + bw / 2;
    const startY = height * 0.48;

    const uid = `${this.time.now}-${Math.floor(Math.random() * 1e6)}`;

    p.choices.forEach((val, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (bw + gap);
      const y = startY + row * (bh + gap);

      const texKey = `btn-${uid}-${i}`;
      const g = this.add.graphics();
      g.fillStyle(COLORS.btn, 1);
      g.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 16);
      g.generateTexture(texKey, bw, bh);
      g.destroy();

      const btn = this.add
        .image(x, y, texKey)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => btn.setTint(0xdddddd))
        .on("pointerout", () => btn.clearTint())
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
    const correct = choice === this.problem.answer;
    const { width, height } = this.scale;

    if (correct) {
      this.score += 10 + this.streak * 2;
      this.streak += 1;
      const msgs = ["Nice!", "You got it!", "Super star!", "Amazing!", "Yes!"];
      this.feedback.setText(msgs[Math.floor(Math.random() * msgs.length)]);
      this.emitConfetti(width / 2, height * 0.42);
      this.time.delayedCall(650, () => {
        this.problem = makeProblem();
        this.refreshUI();
      });
    } else {
      this.streak = 0;
      this.feedback.setText("Try again — you can do it!");
      this.cameras.main.shake(200, 0.012);
      this.scoreText.setText(`Score: ${this.score}`);
      this.streakText.setText("");
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
