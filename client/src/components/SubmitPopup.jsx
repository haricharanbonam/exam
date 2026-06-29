import React, { useEffect, useRef } from "react";
import Modal from "./Modal";
import {
  Send,
  CheckCircle2,
  HelpCircle,
  Flag,
  Circle,
  AlertTriangle,
} from "lucide-react";

const SubmitPopup = ({
  onConfirm,
  onCancel,
  answeredCount = 0,
  totalCount = 0,
  flaggedCount = 0,
  notVisitedCount = 0,
  timeRemainingLabel = null,
}) => {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  const unansweredCount = Math.max(0, totalCount - answeredCount);
  const hasWarnings = unansweredCount > 0 || flaggedCount > 0;
  const confirmLabel = hasWarnings ? "Submit anyway" : "Submit test";
  const description =
    answeredCount === totalCount
      ? `You've answered all ${totalCount} questions. Once submitted, you can't change your answers.`
      : `You've answered ${answeredCount} of ${totalCount} questions. Once submitted, you can't change your answers.`;

  return (
    <Modal onClose={onCancel}>
      <div
        role="alertdialog"
        aria-labelledby="submit-popup-title"
        aria-describedby="submit-popup-desc"
        className="bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 max-w-md w-full p-6 sm:p-7"
      >
        <div className="flex flex-col items-center text-center">
          <span
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100"
            aria-hidden="true"
          >
            <Send className="h-6 w-6 text-indigo-600" />
          </span>
          <h2
            id="submit-popup-title"
            className="text-lg font-semibold text-slate-900 mt-4"
          >
            Ready to submit your test?
          </h2>
        </div>

        <p
          id="submit-popup-desc"
          className="text-sm text-slate-600 mt-3 text-center leading-relaxed"
        >
          {description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-200"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 leading-none">
                {answeredCount}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mt-1">
                Answered
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 ring-1 ring-amber-200"
              aria-hidden="true"
            >
              <HelpCircle className="h-5 w-5 text-amber-600" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 leading-none">
                {unansweredCount}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mt-1">
                Unanswered
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100"
              aria-hidden="true"
            >
              <Flag className="h-5 w-5 text-indigo-600" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 leading-none">
                {flaggedCount}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mt-1">
                Flagged
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 flex items-center gap-3">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200"
              aria-hidden="true"
            >
              <Circle className="h-5 w-5 text-slate-600" />
            </span>
            <div className="min-w-0">
              <p className="text-xl font-bold text-slate-900 leading-none">
                {notVisitedCount}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mt-1">
                Not visited
              </p>
            </div>
          </div>
        </div>

        {hasWarnings && (
          <div
            className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3.5"
            role="note"
            aria-label="Unanswered or flagged questions warning"
          >
            <AlertTriangle
              className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="text-sm text-amber-900 leading-relaxed">
              You still have {unansweredCount} unanswered and {flaggedCount}{" "}
              flagged question(s). You can still submit — unanswered questions
              will be scored as incorrect.
            </p>
          </div>
        )}

        {timeRemainingLabel && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Time remaining: {timeRemainingLabel}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400 w-full sm:w-auto sm:flex-1"
          >
            Review answers
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            data-autofocus
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500 w-full sm:w-auto sm:flex-1"
          >
            {confirmLabel}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Press{" "}
          <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">
            Enter
          </kbd>{" "}
          to confirm,{" "}
          <kbd className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px]">
            Esc
          </kbd>{" "}
          to cancel.
        </p>
      </div>
    </Modal>
  );
};

export default SubmitPopup;
