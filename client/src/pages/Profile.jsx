import React, { useEffect, useState } from "react";
import API from "../utils/axios";
import { useParams } from "react-router-dom";

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, [username]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!profile)
    return <div className="text-center mt-10">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-2xl p-8">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-2 border-blue-500"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-blue-500 text-white flex items-center justify-center text-4xl font-bold">
              {getInitial(profile.fullName)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-2xl font-bold">{profile.fullName}</h2>
          <p className="text-gray-600">@{profile.username}</p>
          <p className="text-sm text-gray-500">{profile.role}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>

        {/* Attempted Tests */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Attempted Tests</h3>
          {profile.attemptedTests.length > 0 ? (
            <ul className="space-y-3">
              {profile.attemptedTests.map((test, idx) => (
                <li
                  key={idx}
                  className="p-4 bg-gray-100 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium">{test.testName}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(test.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-blue-600 font-bold text-lg">
                    {test.score}%
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No attempted tests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
