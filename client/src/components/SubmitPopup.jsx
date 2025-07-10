import React from "react";

const SubmitPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="popup-box bg-white w-80 p-4 rounded-lg shadow-lg text-center">
        <p className="text-lg font-bold mb-4">Do you want to submit?</p>
        <div className="buttons flex justify-around">
          <span
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md cursor-pointer hover:bg-green-600 transition-all"
          >
            Yes
          </span>
          <span
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md cursor-pointer hover:bg-red-600 transition-all"
          >
            No
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubmitPopup;
