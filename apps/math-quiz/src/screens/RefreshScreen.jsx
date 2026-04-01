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

function formatAge(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function RefreshScreen({ onBack }) {
  const [storedKey, setStoredKey] = useState(loadApiKey);
  const [keyDraft, setKeyDraft] = useState(loadApiKey);
  const [editingKey, setEditingKey] = useState(!loadApiKey());
  const [expanded, setExpanded] = useState(null);
  const [generating, setGenerating] = useState(null); // 'subjectKey-testKey'
  const [taskStatus, setTaskStatus] = useState({}); // id → { count?, error? }

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
    for (const test of SUBJECTS[subjectKey].tests) {
      await generate(subjectKey, test);
    }
  }

  function clear(subjectKey, testKey) {
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
      style={{ background: "linear-gradient(135deg,#0f0a2e,#1a0a3e)" }}
    >
      <NavHeader title="🔄 Refresh Questions" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pb-6 min-h-0 flex flex-col gap-3 pt-3">
        {/* API Key card */}
        <div
          className="rounded-2xl p-4 border border-white/10 shrink-0"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">
              🔑 OpenAI API Key
            </span>
            {!editingKey && storedKey && (
              <button
                onClick={() => {
                  setKeyDraft(storedKey);
                  setEditingKey(true);
                }}
                className="text-white/40 text-xs underline"
              >
                Edit
              </button>
            )}
          </div>

          {editingKey ? (
            <div className="flex gap-2">
              <input
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && keyDraft.trim().length > 10 && saveKey()
                }
                placeholder="sk-..."
                className="flex-1 rounded-xl px-3 py-2 text-white text-sm font-mono outline-none"
                style={{
                  background: "rgba(255,255,255,0.09)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              />
              <button
                onClick={saveKey}
                disabled={keyDraft.trim().length < 10}
                className="px-4 py-2 rounded-xl font-bold text-white text-sm"
                style={{
                  background:
                    keyDraft.trim().length >= 10
                      ? "#7c3aed"
                      : "rgba(255,255,255,0.1)",
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <span className="text-white/50 text-sm font-mono">
              {storedKey.slice(0, 7)}••••••••••••{storedKey.slice(-4)}
            </span>
          )}
          <p className="text-white/25 text-xs mt-2">
            Stored locally on this device only. Used to call OpenAI gpt-4o-mini.
          </p>
        </div>

        {/* Subject list */}
        {Object.entries(SUBJECTS).map(([subjectKey, subj], si) => {
          const isOpen = expanded === subjectKey;
          const freshCount = subj.tests.filter((t) =>
            loadCustomQuestions(subjectKey, t.key),
          ).length;

          return (
            <motion.div
              key={subjectKey}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: si * 0.04,
                type: "spring",
                stiffness: 280,
                damping: 24,
              }}
              className="rounded-2xl overflow-hidden border border-white/10"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {/* Subject header row */}
              <button
                className="w-full flex items-center gap-3 px-5 py-4"
                onClick={() => setExpanded(isOpen ? null : subjectKey)}
              >
                <span className="text-3xl">{subj.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="text-white font-bold text-base">
                    {subj.label}
                  </div>
                  <div className="text-white/35 text-xs">
                    {subj.tests.length} tests
                  </div>
                </div>
                {freshCount > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full shrink-0"
                    style={{
                      background: "rgba(52,211,153,0.15)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.35)",
                    }}
                  >
                    ✨ {freshCount}/{subj.tests.length} fresh
                  </span>
                )}
                <span className="text-white/30 text-lg ml-1 shrink-0">
                  {isOpen ? "▾" : "›"}
                </span>
              </button>

              {/* Expanded tests */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-5 pb-4 flex flex-col gap-2 border-t border-white/08 pt-3">
                      {/* Refresh All button */}
                      <div className="flex justify-end mb-1">
                        <button
                          disabled={!canGenerate}
                          onClick={() => generateAll(subjectKey)}
                          className="text-xs px-3 py-1.5 rounded-full font-bold"
                          style={{
                            background: canGenerate
                              ? "rgba(124,58,237,0.25)"
                              : "rgba(255,255,255,0.04)",
                            color: canGenerate
                              ? "#a78bfa"
                              : "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(124,58,237,0.35)",
                          }}
                        >
                          🔄 Refresh All Tests
                        </button>
                      </div>

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
                            className="flex items-center gap-3 rounded-xl px-4 py-3"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                          >
                            <span className="text-xl shrink-0">
                              {test.emoji}
                            </span>

                            {/* Status text */}
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-bold leading-snug">
                                {test.label}
                              </div>
                              {isGen ? (
                                <div className="text-purple-300 text-xs mt-0.5">
                                  Generating…
                                </div>
                              ) : status?.error ? (
                                <div className="text-red-400 text-xs mt-0.5 truncate">
                                  {status.error}
                                </div>
                              ) : status?.count ? (
                                <div className="text-green-400 text-xs mt-0.5">
                                  ✓ {status.count} questions saved
                                </div>
                              ) : existing ? (
                                <div className="text-white/40 text-xs mt-0.5">
                                  ✨ {existing.questions.length} AI questions ·{" "}
                                  {formatAge(existing.generatedAt)}
                                </div>
                              ) : (
                                <div className="text-white/30 text-xs mt-0.5">
                                  {test.questions.length} built-in questions
                                </div>
                              )}
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2 shrink-0">
                              {existing && !isGen && (
                                <button
                                  onClick={() => clear(subjectKey, test.key)}
                                  className="text-xs px-2 py-1 rounded-lg"
                                  style={{
                                    background: "rgba(239,68,68,0.12)",
                                    color: "#f87171",
                                    border: "1px solid rgba(239,68,68,0.25)",
                                  }}
                                >
                                  Reset
                                </button>
                              )}
                              <button
                                onClick={() => generate(subjectKey, test)}
                                disabled={!canGenerate}
                                className="text-xs px-3 py-1.5 rounded-lg font-bold"
                                style={{
                                  background: canGenerate
                                    ? "rgba(124,58,237,0.35)"
                                    : "rgba(255,255,255,0.05)",
                                  color: canGenerate
                                    ? "#c4b5fd"
                                    : "rgba(255,255,255,0.2)",
                                  border: "1px solid rgba(124,58,237,0.3)",
                                }}
                              >
                                {isGen
                                  ? "…"
                                  : existing
                                    ? "Refresh"
                                    : "Generate"}
                              </button>
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
