import React, { useEffect, useRef } from "react";
import { Clock, AlertTriangle } from "lucide-react";

function formatTime(seconds) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const mins = String(Math.floor(safe / 60)).padStart(2, "0");
  const secs = String(safe % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function TimerDisplay({ remainingSeconds }) {
  const audioCtxRef = useRef(null);
  const beepedAtOneMinRef = useRef(false);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // no-op
        }
        audioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const shouldBeep =
      remainingSeconds !== null &&
      remainingSeconds !== undefined &&
      remainingSeconds <= 60 &&
      remainingSeconds > 0 &&
      !beepedAtOneMinRef.current;
    if (!shouldBeep) return undefined;

    beepedAtOneMinRef.current = true;

    try {
      const Ctx =
        window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return undefined;
      const ctx = new Ctx();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (err) {
      console.warn("Audio beep failed:", err);
    }
    return undefined;
  }, [remainingSeconds]);

  if (remainingSeconds === null || remainingSeconds === undefined) {
    return (
      <div className="inline-flex items-center gap-2 text-slate-500">
        <Clock className="h-4 w-4" aria-hidden="true" />
        <span className="font-mono text-sm">--:--</span>
      </div>
    );
  }

  let colorClass = "text-slate-700";
  let pulseClass = "";
  let icon = <Clock className="h-4 w-4" aria-hidden="true" />;
  if (remainingSeconds <= 60) {
    colorClass = "text-rose-600";
    pulseClass = "animate-pulse-soft";
    icon = <AlertTriangle className="h-4 w-4" aria-hidden="true" />;
  } else if (remainingSeconds <= 300) {
    colorClass = "text-amber-600";
    pulseClass = "animate-pulse-soft";
    icon = <AlertTriangle className="h-4 w-4" aria-hidden="true" />;
  }

  const timerLabel =
    remainingSeconds <= 60
      ? "Less than 1 minute remaining"
      : remainingSeconds <= 300
        ? "Less than 5 minutes remaining"
        : "Time remaining";

  return (
    <div
      className={`inline-flex items-center gap-2 ${colorClass} ${pulseClass}`}
      role="timer"
      aria-live={remainingSeconds <= 60 ? "assertive" : "polite"}
      aria-atomic="true"
      aria-label={timerLabel}
    >
      {icon}
      <span className="font-mono text-sm font-semibold tabular-nums">
        {formatTime(remainingSeconds)}
      </span>
    </div>
  );
}

export default TimerDisplay;
