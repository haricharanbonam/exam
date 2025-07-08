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
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-100">
      <form
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Enter Exam Code
        </h2>
        <input
          type="text"
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
          placeholder="Enter code..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Attend Exam
        </button>
      </form>
    </div>
  );
}
