import React, { useState, useEffect } from "react";
import API from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const InstructorDashboard = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTests = async () => {
      try {
        const response = await API.get("/test/instructor/my-tests");
        setTests(response.data.data);
      } catch (err) {
        console.error("Failed to fetch tests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTests();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Instructor Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Manage your tests and monitor candidate performance in real-time.</p>
          </div>
          <Link
            to="/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:scale-105"
          >
            Create New Test
          </Link>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No tests created yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first exam code.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test.examCode}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/instructor/test/${test.examCode}`)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="bg-indigo-50 p-3 rounded-xl group-hover:bg-indigo-600 transition-colors">
                      <svg className="h-6 w-6 text-indigo-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {test.participantCount} Candidates
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900 truncate">{test.title}</h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <code className="bg-gray-100 px-2 py-1 rounded text-indigo-600 font-mono text-xs">{test.examCode}</code>
                    <span className="mx-2 text-gray-300">•</span>
                    <span>{test.durationMinutes} mins</span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-indigo-600 font-semibold text-sm">
                    View Results
                    <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
