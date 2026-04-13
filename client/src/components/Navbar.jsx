import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axios";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const handleLogout = async () => {
    try {
      await API.get("/logout", { withCredentials: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
      <div 
        className="text-2xl font-extrabold text-indigo-600 tracking-tight cursor-pointer hover:opacity-80 transition"
        onClick={() => navigate("/")}
      >
        ExamY
      </div>

      <div className="flex space-x-8 items-center">
        <Link to="/" className="text-gray-600 hover:text-indigo-600 font-semibold transition">Home</Link>
        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-semibold transition">Dashboard</Link>
            <Link to="/create" className="text-gray-600 hover:text-indigo-600 font-semibold transition">Create Test</Link>
          </>
        )}
      </div>

      <div className="flex items-center space-x-6">
        {isAuthenticated ? (
          <>
            <Link to={`/profile/${user?.username}`} className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-all">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-bold text-gray-800 leading-none">{user?.fullName}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{user?.role}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition-all text-sm border border-red-100 shadow-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-semibold transition">Login</Link>
            <Link 
              to="/signup" 
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-sm"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
