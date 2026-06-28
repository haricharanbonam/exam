import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Camera, X } from "lucide-react";

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: "user",
};

function dataUrlToBlob(dataUrl) {
  if (!dataUrl) return null;
  const parts = dataUrl.split(",");
  if (parts.length < 2) return null;
  const mimeString = parts[0].split(":")[1].split(";")[0];
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i += 1) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

function CameraThumbnail({
  userId,
  testId,
  captureIntervalMs = 3000,
  onSuspiciousActivity,
}) {
  const webcamRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const captureSnapshot = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    setCapturing(true);
    try {
      const blob = dataUrlToBlob(imageSrc);
      if (!blob) return;
      const formData = new FormData();
      formData.append("image", blob, "snapshot.jpg");
      formData.append("userId", userId || "");
      formData.append("testId", testId || "");

      const response = await axios.post(
        "http://127.0.0.1:8000/detect",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response?.data?.suspicious === true && onSuspiciousActivity) {
        onSuspiciousActivity({ ...response.data, image: imageSrc });
      }
    } catch (error) {
      console.error("Snapshot logging failed:", error);
    } finally {
      // Hold the indicator briefly so the user sees the pulse
      setTimeout(() => setCapturing(false), 350);
    }
  }, [userId, testId, onSuspiciousActivity]);

  useEffect(() => {
    if (!userId || !testId) return undefined;
    const interval = setInterval(() => {
      captureSnapshot();
    }, captureIntervalMs);
    return () => clearInterval(interval);
  }, [userId, testId, captureIntervalMs, captureSnapshot]);

  useEffect(() => {
    if (!expanded) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Open camera preview"
        className="relative inline-flex h-9 w-12 rounded-lg ring-1 ring-slate-200 overflow-hidden bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored
          className="!h-full !w-full object-cover"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          screenshotQuality={0.2}
        />
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ${
            capturing ? "opacity-100 animate-pulse-soft" : "opacity-60"
          }`}
        />
      </button>

      {expanded && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Camera preview"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setExpanded(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            className="bg-slate-900 rounded-2xl shadow-2xl ring-1 ring-slate-700 overflow-hidden flex flex-col"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
              <span className="inline-flex items-center gap-2 text-slate-100 text-sm font-medium">
                <Camera className="h-4 w-4" aria-hidden="true" />
                Camera preview
                <span
                  className={`ml-2 inline-flex items-center gap-1 text-[11px] text-rose-300 ${
                    capturing ? "opacity-100" : "opacity-70"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full bg-rose-500 ${
                      capturing ? "animate-pulse-soft" : ""
                    }`}
                    aria-hidden="true"
                  />
                  REC
                </span>
              </span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="Close camera preview"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-200 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="bg-black">
              <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 320,
                  height: 240,
                  facingMode: "user",
                }}
                mirrored
                className="block h-60 w-80 object-cover"
                style={{ width: 320, height: 240, objectFit: "cover" }}
                screenshotQuality={0.4}
              />
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CameraThumbnail;
