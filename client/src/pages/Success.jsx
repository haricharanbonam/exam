import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const score = location.state?.score;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center border border-green-100">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Test Submitted Successfully!</h1>
        {score !== undefined && score !== null && (
          <p className="text-xl text-gray-700 mb-8">
            Your score: <span className="font-black text-green-600">{score}</span>
          </p>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => navigate(user?.username ? `/profile/${user.username}` : "/")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
          >
            View Profile
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
