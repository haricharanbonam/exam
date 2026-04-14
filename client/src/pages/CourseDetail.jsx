import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/axios";
import Navbar from "../components/Navbar";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await API.get(`/courses/${courseId}/challenges`);
        setChallenges(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching challenges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate("/courses")}
          className="mb-8 flex items-center text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          Back to Courses
        </button>

        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Challenges</h1>
          <p className="mt-4 text-lg text-gray-600">Master the concepts through hands-on practice.</p>
        </div>

        {challenges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div 
                key={challenge._id}
                onClick={() => navigate(`/courses/challenge/${challenge._id}`)}
                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{challenge.title}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Difficulty: Intermediate</p>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">🛠️</div>
            <h2 className="text-2xl font-bold text-gray-900">This course has no challenges yet</h2>
            <p className="text-gray-500 mt-2">Check back later for new content.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
