import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignupForm from "./pages/SignUp";
import PrivateRoute from "./components/Auth";
import React from "react";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import ExamInterface from "./pages/ExamInterface";
import StartExamPage from "./pages/StartExamPage";
import { CameraProvider } from "./context/CameraContext";
import AttemptTest from "./pages/AttemptTest";
import Profile from "./pages/Profile";
import InstructorDashboard from "./pages/InstructorDashboard";
import TestDetailsView from "./pages/TestDetailsView";
import Success from "./pages/Success";
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
      <Toaster position="top-right" />
      {/* {isOnline ? (
        <WiFiIcon className="text-green-500" />
      ) : (
        <WiFiOffIcon className="text-red-500" />
      )} */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/create" element={<CreateQuiz />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route
          path="/success"
          element={
            <PrivateRoute>
              <Success />
            </PrivateRoute>
          }
        />
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
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <InstructorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/instructor/test/:examCode"
          element={
            <PrivateRoute>
              <TestDetailsView />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}
