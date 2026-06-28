import React, { useCallback, useEffect, useState } from "react";
import { Maximize2, ShieldAlert } from "lucide-react";

function isFullscreen() {
  return Boolean(document.fullscreenElement);
}

function FullscreenGuard({ active, onExit }) {
  const [inFullscreen, setInFullscreen] = useState(isFullscreen);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!el || typeof el.requestFullscreen !== "function") return;
    el.requestFullscreen().catch(() => {
      // Permission denied or unsupported — silently ignore.
    });
  }, []);

  useEffect(() => {
    if (active) {
      requestFullscreen();
    }
  }, [active, requestFullscreen]);

  useEffect(() => {
    const handler = () => {
      const nowFs = isFullscreen();
      setInFullscreen(nowFs);
      if (active && !nowFs) {
        if (typeof onExit === "function") onExit();
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [active, onExit]);

  if (!active || inFullscreen) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Fullscreen mode required"
      className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-1 ring-rose-200">
          <ShieldAlert className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-slate-900">
          Fullscreen mode exited
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          This test must remain in fullscreen. Click below to resume.
        </p>
        <button
          type="button"
          onClick={requestFullscreen}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
          Resume fullscreen mode
        </button>
      </div>
    </div>
  );
}

export default FullscreenGuard;
