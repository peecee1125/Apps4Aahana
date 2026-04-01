import { motion } from "framer-motion";
import { SUBJECTS, loadHistory } from "../data/registry";
import { subjectHasCustomQuestions } from "../data/questionStore";
import { useSound } from "../hooks/useSound";

const KEYS = Object.keys(SUBJECTS);

export default function HomeScreen({ onSelect, onHistory, onRefresh }) {
  const { playTap } = useSound();
  const year = new Date().getFullYear();
  const totalStars = loadHistory().reduce((sum, a) => sum + (a.stars ?? 0), 0);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-full h-full"
      style={{
        background:
          "linear-gradient(135deg,#0f0a2e 0%,#1a0a3e 50%,#0d1a3e 100%)",
      }}
    >
      {/* Title */}
      <div className="text-center pt-4 pb-2 shrink-0">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="text-white font-extrabold text-3xl drop-shadow-lg">
            ✨ Aahana&apos;s Learning App ✨
          </span>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-200 text-sm font-semibold mt-0.5"
        >
          Pick a subject and start learning!
        </motion.p>
      </div>

      {/* 4×2 subject grid */}
      <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-3 px-4 pb-2 min-h-0">
        {KEYS.map((key, i) => {
          const s = SUBJECTS[key];
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 35, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                delay: i * 0.06,
                type: "spring",
                stiffness: 300,
                damping: 22,
              }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                playTap();
                onSelect(key);
              }}
              className="relative flex flex-col items-center justify-center rounded-2xl shadow-xl border border-white/10 overflow-hidden"
              style={{ background: s.bg, cursor: "pointer" }}
            >
              <span className="text-5xl mb-1 drop-shadow float">{s.emoji}</span>
              <span className="text-white font-extrabold text-lg leading-tight text-center px-2 drop-shadow">
                {s.label}
              </span>
              {subjectHasCustomQuestions(key, s.tests) && (
                <span
                  className="absolute top-2 left-2 text-xs font-black px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(52,211,153,0.2)",
                    color: "#34d399",
                    border: "1px solid rgba(52,211,153,0.45)",
                  }}
                >
                  ✨
                </span>
              )}
              {key === "advanced" && (
                <span
                  className="absolute top-2 right-2 text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: "#fff", color: "#a16207" }}
                >
                  🏆 HARD
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-zinc-400 text-xs font-semibold">
          Developed by Dad ❤️ &nbsp;© {year} prateekchhabra.com
        </span>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              playTap();
              onRefresh();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-sm"
            style={{
              background: "rgba(52,211,153,0.12)",
              border: "1.5px solid rgba(52,211,153,0.35)",
              color: "#34d399",
            }}
          >
            <span>🔄</span>
            <span>Questions</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              playTap();
              onHistory();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-sm"
            style={{
              background: "rgba(251,191,36,0.15)",
              border: "1.5px solid rgba(251,191,36,0.45)",
              color: "#fbbf24",
            }}
          >
            <span>⭐</span>
            <span>My Stars {totalStars > 0 && `(${totalStars})`}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
