import React from "react";
import { Flag } from "lucide-react";
import TimerDisplay from "./TimerDisplay";

function AttemptHeader({
  testTitle,
  testDescription,
  currentIndex,
  totalQuestions,
  remainingSeconds,
  cheatCount,
  maxCheats,
  children,
}) {
  const safeTitle = testTitle || "Untitled test";
  const safeDescription = testDescription || "";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 truncate">
              {safeTitle}
            </h1>
            {safeDescription && (
              <p
                className="hidden sm:block text-xs text-slate-500 truncate"
                title={safeDescription}
              >
                {safeDescription}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-indigo-700 ring-1 ring-indigo-200 font-semibold">
            Q{currentIndex + 1}
            <span className="hidden sm:inline"> of {totalQuestions}</span>
          </span>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 ring-1 ring-slate-200">
            <TimerDisplay remainingSeconds={remainingSeconds} />
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 font-semibold ${
              cheatCount >= 3
                ? "bg-rose-50 text-rose-700 ring-rose-200"
                : "bg-amber-50 text-amber-700 ring-amber-200"
            }`}
            aria-label={`${cheatCount} of ${maxCheats} violations`}
          >
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {cheatCount} / {maxCheats}
            </span>
            <span className="sr-only">
              {cheatCount} of {maxCheats} violations
            </span>
          </span>

          {children && (
            <div className="basis-full sm:basis-auto sm:ml-auto">{children}</div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AttemptHeader;
