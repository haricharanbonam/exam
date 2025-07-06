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

export default function App() {
  return (
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
  );
}
