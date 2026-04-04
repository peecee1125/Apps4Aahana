import { motion } from "framer-motion";
import { SUBJECTS, loadHistory } from "../data/registry";
import NavHeader from "../components/NavHeader";

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today - 864e5);
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (day.getTime() === today.getTime()) return "Today";
  if (day.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HistoryScreen({ onBack }) {
  const history = loadHistory().slice().reverse();
  const totalStars = history.reduce((sum, a) => sum + (a.stars ?? 0), 0);

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col w-full h-full"
      style={{ background: "linear-gradient(135deg,#0f0a2e,#1a0a3e)" }}
    >
      <NavHeader title="⭐ My Stars" onBack={onBack} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-3 sm:mx-6 mt-3 mb-2 rounded-2xl flex items-center justify-center gap-4 py-4 shrink-0"
        style={{
          background: "rgba(251,191,36,0.14)",
          border: "1.5px solid rgba(251,191,36,0.5)",
        }}
      >
        <span className="text-4xl">⭐</span>
        <div className="text-center">
          <div className="text-zinc-200 text-sm font-semibold uppercase tracking-wide">
            Total Stars Earned
          </div>
          <div
            className="font-black text-4xl sm:text-5xl leading-none"
            style={{ color: "#fbbf24" }}
          >
            {totalStars}
          </div>
        </div>
        <span className="text-zinc-300 text-base font-semibold">
          {history.length} attempt{history.length !== 1 ? "s" : ""}
        </span>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-6 min-h-0 flex flex-col gap-2">
        {history.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <span className="text-6xl">🌟</span>
            <p className="text-zinc-200 text-lg font-semibold">
              No quizzes taken yet!
            </p>
            <p className="text-zinc-400 text-sm">
              Complete a test to earn stars.
            </p>
          </div>
        ) : (
          history.map((attempt, i) => {
            const subj = SUBJECTS[attempt.subjectKey];
            const stars = attempt.stars ?? 0;
            const rowKey = `${attempt.date}-${attempt.subjectKey}-${attempt.testKey}-${i}`;
            return (
              <motion.div
                key={rowKey}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: Math.min(i * 0.04, 0.6),
                  type: "spring",
                  stiffness: 260,
                  damping: 22,
                }}
                className="flex items-center gap-4 rounded-xl px-5 py-3 border border-white/20"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <span className="text-3xl shrink-0">{subj?.emoji ?? "📝"}</span>

                <div className="flex-1 min-w-0">
                  <div className="text-zinc-50 font-bold text-base leading-snug truncate">
                    {attempt.subjectLabel ?? attempt.subjectKey}
                  </div>
                  <div className="text-zinc-300 text-xs font-semibold truncate">
                    {attempt.testLabel ?? attempt.testKey}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className="font-black text-xl leading-none"
                    style={{ color: "#fbbf24" }}
                  >
                    {attempt.score}
                    <span className="text-zinc-400 text-xs font-bold">
                      /100
                    </span>
                  </div>
                  <div className="text-base mt-0.5">
                    {[1, 2, 3].map((s) => (
                      <span key={s} style={{ opacity: stars >= s ? 1 : 0.25 }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-zinc-400 text-xs font-semibold shrink-0 w-16 text-right">
                  {formatDate(attempt.date)}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
