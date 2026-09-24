import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
export default function ExamCode() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      navigate(`/interface/${code}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-slate-50">
      <form
        className="bg-white shadow-sm ring-1 ring-slate-200 rounded-2xl p-8 w-full max-w-md text-center"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-2 text-slate-900">
          Enter Exam Code
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Ask your instructor for the exam code to get started.
        </p>
        <input
          type="text"
          className="w-full px-4 py-3 text-lg border-0 rounded-xl ring-1 ring-inset ring-slate-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 mb-4 text-slate-900 placeholder:text-slate-400"
          placeholder="e.g. AB12CD34"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          autoComplete="off"
          autoCapitalize="characters"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Attend Exam
        </button>
      </form>
    </div>
  );
}
