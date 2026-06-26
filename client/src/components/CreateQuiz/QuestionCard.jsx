import React from "react";
import {
  ChevronUp,
  ChevronDown,
  Pencil,
  Copy,
  Trash2,
  ListChecks,
} from "lucide-react";
import QuestionEditor from "./QuestionEditor";

const TYPE_LABEL = {
  mcq: "MCQ",
  truefalse: "T/F",
};

function QuestionCard({
  index,
  question,
  isFirst,
  isLast,
  isEditing,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onSave,
  onCancelEdit,
}) {
  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-indigo-200 p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-indigo-600 px-2 text-xs font-bold text-white">
            Q{index + 1}
          </span>
          <h3 className="text-base font-semibold text-slate-900">Edit question</h3>
        </div>
        <QuestionEditor
          mode="edit"
          initial={question}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  const type = question.type || "mcq";

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 px-2 text-xs font-bold text-white">
            Q{index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  type === "mcq"
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                <ListChecks className="h-3 w-3" />
                {TYPE_LABEL[type] || "MCQ"}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 break-words">
              {question.questionText}
            </p>
            <ul className="mt-3 space-y-1.5">
              {question.options.map((opt, i) => {
                const isCorrect = i === question.correctAnswerIndex;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-sm ${
                      isCorrect ? "text-emerald-700 font-medium" : "text-slate-600"
                    }`}
                  >
                    <span
                      className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                        isCorrect ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                    <span className="break-words">{opt}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuestionCard;
