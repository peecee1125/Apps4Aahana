import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HomeScreen from "./screens/HomeScreen";
import SubjectMenuScreen from "./screens/SubjectMenuScreen";
import QuizScreen from "./screens/QuizScreen";
import ResultsScreen from "./screens/ResultsScreen";
import HistoryScreen from "./screens/HistoryScreen";
import RefreshScreen from "./screens/RefreshScreen";

export default function App() {
  const [nav, setNav] = useState({
    screen: "home",
    subject: null,
    testIdx: null,
    results: null,
  });
  const go = (updates) => setNav((prev) => ({ ...prev, ...updates }));

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#0f0a2e",
      }}
    >
      <AnimatePresence mode="wait">
        {nav.screen === "home" && (
          <HomeScreen
            key="home"
            onSelect={(subject) =>
              go({ screen: "subject", subject, testIdx: null, results: null })
            }
            onHistory={() => go({ screen: "history" })}
            onRefresh={() => go({ screen: "refresh" })}
          />
        )}
        {nav.screen === "subject" && (
          <SubjectMenuScreen
            key="subject"
            subject={nav.subject}
            onBack={() => go({ screen: "home" })}
            onSelect={(idx) =>
              go({ screen: "quiz", testIdx: idx, results: null })
            }
          />
        )}
        {nav.screen === "quiz" && (
          <QuizScreen
            key={`quiz-${nav.subject}-${nav.testIdx}`}
            subject={nav.subject}
            testIdx={nav.testIdx}
            onComplete={(results) => go({ screen: "results", results })}
            onBack={() => go({ screen: "subject" })}
          />
        )}
        {nav.screen === "results" && (
          <ResultsScreen
            key="results"
            subject={nav.subject}
            testIdx={nav.testIdx}
            results={nav.results}
            onPlayAgain={() => go({ screen: "quiz", results: null })}
            onHome={() => go({ screen: "home" })}
            onSubjectMenu={() => go({ screen: "subject" })}
          />
        )}
        {nav.screen === "history" && (
          <HistoryScreen key="history" onBack={() => go({ screen: "home" })} />
        )}
        {nav.screen === "refresh" && (
          <RefreshScreen key="refresh" onBack={() => go({ screen: "home" })} />
        )}
      </AnimatePresence>
    </div>
  );
}
