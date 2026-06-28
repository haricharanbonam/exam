import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Clock,
  ListChecks,
  Award,
  Calendar,
  AlertCircle,
  Play,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import API from "../utils/axios";

function SkeletonBox({ className = "" }) {
  return <div className={`animate-shimmer rounded ${className}`} />;
}

function ExamInterfaceSkeleton() {
  return (
    <div
      className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8"
      role="status"
      aria-live="polite"
      aria-label="Loading exam details"
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <SkeletonBox className="h-7 w-7 rounded-lg" />
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
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBox className="h-5 w-5 rounded" />
                  <SkeletonBox className="h-4 w-2/3" />
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
            <SkeletonBox className="h-12 w-full rounded-xl mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-900 break-words">
          {value || "—"}
        </p>
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

function getCtaState(test) {
  if (test?.end) {
    return { label: "Exam Ended", disabled: true, key: "ended" };
  }
  if (!test?.start) {
    return { label: "Not Started Yet", disabled: true, key: "upcoming" };
  }
  if (test?.submitted) {
    return { label: "Exam Already Submitted", disabled: true, key: "submitted" };
  }
  if (test?.resumeFlag) {
    return {
      label: "Resume Exam",
      disabled: false,
      key: "resume",
      icon: RefreshCw,
    };
  }
  return { label: "Start Exam", disabled: false, key: "start", icon: Play };
}

const ExamInterface = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        setError(
          err?.response?.data?.message ||
            "Failed to load exam details. Please try again."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTestDetails();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <ExamInterfaceSkeleton />;

  if (error || !test) {
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
                {error || "Failed to load exam."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cta = getCtaState(test);
  const CtaIcon = cta.icon;
  const startTime = test.startTime ? new Date(test.startTime) : null;
  const endTime = test.endTime ? new Date(test.endTime) : null;
  const startTimeLabel = startTime && !Number.isNaN(startTime.getTime())
    ? startTime.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;
  const endTimeLabel = endTime && !Number.isNaN(endTime.getTime())
    ? endTime.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Title card */}
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

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Test details */}
          <section
            className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8"
            aria-labelledby="exam-details-heading"
          >
            <h2
              id="exam-details-heading"
              className="text-lg font-semibold text-slate-900 mb-2"
            >
              Test details
            </h2>
            <div className="mt-2">
              <DetailRow
                icon={Calendar}
                label="Start time"
                value={startTimeLabel}
              />
              <DetailRow
                icon={Calendar}
                label="End time"
                value={endTimeLabel}
              />
              <DetailRow
                icon={Clock}
                label="Duration"
                value={`${test.durationMinutes} minutes`}
              />
              <DetailRow
                icon={ListChecks}
                label="Questions"
                value={`${test.numberOfQuestions}`}
              />
              <DetailRow
                icon={Award}
                label="Total marks"
                value={`${test.numberOfQuestions}`}
              />
            </div>
          </section>

          {/* Right: Instructions + CTA */}
          <section
            className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 flex flex-col"
            aria-labelledby="exam-instructions-heading"
          >
            <h2
              id="exam-instructions-heading"
              className="text-lg font-semibold text-slate-900 mb-4"
            >
              Instructions
            </h2>

            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Only the registered person can take the assessment.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                You must submit answers individually for every question.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Your answers and submission times are tracked by the system.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Answers cannot be modified once submitted.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                Unfair practices will lead to disqualification.
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0"
                  aria-hidden="true"
                />
                All decisions are final and at the discretion of the organizers.
              </li>
            </ul>

            {/* Monitoring warning callout */}
            <div
              className="mt-5 flex items-start gap-3 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3.5"
              role="note"
              aria-label="Monitoring rules warning"
            >
              <AlertCircle
                className="h-5 w-5 text-amber-600 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Monitoring in effect</p>
                <p className="mt-0.5 text-amber-800">
                  Your camera will remain on and the exam will run in fullscreen.
                  Switching tabs, exiting fullscreen, or leaving the camera
                  frame may be flagged.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              If the start button is not activated at the start time, please
              refresh the page.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={cta.disabled}
                onClick={() => {
                  if (!cta.disabled) navigate(`/test/${id}/start`);
                }}
                aria-label={cta.label}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  cta.disabled
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500"
                }`}
              >
                {CtaIcon ? (
                  <CtaIcon className="h-4 w-4" aria-hidden="true" />
                ) : null}
                {cta.label}``
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};





export default ExamInterface;
