import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  SUBJECTS,
  loadHighScore,
  saveHighScore,
  saveAttempt,
  starsFromScore,
} from "../data/registry";
import NavHeader from "../components/NavHeader";
import { useSound } from "../hooks/useSound";

/** Dedupe persistence + fanfare when React Strict Mode remounts the results screen. */
const persistedCompletionIds = new Set();

const CONFETTI = ["⭐", "🌟", "✨", "🎉", "🎊", "💫", "🏆", "💛", "🎈", "🌈"];

function Confetti({ count = 20 }) {
  const pieces = Array.from({ length: count }, (_, id) => ({
    id,
    emoji: CONFETTI[id % CONFETTI.length],
    left: Math.random() * 95,
    delay: Math.random() * 1,
    dur: 2.2 + Math.random() * 2,
  }));
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: "105vh", opacity: 0, rotate: 540 }}
          transition={{ delay: p.delay, duration: p.dur, ease: "linear" }}
          className="absolute text-2xl"
          style={{ left: `${p.left}%`, top: 0 }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

export default function ResultsScreen({
  subject,
  testIdx,
  results,
  onPlayAgain,
  onHome,
  onSubjectMenu,
}) {
  const { playFanfare } = useSound();
  const subj = SUBJECTS[subject];
  const test = subj?.tests[testIdx];
  const { score, bestStreak, completionId } = results ?? {};
  const stars = starsFromScore(score);
  const [isNewHigh, setIsNewHigh] = useState(false);

  useEffect(() => {
    if (completionId == null) return;
    if (persistedCompletionIds.has(completionId)) return;
    persistedCompletionIds.add(completionId);
    playFanfare();
    const prev = loadHighScore(subject, test?.key);
    if (!prev || score > prev.score) {
      saveHighScore(subject, test?.key, { score, stars, date: Date.now() });
      setIsNewHigh(true);
    }
    saveAttempt(subject, test?.key, {
      score,
      stars,
      date: Date.now(),
      subjectLabel: subj?.label,
      testLabel: test?.label,
    });
  }, [
    completionId,
    playFanfare,
    score,
    stars,
    subject,
    subj?.label,
    test?.key,
    test?.label,
  ]);

  const badges = [
    isNewHigh && { icon: "🏆", label: "New High Score!" },
    bestStreak >= 5 && { icon: "🔥", label: `${bestStreak} Answer Streak!` },
    score === 100 && { icon: "🌟", label: "Perfect Score!" },
  ].filter(Boolean);

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.35,
        type: "spring",
        stiffness: 240,
        damping: 22,
      }}
      className="relative flex flex-col w-full h-full"
      style={{ background: "linear-gradient(135deg,#0f0a2e,#1a0a3e)" }}
    >
      {stars >= 2 && <Confetti count={stars === 3 ? 30 : 16} />}

      <NavHeader
        title="Round Complete! 🎓"
        onBack={onHome}
        backLabel="🏠 Home"
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 min-h-0">
        {/* Stars */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 280 }}
          className="flex gap-2"
        >
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className="text-5xl drop-shadow-lg"
              style={{ opacity: stars >= s ? 1 : 0.18 }}
            >
              ⭐
            </span>
          ))}
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="text-zinc-200 font-bold text-lg">
            {subj?.emoji} {test?.label}
          </div>
          <div
            className="font-black text-8xl leading-none mt-1"
            style={{ color: "#fbbf24" }}
          >
            {score}
            <span className="text-3xl text-zinc-400">/100</span>
          </div>
          <div className="text-zinc-300 text-base mt-1">
            {score / 10} of 10 correct
          </div>
        </motion.div>

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 flex-wrap justify-center"
          >
            {badges.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold"
                style={{
                  background: "rgba(251,191,36,0.15)",
                  border: "1.5px solid #fbbf24",
                }}
              >
                <span className="text-xl">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 flex-wrap justify-center"
        >
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onPlayAgain}
            className="px-8 py-4 rounded-2xl font-extrabold text-white text-lg shadow-xl"
            style={{
              background: subj?.bg ?? "linear-gradient(135deg,#7c3aed,#4f46e5)",
            }}
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onSubjectMenu}
            className="px-8 py-4 rounded-2xl font-extrabold text-white text-lg shadow-xl"
            style={{
              background: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.28)",
            }}
          >
            📋 All Tests
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
