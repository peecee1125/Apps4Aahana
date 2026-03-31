export const COLORS = {
  bg: 0x2d1b4e,
  panel: 0x4a2c7a,
  btn: 0xff6b9d,
  btnHover: 0xff8fb8,
  correct: 0x6bcb77,
  wrong: 0xff6b6b,
  passage: 0x3d2b5e,
  text: "#fff8f0",
  accent: "#ffd93d",
  muted: "#c8a8ff",
};

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
