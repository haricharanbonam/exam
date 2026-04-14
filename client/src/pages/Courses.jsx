import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axios";
import Navbar from "../components/Navbar";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await API.get("/courses");
        setCourses(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

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
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Available Courses</h1>
            <p className="mt-4 text-lg text-gray-600">Level up your skills with our curated coding paths.</p>
          </div>
          <div className="hidden md:block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm">
            {courses.length} Courses Found
          </div>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course._id}
                onClick={() => navigate(`/courses/${course._id}`)}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full"
              >
                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6 transition-transform group-hover:scale-[1.02] duration-300">
                   <div className="text-white text-4xl font-black opacity-20 absolute top-4 right-6 select-none">COURSE</div>
                   <h3 className="text-white text-2xl font-bold text-center z-10 leading-tight">{course.title}</h3>
                </div>
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-gray-600 line-clamp-3 leading-relaxed mb-6">
                      {course.description || "No description provided for this course."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className="text-indigo-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center">
                      Browse Challenges <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-2xl font-bold text-gray-900">No courses available yet</h2>
            <p className="text-gray-500 mt-2">Check back soon for new content!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
