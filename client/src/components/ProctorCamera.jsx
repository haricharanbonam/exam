import React, { useEffect, useRef } from "react";

function ProctorCamera({ stream }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="fixed bottom-4 right-4 w-48 h-36 border-2 border-green-500 rounded overflow-hidden shadow-lg bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default ProctorCamera;
