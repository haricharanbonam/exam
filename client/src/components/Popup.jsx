import React from "react";

const Popup = ({ message, onClose }) => {
  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full">
      <div className="bg-black/70 backdrop-blur-md text-white rounded-xl shadow-xl p-4 animate-fade-in flex flex-col gap-3">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="self-end bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-1 rounded-md text-sm transition duration-300"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default Popup;
