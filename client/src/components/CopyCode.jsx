import React, { useState } from "react";

const TextShareModal = ({ link, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-md w-full text-center border border-zinc-300 dark:border-zinc-700">
        <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
          📌 Code is available at:
        </h2>

        <div className="relative bg-zinc-100 dark:bg-zinc-800 px-4 py-2 rounded-md text-left text-sm font-mono text-zinc-800 dark:text-zinc-100 mb-4 border">
          <code className="break-all pr-8">{link}</code>

          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
            title="Copy"
          >
            {!copied ? (
              // 📋 Copy Icon (SVG)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-zinc-600 dark:text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2"
                />
              </svg>
            ) : (
              // ✅ Check Icon (SVG)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </button>
        </div>

        {copied && (
          <p className="text-xs text-green-600 dark:text-green-400 mb-2">
            ✅ Text copied to clipboard
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default TextShareModal;
