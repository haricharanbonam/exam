import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import SignupForm from "./pages/SignUp";
import PrivateRoute from "./components/Auth";
import React from "react";
import Home from "./pages/Home";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home/>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
