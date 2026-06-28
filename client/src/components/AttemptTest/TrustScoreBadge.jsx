import React, { useEffect, useRef, useState } from "react";
import { Shield } from "lucide-react";

function colorClasses(score) {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (score >= 70) return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-rose-50 text-rose-700 ring-rose-200";
}

function formatRelative(date) {
  if (!date) return "";
  const ts = date instanceof Date ? date.getTime() : new Date(date).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function TrustScoreBadge({ score, cheatCount, maxCheats, violations = [] }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filled = score < 70;

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Trust score ${score} out of 100, ${cheatCount} of ${maxCheats} violations`}
        title={`Trust score: ${score}`}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ring-1 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${colorClasses(
          score
        )}`}
      >
        <Shield
          className="h-3.5 w-3.5"
          aria-hidden="true"
          fill={filled ? "currentColor" : "none"}
        />
        Trust {score}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Trust score violations"
          className="absolute top-full mt-2 right-0 z-40 w-72 max-w-[80vw] rounded-xl bg-white shadow-lg ring-1 ring-slate-200 p-3 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Violations
            </p>
            <span className="text-[11px] text-slate-400">
              {violations.length} logged
            </span>
          </div>

          {violations.length === 0 ? (
            <p className="text-sm text-slate-500 py-3 text-center">
              No violations yet
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto space-y-1.5">
              {violations.map((v, i) => {
                const severity = v?.severity || "violation";
                const dotColor =
                  severity === "warning"
                    ? "bg-amber-500"
                    : "bg-rose-500";
                return (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800 break-words">
                        {v?.type || "Suspicious activity"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {severity === "warning" ? "Warning" : "Violation"} ·{" "}
                        {formatRelative(v?.timestamp)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default TrustScoreBadge;
