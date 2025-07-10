import React from "react";
export const InvalidPopup = ({ onCancel, msg }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="p-4 bg-slate-400 rounded-lg shadow-lg text-center transform transition-transform scale-95">
        <p> {` ${msg} Please try again.`} </p>
        <button
          className="bg-red-600 hover:bg-red-900 px-4 py-2 rounded-md"
          onClick={onCancel}
        >
          close
        </button>
      </div>
    </div>
  );
};
