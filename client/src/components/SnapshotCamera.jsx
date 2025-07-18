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
    let isMounted = true;

    const captureAndWait = async () => {
      if (!isMounted) return;

      try {
        await captureSnapshot(); // wait for the snapshot to finish
      } catch (err) {
        console.error("Snapshot error:", err);
      }

      // Wait 6 seconds, then capture again
      setTimeout(() => {
        captureAndWait();
      }, 6000);
    };

    captureAndWait(); // Initial call

    return () => {
      isMounted = false; // Cleanup to stop if component unmounts
    };
  }, []);

  // const captureSnapshot = async () => {
  //   if (webcamRef.current) {
  //     const imageSrc = webcamRef.current.getScreenshot();

  //     if (imageSrc) {
  //       // Convert base64 to Blob
  //       const byteString = atob(imageSrc.split(",")[1]);
  //       const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
  //       const ab = new ArrayBuffer(byteString.length);
  //       const ia = new Uint8Array(ab);
  //       for (let i = 0; i < byteString.length; i++) {
  //         ia[i] = byteString.charCodeAt(i);
  //       }
  //       const blob = new Blob([ab], { type: mimeString });

  //       // Append to FormData
  //       const formData = new FormData();
  //       formData.append("image", blob, "snapshot.jpg");
  //       formData.append("userId", userId);
  //       formData.append("testId", testId);

  //       try {
  //         const response = await axios.post(
  //           "http://127.0.0.1:8000/detect",
  //           formData,
  //           {
  //             headers: {
  //               "Content-Type": "multipart/form-data",
  //             },
  //           }
  //         );

  //         console.log("Snapshot logged:", response.data);

  //         if (response.data.suspicious === true && onSuspiciousActivity) {
  //           onSuspiciousActivity(response.data);
  //         }
  //       } catch (error) {
  //         console.error(
  //           "Snapshot logging failed:",
  //           error.response?.data || error.message
  //         );
  //       }
  //     }
  //   }
  // };

  const captureSnapshot = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        try {
          // Convert base64 to a Blob
          const byteString = atob(imageSrc.split(",")[1]);
          const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          // Prepare form data
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
          if (response.data.suspicious === true && onSuspiciousActivity) {
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
