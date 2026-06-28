import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ListChecks,
  X,
  RotateCw,
  Plus,
} from "lucide-react";
import API from "../../utils/axios";

/**
 * @typedef {Object} Question
 * @property {string} questionText
 * @property {string[]} options
 * @property {number} correctAnswerIndex
 * @property {"mcq"|"truefalse"} [type]
 * @property {"easy"|"medium"|"hard"} [difficulty]
 */

/**
 * AIPanel — inline AI question-generation panel for the Create Test page.
 *
 * Lets the instructor enter a concept + count + difficulty + type, calls
 * `POST /test/generate-questions`, previews the result, and lets the user
 * add all questions to the parent test in one action.
 *
 * Errors are displayed inline (no toast from this component) so the form
 * values are preserved for retry. Success feedback (toast) is the parent's
 * responsibility and is fired when `onAddQuestions` is called.
 *
 * @param {Object} props
 * @param {(questions: Question[]) => void} props.onAddQuestions
 *   Invoked when the user clicks "Add All to Test". Receives the full
 *   generated question list in the same shape the backend returned.
 */
function AIPanel({ onAddQuestions }) {
  // ---- Form state ----------------------------------------------------
  const [concept, setConcept] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [type, setType] = useState("mcq");

  // ---- Request state -------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(/** @type {Question[] | null} */ (null));
  const [error, setError] = useState(/** @type {string | null} */ (null));

  // ---- Derived validation -------------------------------------------
  const trimmedConcept = concept.trim();
  const conceptValid =
    trimmedConcept.length >= 3 && trimmedConcept.length <= 200;
  const countValid =
    Number.isInteger(Number(count)) && Number(count) >= 1 && Number(count) <= 20;
  const canGenerate = !loading && conceptValid && countValid;

  // ---- Request --------------------------------------------------------
  const callGenerate = async () => {
    if (!canGenerate) {
      if (!conceptValid) {
        setError(
          trimmedConcept.length === 0
            ? "Please enter a concept."
            : trimmedConcept.length < 3
            ? "Concept must be at least 3 characters."
            : "Concept must be at most 200 characters."
        );
      } else if (!countValid) {
        setError("Count must be an integer between 1 and 20.");
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await API.post("/test/generate-questions", {
        concept: trimmedConcept,
        count: Number(count),
        difficulty,
        type,
      });
      const list = data?.data?.questions;
      if (!Array.isArray(list) || list.length === 0) {
        setError("The AI service returned no questions. Please try again.");
        return;
      }
      setGenerated(list);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate questions. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setGenerated(null);
    setError(null);
  };

  const handleRegenerate = () => {
    if (loading) return;
    callGenerate();
  };

  const handleAddAll = () => {
    if (!generated || generated.length === 0 || loading) return;
    onAddQuestions(generated);
    setGenerated(null);
    setError(null);
  };

  // ---- Render --------------------------------------------------------
  return (
    <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-slate-900">
              Generate questions with AI
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
              <Sparkles className="h-3 w-3" />
              AI Assistant
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Give a concept and we&apos;ll draft multiple-choice or true/false
            questions for you. You can review and edit before adding.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="ai-concept"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Concept
          </label>
          <input
            id="ai-concept"
            type="text"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="e.g. Photosynthesis, World War II, JavaScript closures"
            className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            disabled={loading}
          />
          {concept.length > 0 && trimmedConcept.length < 3 && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Concept must be at least 3 characters.
            </p>
          )}
          {trimmedConcept.length > 200 && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Concept must be at most 200 characters.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Count */}
          <div>
            <label
              htmlFor="ai-count"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Number of questions
            </label>
            <input
              id="ai-count"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              disabled={loading}
              className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">1 – 20</p>
          </div>

          {/* Difficulty segmented */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Difficulty
            </label>
            <div className="inline-flex w-full rounded-xl bg-slate-100 p-1">
              {[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ].map((opt) => {
                const active = difficulty === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDifficulty(opt.value)}
                    disabled={loading}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                      active
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 disabled:opacity-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type segmented */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Question type
            </label>
            <div className="inline-flex w-full rounded-xl bg-slate-100 p-1">
              {[
                { value: "mcq", label: "MCQ" },
                { value: "truefalse", label: "True-False" },
              ].map((opt) => {
                const active = type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    disabled={loading}
                    className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                      active
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 disabled:opacity-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={callGenerate}
          disabled={!canGenerate}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate questions
            </>
          )}
        </button>
      </div>

      {/* Inline error banner */}
      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-xl bg-rose-50 ring-1 ring-rose-200 p-3 text-sm text-rose-800"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Couldn&apos;t generate questions</p>
            <p className="mt-0.5 text-rose-700">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded transition"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Preview list */}
      {generated && generated.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Preview — {generated.length} question
            {generated.length === 1 ? "" : "s"} generated
          </h3>
          <ul className="space-y-3">
            {generated.map((q, i) => {
              const qType = q.type || type;
              const qDifficulty = q.difficulty || difficulty;
              return (
                <li
                  key={i}
                  className="rounded-xl ring-1 ring-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white">
                      Q{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            qType === "mcq"
                              ? "bg-indigo-50 text-indigo-700"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <ListChecks className="h-3 w-3" />
                          {qType === "mcq" ? "MCQ" : "T/F"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-200 text-slate-700 px-2 py-0.5 text-[11px] font-semibold capitalize">
                          {qDifficulty}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 break-words">
                        {q.questionText}
                      </p>
                      <ul className="mt-2.5 space-y-1.5">
                        {q.options.map((opt, j) => {
                          const isCorrect = j === q.correctAnswerIndex;
                          return (
                            <li
                              key={j}
                              className={`flex items-start gap-2 text-sm ${
                                isCorrect
                                  ? "text-emerald-700 font-medium"
                                  : "text-slate-600"
                              }`}
                            >
                              <span
                                className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                                  isCorrect ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              />
                              <span className="break-words">{opt}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Action row */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              Discard
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw className="h-4 w-4" />
              Regenerate
            </button>
            <button
              type="button"
              onClick={handleAddAll}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add All to Test
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AIPanel;
