export const COLORS = {
  bg: 0x2d1b4e,
  panel: 0x4a2c7a,
  panelAlt: 0x243b6b,
  panelSoft: 0x5a3c8a,
  btn: 0xff6b9d,
  btnHover: 0xff8fb8,
  btnAlt: 0x4dc7ff,
  btnAltHover: 0x7ed9ff,
  mint: 0x6bcb77,
  orange: 0xffb347,
  sky: 0x4d96ff,
  teal: 0x2ec4b6,
  berry: 0xef476f,
  correct: 0x6bcb77,
  wrong: 0xff6b6b,
  passage: 0x3d2b5e,
  text: "#fff8f0",
  accent: "#ffd93d",
  muted: "#c8a8ff",
  ink: "#22153d",
};

export const FONTS = {
  display: '"Avenir Next", "Trebuchet MS", "Gill Sans", sans-serif',
  body: '"Avenir Next", "Trebuchet MS", "Gill Sans", sans-serif',
};

export function paintPlayfulBackground(scene, options = {}) {
  const { width, height } = scene.scale;
  const base = options.baseColor ?? COLORS.bg;

  scene.add.rectangle(width / 2, height / 2, width, height, base);

  const blobs = [
    {
      x: width * 0.18,
      y: height * 0.14,
      r: width * 0.24,
      color: COLORS.sky,
      alpha: 0.18,
    },
    {
      x: width * 0.84,
      y: height * 0.2,
      r: width * 0.2,
      color: COLORS.orange,
      alpha: 0.14,
    },
    {
      x: width * 0.16,
      y: height * 0.82,
      r: width * 0.22,
      color: COLORS.teal,
      alpha: 0.14,
    },
    {
      x: width * 0.84,
      y: height * 0.78,
      r: width * 0.26,
      color: COLORS.berry,
      alpha: 0.12,
    },
  ];

  blobs.forEach(({ x, y, r, color, alpha }) => {
    scene.add.circle(x, y, r, color, alpha);
  });

  for (let i = 0; i < 24; i++) {
    const star = scene.add.circle(
      Math.random() * width,
      Math.random() * height,
      1.5 + Math.random() * 3,
      0xfff2a8,
      0.35 + Math.random() * 0.35,
    );
    scene.tweens.add({
      targets: star,
      alpha: 0.08,
      duration: 900 + Math.random() * 1400,
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 700,
    });
  }

  const footer = scene.add.ellipse(
    width / 2,
    height * 1.02,
    width * 1.25,
    height * 0.22,
    0x201338,
    0.95,
  );
  footer.setDepth(0);
}

export function createCard(
  scene,
  x,
  y,
  width,
  height,
  fillColor = COLORS.panel,
) {
  const shadow = scene.add.rectangle(x, y + 8, width, height, 0x120a22, 0.3);
  const card = scene.add.rectangle(x, y, width, height, fillColor);
  card.setStrokeStyle(4, 0xffffff, 0.14);
  return { shadow, card };
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getHS(key) {
  try {
    return parseInt(localStorage.getItem(`hs_${key}`) || "0", 10);
  } catch {
    return 0;
  }
}

export function setHS(key, score) {
  try {
    const prev = getHS(key);
    if (score > prev) {
      localStorage.setItem(`hs_${key}`, score);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getBestStreak() {
  try {
    return parseInt(localStorage.getItem("best_streak") || "0", 10);
  } catch {
    return 0;
  }
}

export function updateBestStreak(s) {
  try {
    const prev = getBestStreak();
    if (s > prev) localStorage.setItem("best_streak", s);
  } catch {
    // ignore
  }
}

export function playSound(holder, type) {
  try {
    if (!holder._audioCtx) {
      holder._audioCtx = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
    const ctx = holder._audioCtx;
    if (ctx.state === "suspended") ctx.resume();

    const note = (freq, startOffset, duration, oscType = "sine") => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = oscType;
      const t = ctx.currentTime + startOffset;
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.start(t);
      osc.stop(t + duration);
    };

    if (type === "correct") {
      note(523, 0, 0.25);
      note(659, 0.12, 0.25);
    } else if (type === "wrong") {
      note(180, 0, 0.3, "sawtooth");
    } else if (type === "fanfare") {
      [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.15, 0.32));
    } else if (type === "click") {
      note(440, 0, 0.08);
    }
  } catch {
    // silent fallback
  }
}

export function emitConfetti(scene, x, y) {
  const colors = [0xffd93d, 0xff6b9d, 0x6bcb77, 0x4d96ff, 0xffa500];
  for (let i = 0; i < 28; i++) {
    const c = colors[i % colors.length];
    const dot = scene.add.circle(x, y, 5 + Math.random() * 6, c);
    scene.tweens.add({
      targets: dot,
      x: x + (Math.random() - 0.5) * 240,
      y: y + (Math.random() - 0.5) * 200,
      alpha: 0,
      scale: 0.2,
      duration: 500 + Math.random() * 400,
      ease: "Cubic.easeOut",
      onComplete: () => dot.destroy(),
    });
  }
}
