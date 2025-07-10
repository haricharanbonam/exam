import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignupForm from "./pages/SignUp";
import PrivateRoute from "./components/Auth";
import React from "react";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import ExamInterface from "./pages/ExamInterface";
import StartExamPage from "./pages/StartExamPage";
import { CameraProvider } from "./context/CameraContext";
import AttemptTest from "./pages/AttemptTest";
import { useEffect } from "react";
import { useState } from "react";

export default function App() {
  // const [isOnline, setIsOnline] = useState(true);
  // useEffect(() => {
  //   const updateStatus = () => {
  //     setIsOnline(navigator.onLine);
  //   };

  //   window.addEventListener("online", updateStatus);
  //   window.addEventListener("offline", updateStatus);

  //   return () => {
  //     window.removeEventListener("online", updateStatus);
  //     window.removeEventListener("offline", updateStatus);
  //   };
  // }, []);

  return (
    <>
      {/* {isOnline ? (
        <WiFiIcon className="text-green-500" />
      ) : (
        <WiFiOffIcon className="text-red-500" />
      )} */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/interface/:id"
          element={
            <PrivateRoute>
              <ExamInterface />
            </PrivateRoute>
          }
        />
        <Route
          path="test/:id/start"
          element={
            <PrivateRoute>
              <CameraProvider>
                <StartExamPage />
              </CameraProvider>
            </PrivateRoute>
          }
        />
        <Route
          path="/exam/:id"
          element={
            <PrivateRoute>
              <AttemptTest />
            </PrivateRoute>
          }
        />
        <Route path="/attemptTest" element={<AttemptTest />} />
      </Routes>
    </>
  );
}
