import React from "react";

export const Message = ({ msg, status, reason, onClose }) => {
  const isSuccess = status === "success";

  return (
    <div className={`fixed top-10 right-10 z-[100] transform transition-all duration-500 animate-in slide-in-from-right-full`}>
      <div className={`flex items-start gap-4 p-5 rounded-2xl shadow-2xl backdrop-blur-md border ${
        isSuccess 
          ? "bg-green-50/90 border-green-200 text-green-900" 
          : "bg-red-50/90 border-red-200 text-red-900"
      }`}>
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-xl ${isSuccess ? "bg-green-100" : "bg-red-100"}`}>
          {isSuccess ? (
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm font-black tracking-tight uppercase opacity-50 mb-1">
            {isSuccess ? "Operation Successful" : (reason || "An Error Occurred")}
          </p>
          <div className="text-lg font-bold leading-tight">
            {msg}
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className={`p-1.5 rounded-lg transition-colors ${
            isSuccess ? "hover:bg-green-200 text-green-600" : "hover:bg-red-200 text-red-600"
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};