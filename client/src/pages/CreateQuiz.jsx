import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  FileText,
  Clock,
  ListChecks,
  AlertCircle,
  CheckCircle2,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import API from "../utils/axios";
import TextShareModal from "../components/CopyCode";
import AIPanel from "../components/CreateQuiz/AIPanel";
import QuestionEditor from "../components/CreateQuiz/QuestionEditor";
import QuestionCard from "../components/CreateQuiz/QuestionCard";
import PreviewModal from "../components/CreateQuiz/PreviewModal";

const TITLE_MAX = 100;
const DRAFT_STORAGE_KEY = "exam.draft.createQuiz";
const AUTOSAVE_DEBOUNCE_MS = 800;

function generateExamCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function CreateQuiz() {
  const navigate = useNavigate();

  // Test metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Submit / modal state
  const [submitting, setSubmitting] = useState(false);
  const [examCode, setExamCode] = useState(null);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  // Autosave state
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const mountedRef = useRef(false);
  const autosaveTimeoutRef = useRef(null);

  // ---- Validation -----------------------------------------------------
  const trimmedTitle = title.trim();
  const titleValid = trimmedTitle.length > 0;
  const everyQuestionValid =
    questions.length > 0 &&
    questions.every(
      (q) =>
        q.questionText.trim().length > 0 &&
        q.options.every((o) => o.trim().length > 0) &&
        typeof q.correctAnswerIndex === "number" &&
        q.correctAnswerIndex >= 0 &&
        q.correctAnswerIndex < q.options.length
    );
  const canSubmit = titleValid && everyQuestionValid && !submitting;

  // ---- Question mutations ---------------------------------------------
  const handleAddQuestion = (q) => {
    setQuestions((prev) => [...prev, q]);
    setShowAddForm(false);
    toast.success("Question added");
  };

  const handleEditQuestion = (q) => {
    setQuestions((prev) => prev.map((existing, i) => (i === editingIndex ? q : existing)));
    setEditingIndex(null);
    toast.success("Question updated");
  };

  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
    toast.success("Question deleted");
  };

  const handleDuplicateQuestion = (index) => {
    setQuestions((prev) => {
      const copy = { ...prev[index] };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    toast.success("Question duplicated");
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setQuestions((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const handleMoveDown = (index) => {
    setQuestions((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleAddGenerated = (generatedQuestions) => {
    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      return;
    }
    setQuestions((prev) => [
      ...prev,
      ...generatedQuestions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        type: q.type,
      })),
    ]);
    setShowAddForm(false);
    setEditingIndex(null);
    toast.success(`Added ${generatedQuestions.length} questions`);
  };

  // ---- Submit ---------------------------------------------------------
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setDurationMinutes(30);
    setQuestions([]);
    setEditingIndex(null);
    setShowAddForm(false);
  };

  const clearSavedDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // localStorage may be unavailable (private mode, etc.) — ignore.
    }
    setLastSavedAt(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);

    const tryCreate = async (attempt) => {
      const newCode = generateExamCode();
      // Controller expects 1-based `answer` per legacy contract; convert
      // our 0-based `correctAnswerIndex` back to 1-based for the POST.
      const payloadQuestions = questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        answer: q.correctAnswerIndex + 1,
      }));
      const payload = {
        title: trimmedTitle,
        description,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        questions: payloadQuestions,
        examCode: newCode,
      };

      try {
        await API.post("/test/create", payload);
        setExamCode(newCode);
        toast.success("Test created successfully!");
        clearSavedDraft();
        resetForm();
        return true;
      } catch (err) {
        const status = err.response?.status;
        if (status === 409 && attempt < 3) {
          return tryCreate(attempt + 1);
        }
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to create test. Please try again.";
        toast.error(msg);
        return false;
      }
    };

    await tryCreate(1);
    setSubmitting(false);
  };

  // ---- Draft helpers --------------------------------------------------
  const parseDraft = (raw) => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (typeof parsed.title !== "string") return null;
      if (!Array.isArray(parsed.questions)) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const applyDraft = (d) => {
    setTitle(d.title);
    setDescription(typeof d.description === "string" ? d.description : "");
    setStartTime(typeof d.startTime === "string" ? d.startTime : "");
    setEndTime(typeof d.endTime === "string" ? d.endTime : "");
    const dur = Number(d.durationMinutes);
    setDurationMinutes(Number.isFinite(dur) && dur >= 0 ? dur : 30);
    setQuestions(d.questions);
    setEditingIndex(null);
    setShowAddForm(false);
  };

  const handleSaveDraft = () => {
    if (submitting) return;
    try {
      const payload = {
        title,
        description,
        startTime,
        endTime,
        durationMinutes: durationMinutes === "" ? "" : Number(durationMinutes),
        questions,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setLastSavedAt(payload.savedAt);
      toast.success("Draft saved");
    } catch {
      toast.error("Could not save draft. Storage may be full or unavailable.");
    }
  };

  // ---- Effects --------------------------------------------------------
  // Restore-on-mount: if a valid draft exists, show a non-blocking toast
  // offering [Restore] / [Start fresh].
  useEffect(() => {
    let stored;
    try {
      stored = localStorage.getItem(DRAFT_STORAGE_KEY);
    } catch {
      return;
    }
    const parsed = parseDraft(stored);
    if (!parsed) {
      // Malformed / invalid — silently discard.
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // ignore
      }
      return;
    }
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Draft found from your last visit.</span>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
            onClick={() => {
              applyDraft(parsed);
              toast.dismiss(t.id);
            }}
          >
            Restore
          </button>
          <button
            type="button"
            className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
            onClick={() => {
              clearSavedDraft();
              toast.dismiss(t.id);
            }}
          >
            Start fresh
          </button>
        </div>
      ),
      { duration: Infinity, position: "top-right" }
    );
  }, []);

  // Tick `now` every second so the relative-time indicator stays fresh.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Debounced autosave: write to localStorage 800ms after the last change.
  // Skips the first render via mountedRef so an empty form isn't persisted.
  useEffect(() => {
    if (submitting) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(() => {
      try {
        const payload = {
          title,
          description,
          startTime,
          endTime,
          durationMinutes:
            durationMinutes === "" ? "" : Number(durationMinutes),
          questions,
          savedAt: Date.now(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
        setLastSavedAt(payload.savedAt);
      } catch {
        // localStorage may be unavailable — skip silently.
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [
    title,
    description,
    startTime,
    endTime,
    durationMinutes,
    questions,
    submitting,
  ]);

  // ---- Render ---------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              title="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
              Create New Test
            </h1>
          </div>
          {/* Autosave indicator */}
          {lastSavedAt ? (() => {
            const elapsedSec = Math.floor((now - lastSavedAt) / 1000);
            const label =
              elapsedSec < 5
                ? "just now"
                : elapsedSec < 60
                ? `${elapsedSec}s ago`
                : new Date(lastSavedAt).toLocaleTimeString();
            return (
              <span className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Draft saved {label}
              </span>
            );
          })() : (
            <span className="text-xs text-slate-400" />
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 space-y-6">
        <p className="text-sm text-slate-500">
          Build an exam in minutes. Add questions manually, or use AI to
          generate them from any concept.
        </p>

        {/* Section 1 — Test Details */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Test Details
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Title <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-xs ${
                    title.length > TITLE_MAX
                      ? "text-rose-600 font-medium"
                      : "text-slate-400"
                  }`}
                >
                  {title.length}/{TITLE_MAX}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, TITLE_MAX))}
                placeholder="e.g. Mid-term Biology Exam"
                className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this test covers..."
                className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                  Start time
                </label>
                <DatePicker
                  showTime={{ minuteStep: 15, format: "HH:mm", defaultValue: dayjs().startOf("hour") }}
                  format="YYYY-MM-DD HH:mm"
                  value={startTime ? dayjs(startTime) : null}
                  onChange={(v) => setStartTime(v ? v.format("YYYY-MM-DDTHH:mm") : "")}
                  placeholder="Select start date & time"
                  className="w-full"
                  allowClear
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                  End time
                </label>
                <DatePicker
                  showTime={{ minuteStep: 15, format: "HH:mm", defaultValue: dayjs().startOf("hour") }}
                  format="YYYY-MM-DD HH:mm"
                  value={endTime ? dayjs(endTime) : null}
                  onChange={(v) => setEndTime(v ? v.format("YYYY-MM-DDTHH:mm") : "")}
                  placeholder="Select end date & time"
                  className="w-full"
                  allowClear
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 — AI Assistant */}
        <AIPanel onAddQuestions={handleAddGenerated} />

        {/* Section 3 — Questions */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Questions ({questions.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddForm((v) => !v);
                setEditingIndex(null);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Plus className="h-4 w-4" />
              {showAddForm ? "Close" : "Add Question"}
            </button>
          </div>

          {/* Add question form */}
          {showAddForm && (
            <div className="mb-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 p-6">
              <h3 className="mb-4 text-base font-semibold text-slate-900">
                New question
              </h3>
              <QuestionEditor
                mode="create"
                onSave={handleAddQuestion}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {/* Questions list / empty state */}
          {questions.length === 0 && !showAddForm ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <ListChecks className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">
                No questions yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click <span className="font-semibold">Add Question</span> to
                start, or generate with AI above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <QuestionCard
                  key={`q-${i}`}
                  index={i}
                  question={q}
                  isFirst={i === 0}
                  isLast={i === questions.length - 1}
                  isEditing={editingIndex === i}
                  onEdit={() => {
                    setEditingIndex(i);
                    setShowAddForm(false);
                  }}
                  onDelete={() => handleDeleteQuestion(i)}
                  onDuplicate={() => handleDuplicateQuestion(i)}
                  onMoveUp={() => handleMoveUp(i)}
                  onMoveDown={() => handleMoveDown(i)}
                  onSave={handleEditQuestion}
                  onCancelEdit={() => setEditingIndex(null)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Submit row lives OUTSIDE <main> in the sticky bottom bar below. */}
      </main>

      {/* Sticky bottom action bar */}
      <div className="sticky bottom-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          {!canSubmit && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 ring-1 ring-amber-200 p-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                {!titleValid && <p>• A test title is required.</p>}
                {questions.length === 0 && <p>• Add at least one question.</p>}
                {questions.length > 0 && !everyQuestionValid && (
                  <p>
                    • Every question needs text, all options filled, and a
                    correct answer selected.
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition"
            >
              <Eye className="h-4 w-4" />
              Preview as Student
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "Creating..." : "Create Test"}
            </button>
          </div>
        </div>
      </div>

      {examCode && (
        <TextShareModal link={examCode} onClose={() => setExamCode(null)} />
      )}

      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        test={{
          title: trimmedTitle || "(untitled test)",
          description,
          startTime,
          endTime,
          durationMinutes:
            durationMinutes === "" || durationMinutes == null
              ? undefined
              : Number(durationMinutes),
          questions,
        }}
      />
    </div>
  );
}

export default CreateQuiz;
