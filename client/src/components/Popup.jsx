import React from "react";
import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

const Popup = ({ message, onClose }) => {
  const cheatCount = message?.cheatCount;
  const snapshot = message?.snapshot || message?.image;

  return (
    <Modal onClose={onClose}>
      <div
        role="alertdialog"
        aria-labelledby="popup-title"
        aria-describedby="popup-desc"
        className="bg-white rounded-2xl shadow-2xl ring-1 ring-rose-200 max-w-sm w-full p-6 sm:p-8 text-center"
      >
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 ring-1 ring-rose-200">
          <AlertTriangle className="h-6 w-6 text-rose-600" aria-hidden="true" />
        </div>

        <h2
          id="popup-title"
          className="text-lg font-semibold text-slate-900"
        >
          Suspicious Activity Detected
        </h2>

        {snapshot &&
          typeof snapshot === "string" &&
          snapshot.startsWith("data:image") && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Snapshot captured
              </p>
              <img
                src={snapshot}
                alt="Violation snapshot"
                className="w-full rounded-xl border border-rose-200 max-h-48 object-contain"
              />
            </div>
          )}

        <p id="popup-desc" className="mt-4 text-sm text-slate-700 leading-relaxed">
          {cheatCount ? (
            <>
              This is violation{" "}
              <strong className="text-rose-600">#{cheatCount}</strong>. Further
              violations will result in immediate submission of your test.
            </>
          ) : (
            "Suspicious activity was detected. Please stay on this page and avoid switching tabs."
          )}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          I understand
        </button>
      </div>
    </Modal>
  );
};

export default Popup;
