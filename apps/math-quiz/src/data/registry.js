import { mathPractice1, mathPractice2 } from "./mathQuestions.js";
import { elaPractice1, elaPractice2, elaPractice3 } from "./elaQuestions.js";
import {
  sciencePractice1,
  sciencePractice2,
  scienceAdvanced,
} from "./scienceQuestions.js";
import {
  geographyPractice1,
  geographyPractice2,
  geographyAdvanced,
} from "./geographyQuestions.js";
import {
  solarPractice1,
  solarPractice2,
  solarAdvanced,
} from "./solarSystemQuestions.js";
import {
  dinosaurPractice1,
  dinosaurPractice2,
  dinosaurAdvanced,
} from "./dinosaurQuestions.js";
import {
  funFactsPractice1,
  funFactsPractice2,
  funFactsAdvanced,
} from "./funFactsQuestions.js";
import {
  advancedMath,
  advancedScience,
  advancedELA,
  advancedWorld,
} from "./advancedQuestions.js";

export const SUBJECTS = {
  math: {
    label: "Math",
    emoji: "🔢",
    color: "#3b82f6",
    bg: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    tests: [
      {
        key: "p1",
        label: "Practice Test 1",
        emoji: "📝",
        questions: mathPractice1,
      },
      {
        key: "p2",
        label: "Practice Test 2",
        emoji: "📊",
        questions: mathPractice2,
      },
      {
        key: "ch",
        label: "Challenge!",
        emoji: "🏆",
        variant: "challenge",
        questions: advancedMath,
      },
    ],
  },
  ela: {
    label: "ELA",
    emoji: "📖",
    color: "#ec4899",
    bg: "linear-gradient(135deg,#ec4899,#9f1239)",
    tests: [
      {
        key: "p1",
        label: "Practice Test 1",
        emoji: "📝",
        questions: elaPractice1,
      },
      {
        key: "p2",
        label: "Practice Test 2",
        emoji: "📚",
        questions: elaPractice2,
      },
      {
        key: "p3",
        label: "Practice Test 3",
        emoji: "✏️",
        questions: elaPractice3,
      },
    ],
  },
  science: {
    label: "Science",
    emoji: "🔬",
    color: "#22c55e",
    bg: "linear-gradient(135deg,#22c55e,#15803d)",
    tests: [
      {
        key: "p1",
        label: "Practice Test 1",
        emoji: "📝",
        questions: sciencePractice1,
      },
      {
        key: "p2",
        label: "Practice Test 2",
        emoji: "🧪",
        questions: sciencePractice2,
      },
      {
        key: "ch",
        label: "Challenge!",
        emoji: "🏆",
        variant: "challenge",
        questions: scienceAdvanced,
      },
    ],
  },
  geography: {
    label: "Geography",
    emoji: "🌍",
    color: "#f97316",
    bg: "linear-gradient(135deg,#f97316,#c2410c)",
    tests: [
      {
        key: "p1",
        label: "Practice Test 1",
        emoji: "📝",
        questions: geographyPractice1,
      },
      {
        key: "p2",
        label: "Practice Test 2",
        emoji: "🗺️",
        questions: geographyPractice2,
      },
      {
        key: "ch",
        label: "Challenge!",
        emoji: "🏆",
        variant: "challenge",
        questions: geographyAdvanced,
      },
    ],
  },
  solarSystem: {
    label: "Solar System",
    emoji: "🪐",
    color: "#8b5cf6",
    bg: "linear-gradient(135deg,#8b5cf6,#5b21b6)",
    tests: [
      {
        key: "p1",
        label: "Practice Test 1",
        emoji: "📝",
        questions: solarPractice1,
      },
      {
        key: "p2",
        label: "Practice Test 2",
        emoji: "🚀",
        questions: solarPractice2,
      },
      {
        key: "ch",
        label: "Challenge!",
        emoji: "🏆",
        variant: "challenge",
        questions: solarAdvanced,
      },
    ],
  },
  dinosaurs: {
    label: "Dinosaurs",
    emoji: "🦕",
    color: "#ef4444",
    bg: "linear-gradient(135deg,#ef4444,#991b1b)",
    tests: [
      {
        key: "p1",
        label: "Practice Test 1",
        emoji: "📝",
        questions: dinosaurPractice1,
      },
      {
        key: "p2",
        label: "Practice Test 2",
        emoji: "🦖",
        questions: dinosaurPractice2,
      },
      {
        key: "ch",
        label: "Challenge!",
        emoji: "🏆",
        variant: "challenge",
        questions: dinosaurAdvanced,
      },
    ],
  },
  funFacts: {
    label: "Fun Facts",
    emoji: "🌟",
    color: "#14b8a6",
    bg: "linear-gradient(135deg,#14b8a6,#0f766e)",
    tests: [
      {
        key: "p1",
        label: "Practice Test 1",
        emoji: "📝",
        questions: funFactsPractice1,
      },
      {
        key: "p2",
        label: "Practice Test 2",
        emoji: "💡",
        questions: funFactsPractice2,
      },
      {
        key: "ch",
        label: "Challenge!",
        emoji: "🏆",
        variant: "challenge",
        questions: funFactsAdvanced,
      },
    ],
  },
  advanced: {
    label: "Advanced",
    emoji: "⭐",
    color: "#eab308",
    bg: "linear-gradient(135deg,#eab308,#a16207)",
    tests: [
      {
        key: "math",
        label: "Advanced Math",
        emoji: "🔢",
        variant: "advanced",
        questions: advancedMath,
      },
      {
        key: "science",
        label: "Advanced Science",
        emoji: "🔬",
        variant: "advanced",
        questions: advancedScience,
      },
      {
        key: "ela",
        label: "Advanced ELA",
        emoji: "📖",
        variant: "advanced",
        questions: advancedELA,
      },
      {
        key: "world",
        label: "World Knowledge",
        emoji: "🌍",
        variant: "advanced",
        questions: advancedWorld,
      },
    ],
  },
};

