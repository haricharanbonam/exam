import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Save,
  Send,
  Eraser,
  Check,
  Keyboard,
} from "lucide-react";
import { forwardRef } from "react";

function formatRelative(date) {
  if (!date) return "";
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 5) return "Saved just now";
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `Saved ${min}m ago`;
  const hr = Math.floor(min / 60);
  return `Saved ${hr}h ago`;
}

const SHORTCUTS = [
  { keys: ["1"–"4"], label: "Select option" },
  { keys: ["←", "→"], label: "Prev / Next question" },
  { keys: ["F"], label: "Toggle flag" },
  { keys: ["Ctrl", "Enter"], label: "Save & Next" },
  { keys: ["Ctrl", "Shift", "Enter"], label: "Open submit dialog" },
];

function ShortcutHint() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Keyboard shortcuts"
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        <Keyboard className="h-3.5 w-3.5" />
        Shortcuts
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 z-30 w-64 rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Keyboard Shortcuts
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-center justify-between text-xs text-slate-700">
              <span>Select option</span>
              <span className="flex gap-1">
                {["1", "2", "3", "4"].map((k) => (
                  <kbd key={k} className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">{k}</kbd>
                ))}
              </span>
            </li>
            <li className="flex items-center justify-between text-xs text-slate-700">
              <span>Prev / Next</span>
              <span className="flex gap-1">
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">←</kbd>
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">→</kbd>
              </span>
            </li>
            <li className="flex items-center justify-between text-xs text-slate-700">
              <span>Toggle flag</span>
              <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">F</kbd>
            </li>
            <li className="flex items-center justify-between text-xs text-slate-700">
              <span>Save &amp; Next</span>
              <span className="flex gap-1 items-center">
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
                <span className="text-slate-400 text-[10px]">+</span>
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>
              </span>
            </li>
            <li className="flex items-center justify-between text-xs text-slate-700">
              <span>Submit dialog</span>
              <span className="flex gap-1 items-center">
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
                <span className="text-slate-400 text-[10px]">+</span>
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">⇧</kbd>
                <span className="text-slate-400 text-[10px]">+</span>
                <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

const QuestionCard = forwardRef(function QuestionCard(
  {
    question,
    index,
    totalQuestions,
    selectedOption,
    flagged,
    onSelect,
    onPrev,
    onNext,
    onSaveAnswer,
    onToggleFlag,
    onClear,
    onSubmit,
    isFirst,
    isLast,
    lastSavedAt,
    saving,
  },
  ref
) {
  const [, tick] = useState(0);

  // Re-render every 10s to refresh the "Saved Xs ago" label
  useEffect(() => {
    if (!lastSavedAt) return undefined;
    const id = setInterval(() => tick((n) => n + 1), 10000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  return (
    <div
      key={`q-${index}`}
      ref={ref}
      tabIndex={-1}
      className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-safe:duration-200 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      aria-labelledby={`question-text-${index}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-2 text-xs font-bold text-white">
            Q{index + 1}
          </span>
          <span className="text-xs font-medium text-slate-500">
            of {totalQuestions}
          </span>
          {flagged && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
              <Flag className="h-3 w-3" />
              Flagged
            </span>
          )}
        </div>
      </div>

      <h2
        id={`question-text-${index}`}
        className="text-lg sm:text-xl font-semibold text-slate-900 leading-snug break-words mb-6"
      >
        {question.questionText}
      </h2>

      <div
        role="radiogroup"
        aria-label={`Options for question ${index + 1}`}
        className="space-y-3"
      >
        {question.options.map((opt, i) => {
          const selected = selectedOption === i;
          const letter = String.fromCharCode(65 + i);
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Option ${letter}: ${opt}`}
              onClick={() => onSelect(i)}
              className={`w-full text-left flex items-start gap-3 p-4 rounded-xl border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                selected
                  ? "bg-indigo-50 border-indigo-500"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                  selected
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "bg-white border-slate-300 text-slate-500"
                }`}
              >
                {selected ? <Check className="h-3.5 w-3.5" /> : letter}
              </span>
              <span
                className={`text-sm sm:text-base break-words ${
                  selected ? "text-indigo-900 font-medium" : "text-slate-700"
                }`}
              >
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {lastSavedAt && (
        <p
          className="mt-4 text-xs text-slate-500 inline-flex items-center gap-1.5"
          aria-live="polite"
        >
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          {formatRelative(lastSavedAt)}
        </p>
      )}
      {saving && !lastSavedAt && (
        <p className="mt-4 text-xs text-slate-500">Saving...</p>
      )}

      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleFlag}
          aria-pressed={flagged}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
            flagged
              ? "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100"
              : "bg-white text-slate-700 ring-slate-300 hover:bg-slate-50"
          }`}
        >
          <Flag className="h-4 w-4" />
          {flagged ? "Unflag" : "Flag"}
        </button>

        <button
          type="button"
          onClick={onClear}
          disabled={selectedOption === null}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <Eraser className="h-4 w-4" />
          Clear
        </button>

        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>

        {isLast ? (
          /* On the last question: show "Save Answer" instead of hiding Save & Next */
          <button
            type="button"
            onClick={onSaveAnswer}
            disabled={selectedOption === null}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Save className="h-4 w-4" />
            Save Answer
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Save className="h-4 w-4" />
            Save &amp; Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <ShortcutHint />
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            <Send className="h-4 w-4" />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
});

export default QuestionCard;
