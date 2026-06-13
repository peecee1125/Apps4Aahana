import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBJECTS } from "../data/registry";
import {
  loadCustomQuestions,
  saveCustomQuestions,
  clearCustomQuestions,
  loadApiKey,
  saveApiKey,
  generateQuestions,
} from "../data/questionStore";
import NavHeader from "../components/NavHeader";
import { useSound } from "../hooks/useSound";

function formatAge(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

const cardSurface = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const btnPrimary = (enabled) => ({
  background: enabled ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.06)",
  color: enabled ? "#e9d5ff" : "rgba(255,255,255,0.25)",
  border: `1px solid ${enabled ? "rgba(167,139,250,0.5)" : "rgba(255,255,255,0.08)"}`,
});

const btnDanger = {
  background: "rgba(239,68,68,0.15)",
  color: "#fca5a5",
  border: "1px solid rgba(248,113,113,0.35)",
};

export default function RefreshScreen({ onBack }) {
  const { playTap } = useSound();
  const [storedKey, setStoredKey] = useState(loadApiKey);
  const [keyDraft, setKeyDraft] = useState(loadApiKey);
  const [editingKey, setEditingKey] = useState(!loadApiKey());
  const [expanded, setExpanded] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});

  function saveKey() {
    const trimmed = keyDraft.trim();
    saveApiKey(trimmed);
    setStoredKey(trimmed);
    setEditingKey(false);
  }

  async function generate(subjectKey, test) {
    if (!storedKey) return;
    const id = `${subjectKey}-${test.key}`;
    const subj = SUBJECTS[subjectKey];
    setGenerating(id);
    setTaskStatus((s) => ({ ...s, [id]: {} }));
    try {
      const qs = await generateQuestions(subj.label, test.label, storedKey);
      saveCustomQuestions(subjectKey, test.key, qs);
      setTaskStatus((s) => ({ ...s, [id]: { count: qs.length } }));
    } catch (e) {
      setTaskStatus((s) => ({ ...s, [id]: { error: e.message } }));
    } finally {
      setGenerating(null);
    }
  }

  async function generateAll(subjectKey) {
    if (!storedKey) return;
    playTap();
    for (const test of SUBJECTS[subjectKey].tests) {
      await generate(subjectKey, test);
    }
  }

  function clear(subjectKey, testKey) {
    playTap();
    clearCustomQuestions(subjectKey, testKey);
    setTaskStatus((s) => {
      const next = { ...s };
      delete next[`${subjectKey}-${testKey}`];
      return next;
    });
  }

  const canGenerate = !!storedKey && generating === null;

  return (
    <motion.div
      key="refresh"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col w-full h-full"
      style={{
        background:
          "linear-gradient(145deg,#0a1628 0%,#0e7490 50%,#155e75 100%)",
      }}
    >
      <NavHeader title="AI question banks" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-3 sm:px-5 pb-8 min-h-0 flex flex-col gap-4 pt-4 max-w-2xl mx-auto w-full">
        {/* Scores reassurance — same visual language as My Stars hero */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 flex gap-3 sm:gap-4 items-center shrink-0"
          style={{
            background: "rgba(16,185,129,0.12)",
            border: "1.5px solid rgba(52,211,153,0.35)",
          }}
        >
          <span className="text-3xl sm:text-4xl shrink-0" aria-hidden>
            🛡️
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-emerald-100 font-extrabold text-sm sm:text-base leading-tight">
              High scores and My Stars stay on this iPad
            </div>
            <p className="text-emerald-100/75 text-xs sm:text-sm mt-1 leading-snug">
              Only the question pool changes here. Nothing clears saved quiz
              history.
            </p>
          </div>
        </motion.div>

        {/* API key */}
        <div className="rounded-2xl p-4 sm:p-5 shrink-0" style={cardSurface}>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-white font-extrabold text-sm sm:text-base tracking-tight">
              OpenAI API key
            </span>
            {!editingKey && storedKey && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playTap();
                  setKeyDraft(storedKey);
                  setEditingKey(true);
                }}
                className="text-teal-200 text-sm font-bold px-3 py-1.5 rounded-xl shrink-0"
                style={{ background: "rgba(255,255,255,0.1)" }}
              >
                Change key
              </motion.button>
            )}
          </div>

          {editingKey ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && keyDraft.trim().length > 10 && saveKey()
                }
                placeholder="sk-…"
                autoComplete="off"
                className="w-full min-h-[48px] rounded-xl px-3 py-2.5 text-white text-sm font-mono outline-none"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playTap();
                  saveKey();
                }}
                disabled={keyDraft.trim().length < 10}
                className="min-h-[48px] sm:min-w-[100px] px-5 rounded-xl font-extrabold text-white text-sm shrink-0"
                style={{
                  background:
                    keyDraft.trim().length >= 10
                      ? "#7c3aed"
                      : "rgba(255,255,255,0.1)",
                  opacity: keyDraft.trim().length >= 10 ? 1 : 0.5,
                }}
              >
                Save
              </motion.button>
            </div>
          ) : (
            <div
              className="font-mono text-sm text-zinc-300 break-all py-1"
              aria-label="API key saved (masked)"
            >
              {storedKey
                ? `${storedKey.slice(0, 7)}••••••••••••${storedKey.slice(-4)}`
                : "No key saved"}
            </div>
          )}
          <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
            Stored only on this device. Calls{" "}
            <span className="text-zinc-300 font-semibold">gpt-4o-mini</span> to
            build question lists.
          </p>
        </div>

        <p className="text-zinc-300 text-xs sm:text-sm font-semibold px-0.5 -mb-1">
          Topics
        </p>

        {Object.entries(SUBJECTS).map(([subjectKey, subj], si) => {
          const isOpen = expanded === subjectKey;
          const freshCount = subj.tests.filter((t) =>
            loadCustomQuestions(subjectKey, t.key),
          ).length;

          return (
            <motion.div
              key={subjectKey}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: si * 0.03,
                type: "spring",
                stiffness: 280,
                damping: 24,
              }}
              className="rounded-2xl overflow-hidden"
              style={cardSurface}
            >
              <div className="flex items-stretch min-h-[56px]">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex-1 flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 text-left min-w-0"
                  onClick={() => {
                    playTap();
                    setExpanded(isOpen ? null : subjectKey);
                  }}
                >
                  <span className="text-3xl shrink-0">{subj.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-extrabold text-[15px] sm:text-base leading-snug">
                      {subj.label}
                    </div>
                    <div className="text-zinc-400 text-xs font-semibold mt-0.5">
                      {subj.tests.length} quizzes
                      {freshCount > 0
                        ? ` · ${freshCount} on AI`
                        : " · built-in only"}
                    </div>
                  </div>
                  <span
                    className="text-zinc-400 text-xl font-light shrink-0 w-8 text-center"
                    aria-hidden
                  >
                    {isOpen ? "▾" : "▸"}
                  </span>
                </button>

                <motion.button
                  type="button"
                  whileTap={{ scale: canGenerate ? 0.98 : 1 }}
                  disabled={!canGenerate}
                  aria-label="Refresh AI question banks for all quizzes in this topic"
                  title="Refresh AI banks for every quiz in this topic"
                  onClick={(e) => {
                    e.stopPropagation();
                    generateAll(subjectKey);
                  }}
                  className="shrink-0 min-w-[3.25rem] sm:min-w-[9.5rem] px-2 sm:px-3 border-l border-white/10 text-center text-[11px] sm:text-xs font-extrabold leading-tight flex flex-col items-center justify-center gap-0.5"
                  style={{
                    background: canGenerate
                      ? "rgba(124,58,237,0.22)"
                      : "rgba(0,0,0,0.12)",
                    color: canGenerate ? "#ddd6fe" : "rgba(255,255,255,0.22)",
                  }}
                >
                  <span className="text-base sm:text-lg" aria-hidden>
                    🔄
                  </span>
                  <span className="hidden sm:inline">All in topic</span>
                </motion.button>
              </div>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 sm:px-4 pb-4 pt-1 flex flex-col gap-2.5 border-t border-white/10 bg-black/15">
                      {subj.tests.map((test) => {
                        const id = `${subjectKey}-${test.key}`;
                        const existing = loadCustomQuestions(
                          subjectKey,
                          test.key,
                        );
                        const status = taskStatus[id];
                        const isGen = generating === id;

                        return (
                          <div
                            key={test.key}
                            className="rounded-xl p-3 sm:p-4 flex flex-col gap-3"
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div className="flex gap-3 items-start min-w-0">
                              <span className="text-2xl shrink-0 mt-0.5">
                                {test.emoji}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-bold text-sm sm:text-[15px] leading-snug">
                                  {test.label}
                                </div>
                                {isGen ? (
                                  <div className="text-violet-300 text-xs font-semibold mt-1.5">
                                    Generating new questions…
                                  </div>
                                ) : status?.error ? (
                                  <div className="text-red-300 text-xs font-medium mt-1.5 break-words">
                                    {status.error}
                                  </div>
                                ) : status?.count ? (
                                  <div className="text-emerald-300 text-xs font-semibold mt-1.5">
                                    Saved {status.count} questions
                                  </div>
                                ) : existing ? (
                                  <div className="text-zinc-400 text-xs font-medium mt-1.5">
                                    {existing.questions.length} AI questions ·
                                    updated {formatAge(existing.generatedAt)}
                                  </div>
                                ) : (
                                  <div className="text-zinc-500 text-xs font-medium mt-1.5">
                                    {test.questions.length} built-in questions
                                    in bank
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              {existing && !isGen && (
                                <motion.button
                                  type="button"
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => clear(subjectKey, test.key)}
                                  className="min-h-[46px] flex-1 rounded-xl text-sm font-extrabold"
                                  style={btnDanger}
                                >
                                  Reset to built-in
                                </motion.button>
                              )}
                              <motion.button
                                type="button"
                                whileTap={{ scale: canGenerate ? 0.98 : 1 }}
                                onClick={() => {
                                  playTap();
                                  generate(subjectKey, test);
                                }}
                                disabled={!canGenerate}
                                className="min-h-[46px] flex-[1.2] rounded-xl text-sm font-extrabold"
                                style={btnPrimary(canGenerate)}
                              >
                                {isGen
                                  ? "Working…"
                                  : existing
                                    ? "Refresh AI bank"
                                    : "Generate AI bank"}
                              </motion.button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
