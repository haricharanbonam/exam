import React, { useEffect, useState } from "react";
import API from "../utils/axios";
import { useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";

const Profile = () => {
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const isOwnProfile = JSON.parse(localStorage.getItem("user"))?.username === username;

  const getInitial = (name) => (name?.[0] || "U").toUpperCase();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/user/profile/${username}`);
        setProfile(res.data.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    if (searchParams.get("github") === "success") {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [username, searchParams]);

const handleLinkGitHub = async () => {
  try {
    const res = await API.get("/github/link", {
      headers: { Accept: "application/json" },
    });
    const { url } = res.data.data;
    if (url) {
      window.location.href = url;
    }
  } catch (err) {
    console.error("Failed to get GitHub link URL:", err);
    toast.error("Failed to initiate GitHub link. Please try again.");
  }
};

if (loading) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-[60vh]">
        <div className="h-10 w-10 rounded-full border-2 border-t-indigo-600 border-slate-200 animate-spin" />
      </div>
    </div>
  );
}

if (!profile) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-500">Profile not found.</p>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="py-8 px-4 md:px-12 lg:px-24">
      {showSuccess && (
        <div className="max-w-3xl mx-auto mb-4 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl shadow-sm flex items-center justify-center font-semibold">
          🎉 GitHub account linked successfully!
        </div>
      )}
      <div className="max-w-3xl mx-auto bg-white shadow-sm rounded-2xl p-8 ring-1 ring-slate-200">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-indigo-600 text-white flex items-center justify-center text-4xl font-bold">
              {getInitial(profile.fullName)}
            </div>
          )}
        </div>

        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">{profile.fullName}</h2>
          <p className="text-indigo-600 font-medium">@{profile.username}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">
              {profile.role}
            </span>
            {profile.githubUsername ? (
              <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full flex items-center gap-1">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.412-4.041-1.412-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                Connected: @{profile.githubUsername}
              </span>
            ) : (
              isOwnProfile && (
                <button
                  onClick={handleLinkGitHub}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full transition shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.412-4.041-1.412-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  Link GitHub Account
                </button>
              )
            )}
          </div>
          <p className="text-sm text-slate-500">{profile.email}</p>
        </div>

        {/* Attempted Tests */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Attempted Tests</h3>
          {profile.attemptedTests.length > 0 ? (
            <ul className="space-y-3">
              {profile.attemptedTests.map((test, idx) => (
                <li
                  key={idx}
                  className="p-4 bg-slate-50 ring-1 ring-slate-200 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-slate-900">{test.testName}</h4>
                    <p className="text-sm text-slate-500">
                      {new Date(test.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-indigo-600 font-bold text-lg">
                    {test.score}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm">No attempted tests yet.</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default Profile;
