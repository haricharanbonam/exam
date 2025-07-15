import React, { useEffect, useRef } from "react";
import axios from "axios";

function SnapshotCamera({ userId, testId, onSuspiciousActivity }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let localStream;
    let snapshotInterval;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        localStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // ⏱️ Snapshot every 6 seconds (6000 milliseconds)
        snapshotInterval = setInterval(() => {
          takeSnapshotAndSend();
        }, 6000);
      })
      .catch((err) => {
        console.error("Camera access error:", err);
      });

    const takeSnapshotAndSend = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          const formData = new FormData();
          formData.append("image", blob, "snapshot.jpg");
          formData.append("userId", userId);
          formData.append("testId", testId);

          axios
            .post("http://127.0.0.1:8000/detect", formData)
            .then((res) => {
              const { suspicious, objects } = res.data;
              console.log("Snapshot result:", { suspicious, objects });

              if (suspicious) {
                onSuspiciousActivity?.("⚠️ Cheating detected!");
              }
            })
            .catch((err) => {
              console.error("Failed to send snapshot:", err);
            });
        }, "image/jpeg");
      }

      console.log("Snapshot captured and sent...");
    };

    return () => {
      clearInterval(snapshotInterval);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [userId, testId, onSuspiciousActivity]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        muted
        className="fixed bottom-6 right-6 w-72 h-48 border-2 border-green-500 rounded overflow-hidden shadow-lg bg-black z-[9999]"
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}

export default SnapshotCamera;
