import { useState, useCallback } from "react";
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

function buildCustomSnapshot() {
  const snap = {};
  for (const [sk, subj] of Object.entries(SUBJECTS)) {
    for (const t of subj.tests) {
      const data = loadCustomQuestions(sk, t.key);
      snap[`${sk}-${t.key}`] = data
        ? {
            count: data.questions?.length ?? 0,
            generatedAt: data.generatedAt,
          }
        : null;
    }
  }
  return snap;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="50 20"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ snap, status, isGen }) {
  if (isGen) {
    return (
      <span className="inline-flex items-center gap-1.5 text-violet-300 text-xs font-semibold bg-violet-500/15 px-2.5 py-1 rounded-full">
        <Spinner /> Generating…
      </span>
    );
  }
  if (status?.error) {
    return (
      <span className="inline-flex items-center gap-1 text-red-300 text-xs font-medium bg-red-500/15 px-2.5 py-1 rounded-full">
        ⚠️ Error
      </span>
    );
  }
  if (status?.count) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-300 text-xs font-semibold bg-emerald-500/15 px-2.5 py-1 rounded-full">
        ✓ {status.count} saved
      </span>
    );
  }
  if (snap) {
    return (
      <span className="inline-flex items-center gap-1 text-teal-300 text-xs font-medium bg-teal-500/10 px-2.5 py-1 rounded-full">
        🤖 {snap.count}q · {formatAge(snap.generatedAt)}
      </span>
    );
  }
  return (
    <span className="text-zinc-500 text-xs font-medium px-2.5 py-1">
      built-in
    </span>
  );
}

