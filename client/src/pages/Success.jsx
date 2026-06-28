import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Clock,
  ListChecks,
  BookOpen,
  User,
  Home,
  ArrowRight,
  Trophy,
} from "lucide-react";
import FeedbackModal from "../components/AttemptTest/FeedbackModal";

function ScoreRing({ score, totalQuestions }) {
  const hasTotal =
    typeof totalQuestions === "number" &&
    Number.isInteger(totalQuestions) &&
    totalQuestions > 0;
  const percent = hasTotal
    ? Math.max(0, Math.min(100, Math.round((score / totalQuestions) * 100)))
    : null;

  const size = 128;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset =
    percent === null ? 0 : circumference * (1 - percent / 100);

  return (
    <div className="relative h-32 w-32 mx-auto mb-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        {percent !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 600ms ease-out" }}
          />
        )}
        <defs>
          <linearGradient
            id="scoreGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {percent !== null ? (
          <span className="text-3xl font-extrabold text-slate-900 leading-none">
            {percent}
            <span className="text-2xl">%</span>
          </span>
        ) : (
          <>
            <span className="text-3xl font-extrabold text-slate-900 leading-none">
              {score ?? "—"}
            </span>
            {hasTotal && (
              <span className="mt-1 text-xs font-semibold text-slate-500">
                of {totalQuestions}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatDuration(seconds) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) {
    return null;
  }
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    score,
    attemptId,
    testTitle,
    timeTaken,
    totalQuestions,
    questionsAnswered,
  } = location.state || {};

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [modalOpen, setModalOpen] = useState(false);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);

  useEffect(() => {
    if (feedbackDismissed) return undefined;
    if (!attemptId) return undefined;
    const timer = setTimeout(() => setModalOpen(true), 2000);
    return () => clearTimeout(timer);
  }, [attemptId, feedbackDismissed]);

  const handleModalClose = () => {
    setModalOpen(false);
    setFeedbackDismissed(true);
  };

  const handleFeedbackSubmitted = () => {
    toast.success("Thanks for your feedback!");
  };

  const showScore = score !== undefined && score !== null;
  const safeTestTitle = testTitle || null;
  const safeTimeLabel = formatDuration(timeTaken);
  const showTotalQuestions =
    typeof totalQuestions === "number" &&
    Number.isInteger(totalQuestions) &&
    totalQuestions > 0;
  const showQuestionsAnswered =
    typeof questionsAnswered === "number" &&
    Number.isInteger(questionsAnswered) &&
    questionsAnswered >= 0;

  const profilePath = user?.username ? `/profile/${user.username}` : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div
          className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-10 text-center"
          role="region"
          aria-labelledby="success-heading"
        >
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
            <CheckCircle2
              className="h-8 w-8 text-emerald-600"
              role="img"
              aria-label="Success"
            />
          </div>

          <h1
            id="success-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1"
          >
            Test submitted!
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Your responses have been recorded.
          </p>

          {showScore ? (
            <div aria-live="polite">
              <ScoreRing score={score} totalQuestions={totalQuestions} />
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-sm text-slate-500">Score unavailable</p>
            </div>
          )}

          {(safeTestTitle || safeTimeLabel || showTotalQuestions || showQuestionsAnswered) && (
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {safeTestTitle && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate max-w-[200px]" title={safeTestTitle}>
                    {safeTestTitle}
                  </span>
                </span>
              )}
              {safeTimeLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {safeTimeLabel}
                </span>
              )}
              {showQuestionsAnswered && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium">
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  {questionsAnswered} answered
                </span>
              )}
              {showTotalQuestions && !showQuestionsAnswered && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium">
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  {totalQuestions} questions
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:gap-3 mt-2">
            <button
              onClick={() => navigate(profilePath)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            >
              View Profile
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-white text-slate-700 font-semibold rounded-xl ring-1 ring-slate-300 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* What's next */}
        <section
          className="mt-6"
          aria-labelledby="whats-next-heading"
        >
          <h2
            id="whats-next-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-1"
          >
            What&apos;s next
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate(profilePath)}
              className="group text-left bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 hover:ring-indigo-300 hover:shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              aria-label="View your profile"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <User className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                View profile
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                See your full attempt history and performance.
              </p>
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group text-left bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 hover:ring-indigo-300 hover:shadow transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              aria-label="Take another test"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">
                Take another test
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Browse available tests and keep practicing.
              </p>
            </button>
          </div>
        </section>
      </div>

      <FeedbackModal
        open={modalOpen}
        attemptId={attemptId}
        testTitle={safeTestTitle}
        onClose={handleModalClose}
        onSubmitted={handleFeedbackSubmitted}
      />
    </div>
  );
};

export default Success;
