import { createContext, useContext, useState } from "react";
import React from "react";

const CameraContext = createContext();

export const useCamera = () => useContext(CameraContext);

export const CameraProvider = ({ children }) => {
  const [stream, setStream] = useState(null);

  return (
    <CameraContext.Provider value={{ stream, setStream }}>
      {children}
    </CameraContext.Provider>
  );
};