export default function RefreshScreen({ onBack }) {
  const { playTap } = useSound();
  const [storedKey, setStoredKey] = useState(loadApiKey);
  const [keyDraft, setKeyDraft] = useState(loadApiKey);
  const [editingKey, setEditingKey] = useState(!loadApiKey());
  const [expanded, setExpanded] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [taskStatus, setTaskStatus] = useState({});
  const [customSnapshot, setCustomSnapshot] = useState(buildCustomSnapshot);
  const [genProgress, setGenProgress] = useState(null); // { current, total, subjectKey }

  const patchSnapshot = useCallback((subjectKey, testKey, value) => {
    const id = `${subjectKey}-${testKey}`;
    setCustomSnapshot((prev) => ({ ...prev, [id]: value }));
  }, []);

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
      patchSnapshot(subjectKey, test.key, {
        count: qs.length,
        generatedAt: Date.now(),
      });
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
    const tests = SUBJECTS[subjectKey].tests;
    setGenProgress({ current: 0, total: tests.length, subjectKey });
    for (let i = 0; i < tests.length; i++) {
      setGenProgress({ current: i + 1, total: tests.length, subjectKey });
      await generate(subjectKey, tests[i]);
      // 2 s gap between requests keeps us well under OpenAI rate limits
      if (i < tests.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    setGenProgress(null);
  }

  function clear(subjectKey, testKey) {
    playTap();
    clearCustomQuestions(subjectKey, testKey);
    patchSnapshot(subjectKey, testKey, null);
    setTaskStatus((s) => {
      const next = { ...s };
      delete next[`${subjectKey}-${testKey}`];
      return next;
    });
  }

  function clearAllInSubject(subjectKey) {
    playTap();
    const tests = SUBJECTS[subjectKey].tests;
    for (const t of tests) {
      clearCustomQuestions(subjectKey, t.key);
      patchSnapshot(subjectKey, t.key, null);
    }
    setTaskStatus((s) => {
      const next = { ...s };
      for (const t of tests) delete next[`${subjectKey}-${t.key}`];
      return next;
    });
  }

  const canGenerate = !!storedKey && generating === null;
  const hasKey = !!storedKey;

  return (
    <motion.div
      key="refresh"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col w-full h-full"
      style={{
        background:
          "linear-gradient(145deg,#0a1628 0%,#0e7490 50%,#155e75 100%)",
      }}
    >
      <NavHeader title="🤖 AI Question Banks" onBack={onBack} />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-5 pb-8 min-h-0 flex flex-col gap-4 pt-4 max-w-2xl mx-auto w-full touch-pan-y">
        {/* API Key Section — compact when saved */}
        <div
          className="rounded-2xl p-4 sm:p-5 shrink-0"
          style={{
            background: hasKey
              ? "rgba(255,255,255,0.05)"
              : "rgba(124,58,237,0.12)",
            border: `1px solid ${hasKey ? "rgba(255,255,255,0.1)" : "rgba(167,139,250,0.4)"}`,
          }}
        >
          {editingKey ? (
            <>
              <div className="text-white font-extrabold text-sm sm:text-base mb-3">
                🔑 Enter your OpenAI API key
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={keyDraft}
                  onChange={(e) => setKeyDraft(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    keyDraft.trim().length > 10 &&
                    saveKey()
                  }
                  placeholder="sk-…"
                  autoComplete="off"
                  className="w-full min-h-[48px] rounded-xl px-4 py-2.5 text-white text-sm font-mono outline-none placeholder:text-zinc-500"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    playTap();
                    saveKey();
                  }}
                  disabled={keyDraft.trim().length < 10}
                  className="min-h-[48px] sm:min-w-[100px] px-5 rounded-xl font-extrabold text-white text-sm shrink-0 active:scale-95 transition-transform"
                  style={{
                    background:
                      keyDraft.trim().length >= 10
                        ? "#7c3aed"
                        : "rgba(255,255,255,0.08)",
                    opacity: keyDraft.trim().length >= 10 ? 1 : 0.4,
                  }}
                >
                  Save key
                </button>
              </div>
              <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
                Stored only on this device. Uses{" "}
                <span className="text-zinc-300 font-semibold">gpt-4o-mini</span>{" "}
                to generate fresh questions.
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg">🔑</span>
                <span className="text-zinc-300 text-sm font-mono truncate">
                  {storedKey.slice(0, 7)}••••{storedKey.slice(-4)}
                </span>
                <span className="text-emerald-400 text-xs font-bold">
                  ✓ Saved
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playTap();
                  setKeyDraft(storedKey);
                  setEditingKey(true);
                }}
                className="text-zinc-300 text-xs font-bold px-3 py-2 rounded-lg shrink-0 active:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                Change
              </button>
            </div>
          )}
        </div>

        {/* No-key warning */}
        {!hasKey && !editingKey && (
          <div
            className="rounded-xl px-4 py-3 text-center text-amber-200 text-sm font-semibold"
            style={{
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.3)",
            }}
          >
            Add an API key above to enable AI question generation
          </div>
        )}

        {/* Subject list */}
        {hasKey && (
          <p className="text-zinc-300/80 text-xs font-semibold px-1 -mb-1 uppercase tracking-wider">
            Tap a subject to manage its quizzes
          </p>
        )}

        {Object.entries(SUBJECTS).map(([subjectKey, subj]) => {
          const isOpen = expanded === subjectKey;
          const freshCount = subj.tests.filter(
            (t) => customSnapshot[`${subjectKey}-${t.key}`],
          ).length;
          const isGeneratingThis = genProgress?.subjectKey === subjectKey;

          return (
            <div
              key={subjectKey}
              className="rounded-2xl overflow-hidden"
              style={{
                background: isOpen
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${isOpen ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.1)"}`,
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              {/* Subject header */}
              <button
                type="button"
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 text-left min-h-[56px] active:bg-white/5 transition-colors"
                onClick={() => {
                  playTap();
                  setExpanded(isOpen ? null : subjectKey);
                }}
              >
                <span className="text-2xl sm:text-3xl shrink-0">
                  {subj.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-extrabold text-sm sm:text-base leading-snug">
                    {subj.label}
                  </div>
                  <div className="text-zinc-400 text-xs font-medium mt-0.5 flex items-center gap-2">
                    <span>{subj.tests.length} quizzes</span>
                    {freshCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        🤖 {freshCount}/{subj.tests.length} AI
                      </span>
                    )}
                  </div>
                </div>
                {isGeneratingThis && (
                  <span className="text-violet-300 text-xs font-bold shrink-0 mr-1">
                    {genProgress.current}/{genProgress.total}
                  </span>
                )}
                <span
                  className="text-zinc-500 shrink-0 transition-transform duration-200"
                  style={{
                    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                  aria-hidden
                >
                  ▶
                </span>
              </button>

              {/* Expanded panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/10 px-3 sm:px-4 pb-4 pt-3 flex flex-col gap-2.5">
                      {/* Batch actions */}
                      <div className="flex gap-2 mb-1">
                        <button
                          type="button"
                          disabled={!canGenerate}
                          onClick={() => generateAll(subjectKey)}
                          className="flex-1 min-h-[44px] rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform disabled:opacity-40"
                          style={{
                            background: canGenerate
                              ? "rgba(124,58,237,0.35)"
                              : "rgba(255,255,255,0.04)",
                            color: canGenerate
                              ? "#e9d5ff"
                              : "rgba(255,255,255,0.25)",
                            border: `1px solid ${canGenerate ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.06)"}`,
                          }}
                        >
                          {isGeneratingThis ? (
                            <>
                              <Spinner />
                              Generating {genProgress.current}/
                              {genProgress.total}…
                            </>
                          ) : (
                            <>✨ Generate All ({subj.tests.length})</>
                          )}
                        </button>
                        {freshCount > 0 && (
                          <button
                            type="button"
                            disabled={generating !== null}
                            onClick={() => clearAllInSubject(subjectKey)}
                            className="min-h-[44px] px-4 rounded-xl text-sm font-bold active:scale-[0.97] transition-transform disabled:opacity-40"
                            style={{
                              background: "rgba(239,68,68,0.12)",
                              color: "#fca5a5",
                              border: "1px solid rgba(248,113,113,0.25)",
                            }}
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Individual quiz rows */}
                      {subj.tests.map((test) => {
                        const id = `${subjectKey}-${test.key}`;
                        const snap = customSnapshot[id];
                        const status = taskStatus[id];
                        const isGen = generating === id;

                        return (
                          <div
                            key={test.key}
                            className="rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-3"
                            style={{
                              background: isGen
                                ? "rgba(124,58,237,0.08)"
                                : "rgba(255,255,255,0.04)",
                              border: `1px solid ${isGen ? "rgba(167,139,250,0.25)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            <span className="text-xl shrink-0">
                              {test.emoji}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold text-sm leading-snug truncate">
                                {test.label}
                              </div>
                              {status?.error && (
                                <div className="text-red-300 text-[11px] font-medium mt-0.5 truncate">
                                  {status.error}
                                </div>
                              )}
                            </div>
                            <StatusBadge
                              snap={snap}
                              status={status}
                              isGen={isGen}
                            />
                            <div className="flex items-center gap-1.5 shrink-0">
                              {snap && !isGen && (
                                <button
                                  type="button"
                                  onClick={() => clear(subjectKey, test.key)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-300 active:scale-90 transition-transform"
                                  style={{ background: "rgba(239,68,68,0.12)" }}
                                  title="Reset to built-in"
                                  aria-label={`Reset ${test.label} to built-in`}
                                >
                                  ✕
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  playTap();
                                  generate(subjectKey, test);
                                }}
                                disabled={!canGenerate}
                                className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
                                style={{
                                  background: canGenerate
                                    ? "rgba(124,58,237,0.3)"
                                    : "rgba(255,255,255,0.04)",
                                  color: canGenerate
                                    ? "#e9d5ff"
                                    : "rgba(255,255,255,0.2)",
                                }}
                                title={
                                  snap
                                    ? "Refresh AI questions"
                                    : "Generate AI questions"
                                }
                                aria-label={`Generate AI questions for ${test.label}`}
                              >
                                {isGen ? <Spinner /> : "⚡"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Footer note */}
        <p className="text-zinc-500 text-[11px] text-center px-4 pt-2 pb-2 leading-relaxed">
          🛡️ Your scores and stars are never affected. Only the question pools
          change here.
        </p>
      </div>
    </motion.div>
  );
}
