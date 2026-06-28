import React from "react";
import { X, Calendar, Clock, ListChecks } from "lucide-react";
import Modal from "../Modal";

const TYPE_LABEL = {
  mcq: "MCQ",
  truefalse: "T/F",
};

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString();
  }
  // Fall back to the raw string when it isn't a parseable date
  return String(value);
}

function PreviewModal({ open, onClose, test }) {
  if (!open) return null;

  const {
    title = "",
    description = "",
    startTime,
    endTime,
    durationMinutes,
    questions = [],
  } = test || {};

  const hasDuration =
    durationMinutes !== undefined &&
    durationMinutes !== null &&
    durationMinutes !== "" &&
    !Number.isNaN(Number(durationMinutes));
  const hasMeta = Boolean(startTime || endTime || hasDuration);

  return (
    <Modal
      onClose={onClose}
      className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4 z-10">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 break-words">
            {title || "(untitled test)"}
          </h2>
          {description && description.trim().length > 0 && (
            <p className="mt-1 text-sm text-slate-500 break-words">
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          title="Close preview"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Meta row */}
      {hasMeta && (
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200">
          {startTime && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5" />
                Start time
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {formatDateTime(startTime)}
              </div>
            </div>
          )}
          {endTime && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5" />
                End time
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {formatDateTime(endTime)}
              </div>
            </div>
          )}
          {hasDuration && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <Clock className="h-3.5 w-3.5" />
                Duration
              </div>
              <div className="mt-1 text-sm font-medium text-slate-900">
                {Number(durationMinutes)} minutes
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions list */}
      <div className="px-6 py-6">
        {!Array.isArray(questions) || questions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <p className="text-sm font-medium text-slate-700">
              No questions added yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add questions from the editor to see them here.
            </p>
          </div>
        ) : (
          <ol className="space-y-6">
            {questions.map((q, i) => {
              const qType = q.type === "truefalse" ? "truefalse" : "mcq";
              const isTF = qType === "truefalse";
              const opts = Array.isArray(q.options) ? q.options : [];
              return (
                <li
                  key={i}
                  className="rounded-xl ring-1 ring-slate-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white">
                      Q{i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            isTF
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-indigo-50 text-indigo-700"
                          }`}
                        >
                          <ListChecks className="h-3 w-3" />
                          {TYPE_LABEL[qType] || "MCQ"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-900 break-words">
                        {q.questionText}
                      </p>
                      <ul className="mt-3 space-y-1.5">
                        {opts.map((opt, j) => {
                          const isCorrect = j === q.correctAnswerIndex;
                          return (
                            <li
                              key={j}
                              className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ring-1 ${
                                isCorrect
                                  ? "bg-emerald-50 text-emerald-900 ring-emerald-200 font-medium"
                                  : "bg-white text-slate-700 ring-slate-200"
                              }`}
                            >
                              <span className="shrink-0 font-semibold text-xs uppercase tracking-wide text-slate-500 min-w-[1.25rem]">
                                {LETTERS[j] || `${j + 1}`}.
                              </span>
                              <span className="flex-1 break-words">
                                {opt}
                              </span>
                              {isCorrect && (
                                <span className="shrink-0 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  Correct
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

export default PreviewModal;
