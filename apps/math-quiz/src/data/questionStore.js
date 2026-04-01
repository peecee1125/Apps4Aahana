const CUSTOM_PREFIX = "custom-q-";
const API_KEY_KEY = "oai-key";

/** Returns { questions, generatedAt } or null */
export function loadCustomQuestions(subjectKey, testKey) {
  try {
    const raw = localStorage.getItem(
      `${CUSTOM_PREFIX}${subjectKey}-${testKey}`,
    );
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomQuestions(subjectKey, testKey, questions) {
  try {
    localStorage.setItem(
      `${CUSTOM_PREFIX}${subjectKey}-${testKey}`,
      JSON.stringify({ questions, generatedAt: Date.now() }),
    );
  } catch {}
}

export function clearCustomQuestions(subjectKey, testKey) {
  try {
    localStorage.removeItem(`${CUSTOM_PREFIX}${subjectKey}-${testKey}`);
  } catch {}
}

/** True if any test in this subject has been AI-refreshed */
export function subjectHasCustomQuestions(subjectKey, tests) {
  return tests.some((t) => loadCustomQuestions(subjectKey, t.key) !== null);
}

export function loadApiKey() {
  try {
    return localStorage.getItem(API_KEY_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveApiKey(key) {
  try {
    localStorage.setItem(API_KEY_KEY, key.trim());
  } catch {}
}

function validateQs(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (q) =>
      q &&
      typeof q.q === "string" &&
      q.q.trim().length > 0 &&
      Array.isArray(q.choices) &&
      q.choices.length === 4 &&
      q.choices.every((c) => typeof c === "string" && c.trim().length > 0) &&
      typeof q.answer === "string" &&
      q.choices.includes(q.answer),
  );
}

export async function generateQuestions(
  subjectLabel,
  testLabel,
  apiKey,
  count = 15,
) {
  const prompt =
    `Generate exactly ${count} multiple-choice quiz questions for an 8-year-old (2nd/3rd grade) ` +
    `on the topic: "${subjectLabel} – ${testLabel}".\n` +
    `Rules:\n` +
    `- Age-appropriate, positive, and educational\n` +
    `- Mix of easy, medium, and a couple harder questions\n` +
    `- Exactly 4 answer choices per question\n` +
    `- The "answer" field must be the exact text of one of the choices\n\n` +
    `Return ONLY valid JSON (no markdown, no explanation):\n` +
    `{"questions":[{"q":"...","choices":["...","...","...","..."],"answer":"..."}]}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `API error ${res.status}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse AI response as JSON");
    parsed = JSON.parse(match[0]);
  }

  const questions = validateQs(parsed.questions ?? parsed);
  if (questions.length < 10) {
    throw new Error(
      `Only ${questions.length} valid questions returned — need at least 10`,
    );
  }
  return questions;
}
