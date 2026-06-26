import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  FileText,
  Clock,
  Calendar,
  ListChecks,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../utils/axios";
import TextShareModal from "../components/CopyCode";
import QuestionEditor from "../components/CreateQuiz/QuestionEditor";
import QuestionCard from "../components/CreateQuiz/QuestionCard";

const TITLE_MAX = 100;

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
          {/* Autosave indicator placeholder — chunk 4 */}
          <div className="text-xs text-slate-400" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Start time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  End time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="block w-full rounded-xl border-0 px-3.5 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
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

        {/* Section 2 — AI Assistant placeholder */}
        {/* AI panel slot — chunk 3 will plug in here */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">
                Generate questions with AI
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Give a concept and we&apos;ll draft multiple-choice or true/false
                questions for you. You can review and edit before adding.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 opacity-60 cursor-not-allowed"
              >
                <Sparkles className="h-4 w-4" />
                Generate with AI (coming soon)
              </button>
            </div>
          </div>
        </section>

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

        {/* Submit row */}
        <section className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
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
              disabled
              onClick={() => console.log("Preview coming in chunk 4")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview as Student
            </button>
            <button
              type="button"
              disabled
              onClick={() => console.log("Save Draft coming in chunk 4")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-300 hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
        </section>
      </main>

      {examCode && (
        <TextShareModal link={examCode} onClose={() => setExamCode(null)} />
      )}
    </div>
  );
}

export default CreateQuiz;
