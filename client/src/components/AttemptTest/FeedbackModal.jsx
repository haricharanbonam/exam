import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { X, CheckCircle2 } from "lucide-react";
import API from "../../utils/axios";

const RATINGS = [
  { value: 1, emoji: "\uD83D\uDE1E", label: "Very dissatisfied" },
  { value: 2, emoji: "\uD83D\uDE15", label: "Dissatisfied" },
  { value: 3, emoji: "\uD83D\uDE10", label: "Neutral" },
  { value: 4, emoji: "\uD83D\uDE42", label: "Satisfied" },
  { value: 5, emoji: "\uD83D\uDE0D", label: "Very satisfied" },
];

const DESCRIPTION_LIMIT = 1000;

function FeedbackModal({ open, attemptId, testTitle, onClose, onSubmitted }) {
  const [rating, setRating] = useState(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const cardRef = useRef(null);
  const submittedTimerRef = useRef(null);

  // Reset state whenever the modal is reopened
  useEffect(() => {
    if (!open) return undefined;
    setRating(null);
    setDescription("");
    setSubmitting(false);
    setSubmitted(false);
    setDuplicate(false);
    return undefined;
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rating, submitted]);

  // Move focus into the card on open for accessibility
  useEffect(() => {
    if (open && cardRef.current) {
      cardRef.current.focus();
    }
  }, [open]);

  // Cleanup pending success timer on unmount
  useEffect(() => {
    return () => {
      if (submittedTimerRef.current) clearTimeout(submittedTimerRef.current);
    };
  }, []);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target !== e.currentTarget) return;
    handleClose();
  };

  const handleClose = () => {
    // After submission we dismiss silently.
    if (submitted) {
      onClose();
      return;
    }
    if (rating !== null) {
      const confirmed = window.confirm(
        "Skip feedback? Your rating won't be saved."
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === null || submitting || duplicate) return;
    setSubmitting(true);
    try {
      await API.post("/test/feedback", {
        attemptId,
        rating,
        description: description.trim(),
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
      submittedTimerRef.current = setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setDuplicate(true);
        toast.error("You've already submitted feedback for this test");
      } else {
        const message =
          err?.response?.data?.message ||
          "Could not submit feedback. Please try again.";
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const trimmedDescription = description.trim();
  const canSubmit =
    rating !== null && !submitting && !submitted && !duplicate;

  return createPortal(
    <div
      role="presentation"
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        tabIndex={-1}
        className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 max-w-md w-full p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-200 outline-none"
      >
        {submitted ? (
          <div className="flex flex-col items-center text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-3" />
            <h2 className="text-lg font-semibold text-slate-900">
              Thanks for your feedback!
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your response helps us improve.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2
                  id="feedback-modal-title"
                  className="text-lg sm:text-xl font-semibold text-slate-900"
                >
                  How was your test?
                </h2>
                {testTitle && (
                  <p className="mt-1 text-sm text-slate-500 truncate">
                    {testTitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close feedback"
                className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div
                role="radiogroup"
                aria-label="Rate your experience"
                className="flex justify-between gap-2"
              >
                {RATINGS.map((r) => {
                  const selected = rating === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-pressed={selected}
                      aria-label={`Rating: ${r.value} out of 5`}
                      title={r.label}
                      onClick={() => setRating(r.value)}
                      className={`flex-1 flex flex-col items-center justify-center rounded-xl py-3 text-2xl sm:text-3xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                        selected
                          ? "bg-indigo-50 ring-2 ring-indigo-500 scale-110"
                          : "bg-slate-50 ring-1 ring-slate-200 hover:bg-slate-100 opacity-40 grayscale hover:opacity-70 hover:grayscale-0"
                      }`}
                    >
                      <span aria-hidden="true">{r.emoji}</span>
                      <span className="mt-1 text-[10px] font-semibold text-slate-500">
                        {r.value}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="feedback-description"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Tell us more (optional)
                </label>
                <textarea
                  id="feedback-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={DESCRIPTION_LIMIT}
                  rows={4}
                  placeholder="What did you like or what could be better?"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                />
                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-slate-400">
                    {trimmedDescription.length}/{DESCRIPTION_LIMIT}
                  </span>
                </div>
              </div>

              {duplicate && (
                <p
                  role="alert"
                  className="text-sm text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded-xl px-3 py-2"
                >
                  You've already submitted feedback for this test.
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  {submitting ? "Submitting..." : "Submit feedback"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default FeedbackModal;
