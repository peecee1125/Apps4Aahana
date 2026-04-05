import { useReducer, useLayoutEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS, shuffle, pickRepresentative } from "../data/registry";
import { loadCustomQuestions } from "../data/questionStore";
import NavHeader from "../components/NavHeader";
import { useSound } from "../hooks/useSound";

const PER_ROUND = 10;

/** Unanswered: readable on dark purple without looking “washed out”. */
const BG_UNANSWERED = "rgba(255,255,255,0.16)";
const BG_DIM = "rgba(255,255,255,0.09)";
const BG_CORRECT = "#15803d";
const BG_WRONG = "#b91c1c";

function initState(questions) {
  return {
    questions: pickRepresentative(questions, PER_ROUND).map((q) => ({
      ...q,
      choices: shuffle(q.choices),
    })),
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

function choiceBackground(choice, answered, correct, selected) {
  if (!answered) return BG_UNANSWERED;
  if (choice === correct) return BG_CORRECT;
  if (choice === selected && choice !== correct) return BG_WRONG;
  return BG_DIM;
}

export default function QuizScreen({ subject, testIdx, onComplete, onBack }) {
  const subj = SUBJECTS[subject];
  const test = subj?.tests[testIdx];
  const customBank = loadCustomQuestions(subject, test?.key);
  const pool = customBank ? customBank.questions : (test?.questions ?? []);
  const [state, dispatch] = useReducer(reducer, pool, initState);
  const { playCorrect, playWrong, playTap } = useSound();
  const timerRef = useRef(null);
  const completedRef = useRef(false);
  const completionIdRef = useRef(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const isDone = state.index >= state.questions.length;
  const q = !isDone ? state.questions[state.index] : null;

  useLayoutEffect(() => {
    if (!isDone) {
      completedRef.current = false;
      return;
    }
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete({
      score: state.score,
      bestStreak: state.bestStreak,
      completionId: completionIdRef.current,
    });
  }, [isDone, state.score, state.bestStreak, onComplete]);

  useLayoutEffect(() => () => clearTimeout(timerRef.current), []);

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

  if (!test) return null;

  const bg = "linear-gradient(135deg,#0f0a2e,#1a0a3e)";

  if (isDone) {
    return (
      <motion.div
        key="quiz-done"
        initial={{ opacity: 1 }}
        className="flex flex-col w-full h-full"
        style={{ background: bg }}
        aria-busy="true"
      >
        <NavHeader
          title={`${subj.emoji} ${test.label}`}
          onBack={() => {
            playTap();
            clearTimeout(timerRef.current);
            onBack();
          }}
        />
        <div className="flex-1 min-h-0" />
      </motion.div>
    );
  }

  const { answered } = state;

  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col w-full h-full"
      style={{ background: bg }}
    >
      <NavHeader
        title={`${subj.emoji} ${test.label}`}
        onBack={() => {
          playTap();
          clearTimeout(timerRef.current);
          onBack();
        }}
      />

      <div
        className="flex items-center justify-between py-2 shrink-0 text-base font-bold"
        style={{
          background: "rgba(0,0,0,0.35)",
          paddingLeft: "max(20px,env(safe-area-inset-left))",
          paddingRight: "max(20px,env(safe-area-inset-right))",
        }}
      >
        <span className="text-white/90">
          Q <span style={{ color: "#fbbf24" }}>{state.index + 1}</span> /{" "}
          {PER_ROUND}
        </span>
        <span className="text-white/90">
          Score&nbsp;<span style={{ color: "#4ade80" }}>{state.score}</span>
        </span>
        {state.streak >= 2 && (
          <span className="text-orange-300 font-bold">
            🔥 {state.streak} in a row!
          </span>
        )}
      </div>

      <div
        className="flex-1 flex flex-col min-h-0 pt-3 gap-3"
        style={{
          paddingLeft: "max(20px,env(safe-area-inset-left))",
          paddingRight: "max(20px,env(safe-area-inset-right))",
        }}
      >
        <AnimatePresence mode="wait">
          {q.passage && (
            <motion.div
              key={`p-${state.index}`}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="shrink-0 rounded-xl px-4 py-3 text-zinc-100 text-base leading-relaxed font-medium"
              style={{
                background: "rgba(139,92,246,0.28)",
                border: "1px solid rgba(196,181,253,0.45)",
              }}
            >
              {q.passage}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={`q-${state.index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-zinc-50 font-extrabold text-xl sm:text-2xl leading-snug shrink-0"
          >
            {q.question}
          </motion.p>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`c-${state.index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 grid grid-cols-2 gap-3 pb-3 min-h-0"
          >
            {q.choices.map((choice, i) => {
              const bgChoice = choiceBackground(
                choice,
                answered,
                answered?.correct,
                answered?.selected,
              );
              const showLetterTint = !answered;
              return (
                <motion.button
                  key={`${state.index}-${i}`}
                  whileTap={!answered ? { scale: 0.94 } : {}}
                  onClick={() => answer(choice)}
                  className="flex items-center rounded-2xl px-4 py-3 text-left shadow-lg border border-white/25"
                  style={{
                    background: bgChoice,
                    cursor: answered ? "default" : "pointer",
                    transition: "background 0.25s",
                    minHeight: "clamp(72px, 15vh, 110px)",
                  }}
                >
                  <span
                    className="shrink-0 font-black text-sm mr-3 rounded-full flex items-center justify-center"
                    style={{
                      width: 30,
                      height: 30,
                      minWidth: 30,
                      background: showLetterTint
                        ? "rgba(255,255,255,0.92)"
                        : "rgba(255,255,255,0.18)",
                      color: showLetterTint ? subj.color : "white",
                    }}
                  >
                    {LABELS[i]}
                  </span>
                  <span className="text-zinc-50 font-semibold text-base sm:text-xl leading-snug">
                    {choice}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
