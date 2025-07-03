import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios.js";

const SignupForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await API.post("/user/register", formData, {
        withCredentials: true,
      });

      // Success response
      if (res.status === 201) {
        setMessage("Registration successful!");
        navigate("/email-sent", { state: { email: formData.email } });
      }
    } catch (err) {
      // Check if it's a known error from backend
      console.log(err.response);
      if (err.response?.status === 409 && err.response.data?.message) {
        setMessage(err.response.data.message); // "User with email / username already exists"
      } else if (err.response?.data?.message) {
        setMessage(err.response.data.message); // Any other backend message
      } else {
        setMessage("Something went wrong. Please try again."); // Network/server error
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="py-6 px-4">
        <div className="grid lg:grid-cols-2 items-center gap-6 max-w-6xl w-full">
          {/* LEFT: Form */}
          <div className="border border-slate-300 rounded-lg p-6 max-w-md shadow-[0_2px_22px_-4px_rgba(93,96,127,0.2)] max-lg:mx-auto">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="mb-12">
                <h1 className="text-slate-900 text-3xl font-semibold">
                  Sign Up
                </h1>
                <p className="text-slate-600 text-[15px] mt-6 leading-relaxed">
                  Sign up to your account and explore a world of possibilities.
                  Your journey begins here.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Full Name
                </label>
                <input
                  onChange={handleChange}
                  name="fullName"
                  type="text"
                  required
                  className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter full name"
                />
              </div>

              {/* Username */}
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Username
                </label>
                <input
                  onChange={handleChange}
                  name="username"
                  type="text"
                  required
                  className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter username"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Email
                </label>
                <input
                  onChange={handleChange}
                  name="email"
                  type="email"
                  required
                  className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Password
                </label>
                <input
                  onChange={handleChange}
                  name="password"
                  type="password"
                  required
                  className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">
                  Confirm Password
                </label>
                <input
                  onChange={handleChange}
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded-lg outline-blue-600"
                  placeholder="Confirm password"
                />
              </div>

              {/* Submit */}
              <div className="!mt-12">
                <button
                  type="submit"
                  className="w-full shadow-xl py-2.5 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none cursor-pointer"
                >
                  Sign Up
                </button>
                <p className="text-sm !mt-6 text-center text-slate-600">
                  Already have an account{" "}
                  <span
                    onClick={() => navigate("/login")}
                    className="text-blue-600 font-medium hover:underline ml-1 whitespace-nowrap cursor-pointer"
                  >
                    Login Here
                  </span>
                </p>
                <p className="text-sm text-center text-red-600 mt-4">
                  {message}
                </p>
              </div>
            </form>
          </div>

          <div className="max-lg:mt-8">
            <div className="w-full aspect-[71/50] max-lg:w-4/5 mx-auto flex items-center justify-center">
              <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-[#5A3BFF]">
                BlogX
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
