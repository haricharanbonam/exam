import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

function SnapshotCamera({ userId, testId, onSuspiciousActivity }) {
  const webcamRef = useRef(null);
  useEffect(() => {
    const interval = setInterval(() => {
      captureSnapshot();
    }, 3000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const captureSnapshot = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const byteString = atob(imageSrc.split(",")[1]);
          const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          const formData = new FormData();
          formData.append("image", blob, "snapshot.jpg");
          formData.append("userId", userId);
          formData.append("testId", testId);

          const response = await axios.post(
            "http://127.0.0.1:8000/detect",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          console.log("Snapshot logged:", response.data);
          if (
            response.data.suspicious === true &&
            onSuspiciousActivity
          ) {
            onSuspiciousActivity(response.data);
          }
        } catch (error) {
          console.error("Snapshot logging failed:", error);
        }
      }
    }
  };

  return (
    <div>
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        style={{ width: "100%", borderRadius: "12px" }}
        screenshotQuality={0.2}
      />
    </div>
  );
}

export default SnapshotCamera;
