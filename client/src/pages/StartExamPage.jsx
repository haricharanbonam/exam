import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Camera,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  FileText,
  Clock,
  ListChecks,
  Award,
} from "lucide-react";
import { useCamera } from "../context/CameraContext";
import API from "../utils/axios";

function SkeletonBox({ className = "" }) {
  return <div className={`animate-shimmer rounded ${className}`} />;
}

function StartExamPageSkeleton() {
  return (
    <div
      className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8"
      role="status"
      aria-live="polite"
      aria-label="Loading exam permissions"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <SkeletonBox className="h-10 w-10 rounded-xl" />
            <SkeletonBox className="h-8 w-1/2" />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <SkeletonBox className="h-7 w-24 rounded-full" />
            <SkeletonBox className="h-7 w-28 rounded-full" />
            <SkeletonBox className="h-7 w-20 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
            <SkeletonBox className="h-6 w-1/3 mb-5" />
            <div className="space-y-4">
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBox className="h-10 w-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-1/2" />
                    <SkeletonBox className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
            <SkeletonBox className="h-6 w-1/3 mb-5" />
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonBox key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 sm:p-6 mt-6">
          <div className="flex items-center justify-between gap-3">
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonBox className="h-10 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ test }) {
  if (test?.end) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
        aria-label="Exam status: ended"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" aria-hidden="true" />
        Ended
      </span>
    );
  }
  if (test?.submitted) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
        aria-label="Exam status: submitted"
      >
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Submitted
      </span>
    );
  }
  if (test?.start) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
        aria-label="Exam status: active"
      >
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Active
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
      aria-label="Exam status: not started"
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      Upcoming
    </span>
  );
}

function StartExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stream, setStream, videoRef } = useCamera();

  const [test, setTest] = useState(null);
  const [testLoading, setTestLoading] = useState(true);
  const [testError, setTestError] = useState(null);

  const [cameraGranted, setCameraGranted] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(null);

  // Fetch test details
  useEffect(() => {
    let cancelled = false;
    const fetchTestDetails = async () => {
      try {
        const { data } = await API.get(`/test/interface/${id}`);
        if (cancelled) return;
        setTest(data.data);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch test details:", err);
        setTestError(
          err?.response?.data?.message ||
            "Failed to load exam details. Please try again."
        );
      } finally {
        if (!cancelled) setTestLoading(false);
      }
    };
    fetchTestDetails();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // If a stream already exists in context (e.g. user navigated back from exam), treat camera as granted.
  useEffect(() => {
    if (stream) setCameraGranted(true);
  }, [stream]);

  // Track fullscreen state via the fullscreenchange event.
  useEffect(() => {
    const onFsChange = () => setFullscreenGranted(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    onFsChange();
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Attach the live stream to the preview video element.
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  const requestCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Hand the live stream to CameraContext so the exam page can use it.
      // Do NOT stop the tracks here — they must stay alive for proctoring.
      setStream(mediaStream);
      setCameraGranted(true);
    } catch (err) {
      setCameraError(err);
    }
  };

  const requestFullscreen = async () => {
    setFullscreenError(null);
    const el = document.documentElement;
    if (!el.requestFullscreen) {
      setFullscreenError(new Error("Fullscreen API not supported by this browser."));
      return;
    }
    try {
      await el.requestFullscreen();
      // fullscreenGranted flips via the fullscreenchange listener
    } catch (err) {
      setFullscreenError(err);
    }
  };

  const canStart =
    cameraGranted &&
    fullscreenGranted &&
    test &&
    !test.end &&
    !test.submitted &&
    (test.start || test.resumeFlag);

  const permissionsGrantedCount =
    (cameraGranted ? 1 : 0) + (fullscreenGranted ? 1 : 0);
  const permissionsTotal = 2;
  const permissionsMissing = permissionsTotal - permissionsGrantedCount;

  let ctaLabel;
  if (test?.resumeFlag) ctaLabel = "Resume Test";
  else if (canStart) ctaLabel = "Start Test";
  else ctaLabel = "Complete Permissions";

  let CtaIcon = null;
  if (test?.resumeFlag) CtaIcon = RefreshCw;
  else if (canStart) CtaIcon = Play;

  if (testLoading) return <StartExamPageSkeleton />;

  if (testError || !test) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div
          role="alert"
          className="bg-white rounded-2xl shadow-sm ring-1 ring-rose-200 p-6 sm:p-8 max-w-md w-full"
        >
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-200">
              <AlertCircle className="h-5 w-5 text-rose-600" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">
                Unable to load exam
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {testError || "Failed to load exam."}
              </p>
              <button
                type="button"
                onClick={() => navigate(`/test/${id}`)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Back to exam details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <Link
          to={`/test/${id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 mb-4 transition"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to exam details
        </Link>

        {/* Test info card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <span
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100"
              aria-hidden="true"
            >
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {test.title || "Untitled exam"}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
              aria-label={`Duration: ${test.durationMinutes} minutes`}
            >
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {test.durationMinutes} min
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
              aria-label={`${test.numberOfQuestions} questions`}
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              {test.numberOfQuestions} questions
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
              aria-label={`Total marks: ${test.numberOfQuestions}`}
            >
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              {test.numberOfQuestions} marks
            </span>
            <StatusBadge test={test} />
          </div>

          {test.description && (
            <div className="mt-5 text-slate-600 leading-relaxed text-sm sm:text-base">
              <p className="whitespace-pre-line">{test.description}</p>
            </div>
          )}
        </div>

        {/* Privacy callout */}
        <div
          className="bg-sky-50 ring-1 ring-sky-200 rounded-xl p-4 flex items-start gap-3 mb-6"
          role="note"
          aria-label="Privacy disclosure"
        >
          <ShieldCheck
            className="h-5 w-5 text-sky-600 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="text-sm">
            <p className="font-semibold text-sky-900">Your privacy</p>
            <p className="mt-1 text-sky-800 leading-relaxed">
              Camera access is used only for proctoring during this exam. The
              stream is sent to our automated proctoring system while the exam
              is active and stops when you submit or close the exam. Recordings
              are not retained.
            </p>
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Permissions checklist */}
          <section
            className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8"
            aria-labelledby="permissions-heading"
          >
            <h2
              id="permissions-heading"
              className="text-lg font-semibold text-slate-900"
            >
              Required permissions
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Grant these before starting the test.
            </p>

            {/* Camera row */}
            <div className="mt-6 flex items-start gap-3 pb-5 border-b border-slate-100">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100"
                aria-hidden="true"
              >
                <Camera className="h-5 w-5 text-indigo-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Camera access
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  We need camera access for proctoring during this exam. Click
                  below to enable.
                </p>
                <div className="mt-3">
                  {cameraError ? (
                    <span
                      role="alert"
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200"
                    >
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {cameraError.message || "Camera access failed"}
                    </span>
                  ) : cameraGranted ? (
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        <CheckCircle2
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Camera ready
                      </span>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        aria-label="Live camera preview"
                        className="w-[120px] h-[90px] rounded-lg object-cover ring-1 ring-slate-200 bg-slate-100"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={requestCamera}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      Enable camera
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Fullscreen row */}
            <div className="mt-5 flex items-start gap-3">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100"
                aria-hidden="true"
              >
                <Maximize2 className="h-5 w-5 text-indigo-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Fullscreen mode
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  The exam must run in fullscreen. Switching tabs or exiting
                  fullscreen will be flagged.
                </p>
                <div className="mt-3">
                  {fullscreenError ? (
                    <span
                      role="alert"
                      className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200"
                    >
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      {fullscreenError.message || "Fullscreen request failed"}
                    </span>
                  ) : fullscreenGranted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Fullscreen active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestFullscreen}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      <Maximize2 className="h-4 w-4" aria-hidden="true" />
                      Enter fullscreen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Right: Before you start */}
          <section
            className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8"
            aria-labelledby="before-you-start-heading"
          >
            <h2
              id="before-you-start-heading"
              className="text-lg font-semibold text-slate-900 mb-4"
            >
              Before you start
            </h2>

            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Find a quiet, well-lit space.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Close other apps and browser tabs.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Make sure your face is clearly visible.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                You won't be able to pause the timer once it begins.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Auto-submit when time runs out.
              </li>
            </ul>
          </section>
        </div>

        {/* Bottom CTA bar */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5 sm:p-6 mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-4">
          <p
            className={`text-sm ${
              canStart ? "text-emerald-700" : "text-slate-600"
            } inline-flex items-center gap-1.5`}
          >
            {canStart ? (
              <CheckCircle2
                className="h-4 w-4 text-emerald-500"
                aria-hidden="true"
              />
            ) : null}
            {canStart
              ? "All set. Click start when you're ready."
              : permissionsMissing === 2
              ? "Grant both permissions to continue."
              : `Grant ${permissionsMissing} more permission to continue.`}
          </p>
          <button
            type="button"
            disabled={!canStart}
            onClick={() => {
              if (canStart) navigate(`/exam/${id}`);
            }}
            aria-label={ctaLabel}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
              canStart
                ? "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            {CtaIcon ? (
              <CtaIcon className="h-4 w-4" aria-hidden="true" />
            ) : null}
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartExamPage;
