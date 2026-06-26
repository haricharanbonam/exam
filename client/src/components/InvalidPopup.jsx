import React from "react";
import Modal from "./Modal";
export const InvalidPopup = ({ onCancel, msg }) => {
  return (
    <Modal onClose={onCancel} className="p-4 bg-slate-400 rounded-lg shadow-lg text-center transform transition-transform scale-95">
        <p> {` ${msg} Please try again.`} </p>
        <button
          className="bg-red-600 hover:bg-red-900 px-4 py-2 rounded-md"
          onClick={onCancel}
        >
          close
        </button>
    </Modal>
  );
};
