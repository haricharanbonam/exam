import React from "react";
import { Check, Flag, Circle, Slash } from "lucide-react";

function statusFor(i, currentIndex, responses, flags, visited) {
  if (i === currentIndex) return "current";
  if (flags[i]) return "flagged";
  if (responses[i] !== null && responses[i] !== undefined) return "answered";
  if (visited[i]) return "unanswered";
  return "notVisited";
}

function QuestionPalette({
  total,
  currentIndex,
  responses,
  flags,
  visited,
  onJump,
}) {
  const answered = responses.filter(
    (r) => r !== null && r !== undefined
  ).length;
  const flaggedCount = flags.filter(Boolean).length;
  const unanswered = responses.filter(
    (r, i) =>
      (r === null || r === undefined) && !flags[i] && (visited[i] || i === 0)
  ).length;
  const notVisited = total - visited.filter(Boolean).length;

  const baseBtn =
    "relative h-10 w-10 rounded-lg text-sm font-semibold flex items-center justify-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

  const variants = {
    current: "bg-indigo-600 text-white ring-2 ring-indigo-300 shadow-sm",
    answered: "bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200",
    flagged: "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200",
    unanswered: "bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200",
    notVisited: "bg-slate-100 text-slate-400 hover:bg-slate-200",
  };

  return (
    <aside
      className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 sm:p-6"
      aria-label="Question palette"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Question Palette</h3>
        <span className="text-xs font-medium text-slate-500">
          {currentIndex + 1} / {total}
        </span>
      </div>

      <div
        role="list"
        className="grid grid-cols-5 gap-2"
        aria-label="Jump to question"
      >
        {Array.from({ length: total }).map((_, i) => {
          const status = statusFor(i, currentIndex, responses, flags, visited);
          const ariaStatus =
            status === "current"
              ? "current question"
              : status === "answered"
                ? "answered"
                : status === "flagged"
                  ? "flagged"
                  : status === "unanswered"
                    ? "visited but unanswered"
                    : "not visited";
          return (
            <button
              key={i}
              type="button"
              role="listitem"
              aria-label={`Question ${i + 1}, ${ariaStatus}`}
              aria-current={status === "current" ? "true" : undefined}
              onClick={() => onJump(i)}
              className={`${baseBtn} ${variants[status]}`}
            >
              {i + 1}
              {flags[i] && status !== "current" && (
                <Flag
                  className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-600 bg-white rounded-full p-0.5"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Legend
        </h4>
        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-600 text-white">
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
            Current
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-700 border border-emerald-300">
              <Check className="h-3 w-3" aria-hidden="true" />
            </span>
            Answered
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-amber-800 border border-amber-300">
              <Flag className="h-3 w-3" aria-hidden="true" />
            </span>
            Flagged
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-rose-100 text-rose-700 border border-rose-300">
              <Slash className="h-3 w-3" aria-hidden="true" />
            </span>
            Visited, unanswered
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-100 text-slate-400">
              <Circle className="h-3 w-3" aria-hidden="true" />
            </span>
            Not visited
          </li>
        </ul>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5 text-xs text-slate-700">
        <p>
          <span className="font-semibold text-emerald-700">{answered}</span>{" "}
          answered
          <span className="mx-2 text-slate-300">·</span>
          <span className="font-semibold text-amber-700">{flaggedCount}</span>{" "}
          flagged
          <span className="mx-2 text-slate-300">·</span>
          <span className="font-semibold text-rose-700">{unanswered}</span>{" "}
          unanswered
          <span className="mx-2 text-slate-300">·</span>
          <span className="font-semibold text-slate-500">{notVisited}</span>{" "}
          not visited
        </p>
      </div>
    </aside>
  );
}

export default QuestionPalette;
