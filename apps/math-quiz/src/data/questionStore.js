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
    `Generate exactly ${count} multiple-choice quiz questions for a Tennessee student finishing 2nd grade / starting 3rd grade ` +
    `on the topic: "${subjectLabel} – ${testLabel}".\n` +
    `Rules:\n` +
    `- Age-appropriate, positive, and educational\n` +
    `- Mix of easy, medium, and a couple harder questions\n` +
    `- Exactly 4 answer choices per question\n` +
    `- The "answer" field must be the exact text of one of the choices\n\n` +
    `Return ONLY valid JSON (no markdown, no explanation):\n` +
    `{"questions":[{"q":"...","choices":["...","...","...","..."],"answer":"..."}]}`;

  // Helper: sleep for ms
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // Fetch with retry/backoff for 429/5xx responses. Honors Retry-After header if present.
  async function fetchWithRetries(url, opts, maxAttempts = 4) {
    const baseDelay = 600; // ms
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res = await fetch(url, opts).catch((e) => ({ ok: false, status: 0, _err: e }));

      // network-level failure
      if (!res.ok && res.status === 0) {
        if (attempt === maxAttempts) throw new Error(res._err?.message || "Network error");
        const jitter = Math.floor(Math.random() * 200);
        await sleep(baseDelay * attempt + jitter);
        continue;
      }

      // success
      if (res.ok) return res;

      // parse possible error body safely
      const body = await res.json().catch(() => ({}));

      // retry on 429 or 5xx
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        if (attempt === maxAttempts) {
          throw new Error(body?.error?.message ?? `API error ${res.status}`);
        }

        const ra = res.headers.get ? res.headers.get("Retry-After") : null;
        let waitMs = baseDelay * Math.pow(2, attempt - 1);
        if (ra) {
          const sec = parseInt(ra, 10);
          if (!Number.isNaN(sec)) waitMs = Math.max(waitMs, sec * 1000);
        }
        // add jitter
        waitMs += Math.floor(Math.random() * 400);
        await sleep(waitMs);
        continue;
      }

      // non-retriable error
      throw new Error(body?.error?.message ?? `API error ${res.status}`);
    }
  }

  const res = await fetchWithRetries("https://api.openai.com/v1/chat/completions", {
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