/** 1–3 stars from score (same thresholds as results UI). */
export function starsFromScore(score) {
  return score >= 90 ? 3 : score >= 70 ? 2 : 1;
}

/** Keep localStorage history bounded (newest attempts kept). */
export const MAX_HISTORY_ENTRIES = 500;

export function trimHistory(history) {
  if (!Array.isArray(history) || history.length <= MAX_HISTORY_ENTRIES) {
    return history;
  }
  return history.slice(-MAX_HISTORY_ENTRIES);
}

export function loadHighScore(subjectKey, testKey) {
  try {
    const raw = localStorage.getItem(`highscore-${subjectKey}-${testKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveHighScore(subjectKey, testKey, data) {
  try {
    localStorage.setItem(
      `highscore-${subjectKey}-${testKey}`,
      JSON.stringify(data),
    );
  } catch {}
}

const HISTORY_KEY = "quiz-history";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return trimHistory(parsed);
  } catch {
    return [];
  }
}

export function saveAttempt(subjectKey, testKey, data) {
  try {
    const history = [...loadHistory(), { subjectKey, testKey, ...data }];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimHistory(history)));
  } catch {}
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `count` questions from `pool` ensuring every _cat category is
 * represented at least once before filling remaining slots randomly.
 * Falls back to pure shuffle if no questions carry _cat tags.
 */
export function pickRepresentative(pool, count = 10) {
  if (!pool || pool.length === 0) return [];
  const tagged = pool.filter((q) => q._cat);
  if (tagged.length === 0) return shuffle(pool).slice(0, count);

  // Group by category
  const groups = {};
  for (const q of tagged) {
    (groups[q._cat] = groups[q._cat] || []).push(q);
  }

  // Pick one random question from each category
  const picked = [];
  const usedIds = new Set();
  for (const cat of Object.keys(groups)) {
    const candidates = shuffle(groups[cat]);
    const q = candidates[0];
    picked.push(q);
    usedIds.add(q);
  }

  // Fill remaining slots from the full shuffled pool (excluding already picked)
  const remaining = shuffle(pool).filter((q) => !usedIds.has(q));
  const combined = shuffle([...picked, ...remaining]).slice(0, count);
  return combined;
}
