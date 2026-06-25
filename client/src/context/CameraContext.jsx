import { createContext, useContext, useRef, useState } from "react";
import React from "react";

const CameraContext = createContext();

export const useCamera = () => useContext(CameraContext);

export const CameraProvider = ({ children }) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  return (
    <CameraContext.Provider value={{ stream, setStream, videoRef }}>
      {children}
    </CameraContext.Provider>
  );
};
