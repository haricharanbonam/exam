import React, { useState } from "react";
import { CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";

const DEFAULT_MCQ_OPTIONS = ["", "", "", ""];
const TF_OPTIONS = ["True", "False"];
const MAX_OPTIONS = 6;
const MIN_OPTIONS = 2;

function QuestionEditor({ initial, mode, onSave, onCancel }) {
  const [type, setType] = useState(initial?.type || "mcq");
  const [questionText, setQuestionText] = useState(initial?.questionText || "");
  const [options, setOptions] = useState(
    initial?.options
      ? [...initial.options]
      : initial?.type === "truefalse"
      ? [...TF_OPTIONS]
      : [...DEFAULT_MCQ_OPTIONS]
  );
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(
    typeof initial?.correctAnswerIndex === "number" ? initial.correctAnswerIndex : 0
  );
  const [touched, setTouched] = useState(false);

  const isMCQ = type === "mcq";

  const switchType = (next) => {
    setType(next);
    if (next === "truefalse") {
      setOptions([...TF_OPTIONS]);
      setCorrectAnswerIndex(0);
    } else if (isMCQ === false || (initial?.type === "truefalse" && next === "mcq")) {
      // Switching from T/F to MCQ: provide 4 blank options
      setOptions(["", "", "", ""]);
      setCorrectAnswerIndex(0);
    }
  };

  const handleOptionChange = (index, value) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const addOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectAnswerIndex((prev) => {
      if (prev === index) return 0;
      if (prev > index) return prev - 1;
      return prev;
    });
  };

  const trimmedQuestion = questionText.trim();
  const trimmedOptions = options.map((o) => o.trim());
  const questionValid = trimmedQuestion.length > 0;
  const optionsValid = trimmedOptions.every((o) => o.length > 0);
  const correctValid = correctAnswerIndex >= 0 && correctAnswerIndex < options.length;
  const isValid = questionValid && optionsValid && correctValid;

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onSave({
      questionText: trimmedQuestion,
      options: trimmedOptions,
      correctAnswerIndex,
      type,
    });
  };

  const showError = (cond) => touched && cond;

  return (
    <div className="space-y-5">
      {/* Type segmented control */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Question Type
        </label>
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => switchType("mcq")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
              isMCQ
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Multiple Choice
          </button>
          <button
            type="button"
            onClick={() => switchType("truefalse")}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition ${
              !isMCQ
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            True / False
          </button>
        </div>
      </div>

      {/* Question text */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Question
        </label>
        <textarea
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Type your question here..."
          className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
        />
        {showError(!questionValid) && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
            <AlertCircle className="h-3.5 w-3.5" />
            Question text is required.
          </p>
        )}
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700">
            Options <span className="text-slate-400">(click the dot to mark correct)</span>
          </label>
          {isMCQ && options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOption}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add option
            </button>
          )}
        </div>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrectAnswerIndex(idx)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                  correctAnswerIndex === idx
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-slate-300 ring-1 ring-slate-300 hover:ring-slate-400"
                }`}
                title={correctAnswerIndex === idx ? "Correct answer" : "Mark as correct"}
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                disabled={!isMCQ}
                placeholder={`Option ${idx + 1}`}
                className="block w-full rounded-xl border-0 px-3.5 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:bg-slate-50 disabled:text-slate-600"
              />
              {isMCQ && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  disabled={options.length <= MIN_OPTIONS}
                  className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Remove option"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {showError(!optionsValid) && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
            <AlertCircle className="h-3.5 w-3.5" />
            All options must be filled.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          {mode === "edit" ? "Save changes" : "Add question"}
        </button>
      </div>
    </div>
  );
}

export default QuestionEditor;
