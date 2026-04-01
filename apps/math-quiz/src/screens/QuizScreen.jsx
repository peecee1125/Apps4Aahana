import { useReducer, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS, shuffle } from "../data/registry";
import NavHeader from "../components/NavHeader";
import { useSound } from "../hooks/useSound";

const PER_ROUND = 10;

function initState(questions) {
  return {
    questions: shuffle(questions)
      .slice(0, PER_ROUND)
      .map((q) => ({ ...q, choices: shuffle(q.choices) })),
    index: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    answered: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "ANSWER": {
      const q = state.questions[state.index];
      const ok = action.choice === q.answer;
      const streak = ok ? state.streak + 1 : 0;
      return {
        ...state,
        score: ok ? state.score + 10 : state.score,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        answered: { selected: action.choice, correct: q.answer },
      };
    }
    case "NEXT":
      return { ...state, index: state.index + 1, answered: null };
    default:
      return state;
  }
}

const LABELS = ["A", "B", "C", "D"];

export default function QuizScreen({ subject, testIdx, onComplete, onBack }) {
  const subj = SUBJECTS[subject];
  const test = subj?.tests[testIdx];
  const [state, dispatch] = useReducer(
    reducer,
    test?.questions ?? [],
    initState,
  );
  const { playCorrect, playWrong, playTap } = useSound();
  const timerRef = useRef(null);

  const isDone = state.index >= state.questions.length;
  const q = !isDone ? state.questions[state.index] : null;

  useEffect(() => {
    if (isDone)
      onComplete({ score: state.score, bestStreak: state.bestStreak });
  }, [isDone]); // eslint-disable-line

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const answer = useCallback(
    (choice) => {
      if (state.answered || !q) return;
      dispatch({ type: "ANSWER", choice });
      if (choice === q.answer) playCorrect();
      else playWrong();
      timerRef.current = setTimeout(() => dispatch({ type: "NEXT" }), 1500);
    },
    [state.answered, q, playCorrect, playWrong],
  );

  if (!test || !q) return null;

  const { answered } = state;

  function btnBg(choice) {
    if (!answered) return "rgba(255,255,255,0.1)";
    if (choice === answered.correct) return "#16a34a";
    if (choice === answered.selected && choice !== answered.correct)
      return "#dc2626";
    return "rgba(255,255,255,0.06)";
  }

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full h-full"
      style={{ background: "linear-gradient(135deg,#0f0a2e,#1a0a3e)" }}
    >
      <NavHeader
        title={`${subj.emoji} ${test.label}`}
        onBack={() => {
          playTap();
          clearTimeout(timerRef.current);
          onBack();
        }}
      />

      {/* Stats bar */}
      <div
        className="flex items-center justify-between py-2 shrink-0 text-base font-bold"
        style={{
          background: "rgba(0,0,0,0.3)",
          paddingLeft: "max(20px,env(safe-area-inset-left))",
          paddingRight: "max(20px,env(safe-area-inset-right))",
        }}
      >
        <span className="text-white/80">
          Q <span style={{ color: "#fbbf24" }}>{state.index + 1}</span> /{" "}
          {PER_ROUND}
        </span>
        <span className="text-white/80">
          Score&nbsp;<span style={{ color: "#4ade80" }}>{state.score}</span>
        </span>
        {state.streak >= 2 && (
          <span style={{ color: "#fb923c" }}>🔥 {state.streak} in a row!</span>
        )}
      </div>

      {/* Content */}
      <div
        className="flex-1 flex flex-col min-h-0 pt-3 gap-3"
        style={{
          paddingLeft: "max(20px,env(safe-area-inset-left))",
          paddingRight: "max(20px,env(safe-area-inset-right))",
        }}
      >
        {/* Passage */}
        <AnimatePresence mode="wait">
          {q.passage && (
            <motion.div
              key={`p-${state.index}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="shrink-0 rounded-xl px-4 py-3 text-white/90 text-sm leading-relaxed"
              style={{
                background: "rgba(139,92,246,0.22)",
                border: "1px solid rgba(139,92,246,0.4)",
              }}
            >
              {q.passage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`q-${state.index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-white font-extrabold text-2xl leading-snug shrink-0"
          >
            {q.question}
          </motion.p>
        </AnimatePresence>

        {/* 2×2 answer grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`c-${state.index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 grid grid-cols-2 gap-3 pb-3 min-h-0"
          >
            {q.choices.map((choice, i) => (
              <motion.button
                key={choice}
                whileTap={!answered ? { scale: 0.94 } : {}}
                onClick={() => answer(choice)}
                className="flex items-center rounded-2xl px-4 py-3 text-left shadow-lg border border-white/10"
                style={{
                  background: btnBg(choice),
                  cursor: answered ? "default" : "pointer",
                  transition: "background 0.25s",
                  minHeight: 110,
                }}
              >
                <span
                  className="shrink-0 font-black text-sm mr-3 rounded-full flex items-center justify-center"
                  style={{
                    width: 30,
                    height: 30,
                    minWidth: 30,
                    background:
                      btnBg(choice) === "rgba(255,255,255,0.1)"
                        ? subj.color
                        : btnBg(choice),
                    color: "white",
                  }}
                >
                  {LABELS[i]}
                </span>
                <span className="text-white font-semibold text-xl leading-snug">
                  {choice}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
