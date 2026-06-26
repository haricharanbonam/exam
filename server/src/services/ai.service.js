import { ApiError } from "../utils/ApiError.js";

const VALID_TYPES = new Set(["mcq", "truefalse"]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

const useMock =
  process.env.AI_USE_MOCK === "true" ||
  !process.env.OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY.trim() === "";

function _generateMock({ concept, count, difficulty, type }) {
  const questions = [];
  for (let i = 0; i < count; i++) {
    const isMcq = type === "mcq";
    const options = isMcq
      ? ["Option A", "Option B", "Option C", "Option D"]
      : ["True", "False"];
    const correctAnswerIndex = isMcq ? i % 4 : i % 2;
    const stem = isMcq
      ? `Which of the following best describes ${concept}?`
      : `${concept} is a topic worth studying carefully.`;
    questions.push({
      questionText: `[Sample] ${stem}`,
      options,
      correctAnswerIndex,
      type,
      difficulty,
    });
  }
  return questions;
}

async function _generateOpenAI({ concept, count, difficulty, type }) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const apiKey = process.env.OPENAI_API_KEY;

  const optionCount = type === "truefalse" ? 2 : 4;
  const optionsHint =
    type === "truefalse"
      ? 'exactly 2 options: "True" and "False" (in that order)'
      : `exactly 4 distinct, plausible options`;

  const schemaExample =
    type === "truefalse"
      ? `{"questionText":"...","options":["True","False"],"correctAnswerIndex":0,"type":"truefalse","difficulty":"${difficulty}"}`
      : `{"questionText":"...","options":["A","B","C","D"],"correctAnswerIndex":0,"type":"mcq","difficulty":"${difficulty}"}`;

  const systemPrompt =
    "You generate quiz questions. Always respond with valid JSON matching the requested schema. Do not include markdown, commentary, or extra text.";

  const userPrompt = `Generate ${count} ${difficulty} difficulty ${type === "truefalse" ? "true/false" : "multiple-choice"} quiz questions about: "${concept}".

Respond with a JSON object of the form:
{
  "questions": [
    ${schemaExample}
  ]
}

Each question must have:
- "questionText": a non-empty string
- "options": an array of ${optionsHint}
- "correctAnswerIndex": an integer in [0, options.length - 1] pointing to the correct option
- "type": "${type}"
- "difficulty": "${difficulty}"

Return exactly ${count} questions. Do not include any text outside the JSON object.`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const reason =
      err && err.name === "AbortError"
        ? "OpenAI request timed out after 30s"
        : `OpenAI request failed: ${err && err.message ? err.message : "network error"}`;
    throw new ApiError(502, reason);
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const statusText = response.statusText || `HTTP ${response.status}`;
    throw new ApiError(
      502,
      `AI service request failed: ${response.status} ${statusText}`
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    throw new ApiError(502, "AI service returned invalid JSON");
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new ApiError(502, "AI service returned no content");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new ApiError(502, "AI service returned invalid JSON");
  }

  const questions = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.questions)
      ? parsed.questions
      : null;

  if (!questions || questions.length === 0) {
    throw new ApiError(502, "AI service returned malformed questions");
  }

  const validated = [];
  for (const q of questions) {
    if (!q || typeof q !== "object") continue;
    const { questionText, options, correctAnswerIndex } = q;
    if (typeof questionText !== "string" || questionText.trim() === "") continue;
    if (!Array.isArray(options) || options.length !== optionCount) continue;
    if (
      !options.every((o) => typeof o === "string" && o.trim() !== "")
    ) {
      continue;
    }
    if (
      typeof correctAnswerIndex !== "number" ||
      !Number.isInteger(correctAnswerIndex) ||
      correctAnswerIndex < 0 ||
      correctAnswerIndex >= options.length
    ) {
      continue;
    }
    validated.push({
      questionText: questionText.trim(),
      options: options.map((o) => o.trim()),
      correctAnswerIndex,
      type,
      difficulty,
    });
  }

  if (validated.length === 0) {
    throw new ApiError(502, "AI service returned malformed questions");
  }

  return validated.slice(0, count);
}

async function generateQuestions({
  concept,
  count,
  difficulty = "medium",
  type = "mcq",
} = {}) {
  if (!VALID_DIFFICULTIES.has(difficulty)) {
    throw new ApiError(400, `Invalid difficulty: ${difficulty}`);
  }
  if (!VALID_TYPES.has(type)) {
    throw new ApiError(400, `Invalid type: ${type}`);
  }

  if (useMock) {
    return _generateMock({ concept, count, difficulty, type });
  }
  return _generateOpenAI({ concept, count, difficulty, type });
}

const aiService = {
  generateQuestions,
  _generateMock,
  _generateOpenAI,
  get mode() {
    return useMock ? "mock" : "openai";
  },
};

export { aiService };
export default aiService;
