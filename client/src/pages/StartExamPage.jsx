import React, { useState,useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCamera } from "../context/CameraContext";
import ProctorCamera from "../components/ProctorCamera";
import API from "../utils/axios";

function StartExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stream, videoRef } = useCamera();
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [fullscreenAllowed, setFullscreenAllowed] = useState(false);
  const [test, setTest] = useState(null);
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const { data } = await API.get(`/test/interface/${id}`);
        console.log("Fetched test details:", data);
        setTest(data.data);
      } catch (error) {
        console.error("Failed to fetch test details:", error);
      } finally {
      }
    };
    fetchTestDetails();
  }, [id]);
  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      mediaStream.getTracks().forEach((track) => track.stop());
      setCameraAllowed(true);
    } catch (err) {
      alert(`Camera access failed: ${err.message}`);
    }
  };

  const requestFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen()
        .then(() => {
          setFullscreenAllowed(true);
        })
        .catch((err) => {
          alert(`Failed to enter fullscreen: ${err.message}`);
        });
    } else {
      alert("Fullscreen API not supported by this browser.");
    }
  };

  const canStart = cameraAllowed && fullscreenAllowed;

  return (
    <div className="flex flex-col md:flex-row min-h-screen p-6 bg-gray-50">
      <div className="flex-1 space-y-6">
        <div
          className={`p-6 rounded-lg border ${
            cameraAllowed
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-white"
          } shadow`}
        >
          <h2 className="text-xl font-semibold mb-2">📷 Camera Access</h2>
          <p className="text-gray-700 mb-4">
            This exam requires camera access for proctoring.
          </p>
          {!cameraAllowed ? (
            <button
              onClick={requestCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
            >
              Enable Camera Access
            </button>
          ) : (
            <span className="inline-flex items-center text-green-600 font-semibold">
              ✅ Access Granted
            </span>
          )}
        </div>

        <div
          className={`p-6 rounded-lg border ${
            fullscreenAllowed
              ? "border-green-500 bg-green-50"
              : "border-gray-300 bg-white"
          } shadow`}
        >
          <h2 className="text-xl font-semibold mb-2">🖥️ Fullscreen Mode</h2>
          <p className="text-gray-700 mb-4">
            You must enter fullscreen mode before starting the test.
          </p>
          {!fullscreenAllowed ? (
            <button
              onClick={requestFullscreen}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
            >
              Enter Fullscreen
            </button>
          ) : (
            <span className="inline-flex items-center text-green-600 font-semibold">
              ✅ Fullscreen Enabled
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center mt-8 md:mt-0">
        <button
          disabled={!canStart}
          onClick={() => navigate(`/exam/${id}`)}
          className={`w-full md:w-2/3 py-4 text-xl font-bold rounded-lg transition ${
            canStart
              ? "bg-green-600 text-white hover:bg-green-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canStart
            ? test?.resumeFlag
              ? "Resume Test"
              : "Start Test"
            : "Complete Permissions"}
        </button>
      </div>
    </div>
  );
}

export default StartExamPage;
