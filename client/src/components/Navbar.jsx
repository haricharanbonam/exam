import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/axios";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const handleLogout = async () => {
    try {
      await API.get("/logout", { withCredentials: true }); // call backend logout
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.removeItem("token"); // clear token
      navigate("/login"); // redirect
    }
  };

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <div className="text-2xl font-extrabold text-indigo-600 tracking-wide">
        ExamY
      </div>

      <div className="flex space-x-6"></div>

      <div className="flex items-center space-x-4">
        <Link to={`/profile/${user?.username}`} title="Profile">
<p>Profile</p>

        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-1 rounded-full border border-red-500 text-red-500 hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
