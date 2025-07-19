import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import API from "../utils/axios";

const ExamInterface = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const { data } = await API.get(`/test/interface/${id}`);
        console.log("Fetched test details:", data);
        setTestId(data.data._id);
        setTest(data.data);
      } catch (error) {
        console.error("Failed to fetch test details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading exam details...
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-red-500">
        Failed to load exam.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-8 flex flex-col lg:flex-row gap-8">
      {/* Left Panel */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{test.title}</h1>
        <p className="text-gray-600 mb-6">{test.description}</p>

        <div className="space-y-4 text-gray-700">
          <div>
            📅 <strong>Duration:</strong> {test.durationMinutes} Minutes
          </div>
          <div>
            ❓ <strong>Questions:</strong> {test.numberOfQuestions}
          </div>
          <div>
            📝 <strong>Marks:</strong> {test.numberOfQuestions}
          </div>
          <div>
            ⏰ <strong>Start Date:</strong>{" "}
            {new Date(test.startTime).toLocaleString()}
          </div>
          <div>
            ⏰ <strong>End Date:</strong>{" "}
            {new Date(test.endTime).toLocaleString()}
          </div>
        </div>

        <div className="mt-8 text-gray-700">
          <p>Hello,</p>
          <p className="mt-2">
            We are delighted to welcome you to this assessment process. This
            assessment is designed to test the necessary skills and knowledge
            that would help us make an informed decision regarding your
            application further.
          </p>
          <p className="mt-2">
            Before you start the assessment, kindly go through all the
            instructions and guidelines carefully. If you encounter any
            technical issues or have questions, please contact our support team.
          </p>
          <p className="mt-2">
            We appreciate your time and effort in completing this assessment.
            Good Luck!
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📝 Key Instructions
        </h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2 mb-6">
          <li>Only the registered person can take the assessment.</li>
          <li>You must submit answers individually for every question.</li>
          <li>Your answers and submission times are tracked by the system.</li>
          <li>Answers cannot be modified once submitted.</li>
          <li>Unfair practices will lead to disqualification.</li>
          <li>
            All decisions are final and at the discretion of the organizers.
          </li>
        </ul>

        <p className="text-sm text-gray-500 mb-6">
          <strong>Note:</strong> If the start button is not activated at the
          start time, please refresh the page.
        </p>

        {test.end ? (
          <button
            className="w-full py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
            disabled
          >
            Exam Ended
          </button>
        ) : !test.start ? (
          <button
            className="w-full py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
            disabled
          >
            Not Started Yet
          </button>
        ) : test.submitted ? (
          <button
            className="w-full py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
            disabled
          >
            Exam Already Submitted
          </button>
        ) : (
          <button
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-all duration-300"
            onClick={() => navigate(`/test/${id}/start`)}
          >
            {test?.resumeFlag ? `Resume Exam` : `Start Exam`}
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamInterface;
