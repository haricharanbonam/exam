// Corrected AttemptTest.jsx
import React, { useState, useEffect, useRef } from "react";
import API from "../utils/axios";
import SnapshotCamera from "../components/SnapshotCamera.jsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SubmitPopup from "../components/SubmitPopup.jsx";
import Popup from "../components/Popup.jsx";

function AttemptTest() {
  const location = useLocation();
  const quizId = useParams().id;
  const nav = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [option, setOption] = useState(null);
  const [reviewFlags, setReviewFlags] = useState([]);
  const [remainingTime, setRemainingTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testId, setTestId] = useState("");
  const [popup, setPopup] = useState(false);
  const timerRef = useRef(null);
  const [popupMessage, setPopupMessage] = useState("");
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await API.post(`/test/start`, { id: quizId });
        const data = response.data.data;
        console.log(data);
        console.log("Quiz data fetched:", data);
        setQuizData(data.questions);
        setResponses(Array(data.questions.length).fill(null));
        setReviewFlags(Array(data.questions.length).fill(false));
        setTestId(data._id);
        setRemainingTime(Math.max(0, Math.floor(data.remainingTime * 60)));
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (remainingTime === null) return;
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [remainingTime]);
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };
  const showPopup = (message) => {
    setPopupMessage(message);
  };
  const handleOption = (i) => {
    setOption(i);
    const updatedResponses = [...responses];
    updatedResponses[index] = i;
    setResponses(updatedResponses);
  };

  const handleCancel = () => {
    setPopup(false);
  };
  const handleConfirm = () => {
    handleSubmit();
  };
  const gotoQuestion = (i) => {
    setIndex(i);
  };

  const saveResponse = async (markForReview) => {
    setLoading(true);
    try {
      const questionIndex = index;
      const selectedOptionIndex = option;
      await API.post(`/test/question`, {
        questionIndex,
        selectedOptionIndex,
        markForReview,

        id: quizId,
      });

      const updatedFlags = [...reviewFlags];
      updatedFlags[index] = markForReview;
      setReviewFlags(updatedFlags);
      console.log(
        `Saved Q${index + 1} option ${option}, markForReview: ${markForReview}`
      );
    } catch (error) {
      console.error("Error saving response:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNext = async () => {
    if (option !== null) await saveResponse(false);
    if (index < quizData.length - 1) setIndex(index + 1);
  };

  const handleMarkForReview = async () => {
    if (option !== null) await saveResponse(true);
    if (index < quizData.length - 1) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleAutoSubmit = async () => {
    console.log("Time's up! Submitting automatically...");
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await API.post("/test/submit", {
        id: quizId,
      });
      console.log("Submitted:", response.data.data);
      nav("/success");
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOption(responses[index]);
  }, [index]);

  if (quizData.length === 0) return <p>Loading quiz...</p>;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-blue-500 min-h-screen flex justify-center items-center relative">
      <SnapshotCamera
        userId={JSON.parse(localStorage.getItem("user"))._id}
        testId={quizId}
        onSuspiciousActivity={showPopup}
      />
      <div className="bg-white w-full max-w-4xl p-6 rounded-lg shadow-lg grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xl font-bold text-gray-800">
              Q{index + 1}: {quizData[index].questionText}
            </p>
            <span className="text-lg font-mono text-red-600">
              ⏰ {remainingTime !== null ? formatTime(remainingTime) : "--:--"}
            </span>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            {quizData[index].options.map((opt, i) => (
              <div
                key={i}
                className={`p-3 border rounded-md cursor-pointer transition duration-200 ${
                  option === i ? "bg-blue-200" : "bg-white"
                }`}
                onClick={() => handleOption(i)}
              >
                {`${i + 1}. ${opt}`}
              </div>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handlePrev}
              disabled={index === 0}
              className="bg-blue-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
            >
              Prev
            </button>
            <button
              onClick={handleSaveAndNext}
              className="bg-green-600 text-white py-2 px-4 rounded"
            >
              Save & Next
            </button>
            <button
              onClick={handleMarkForReview}
              className="bg-yellow-500 text-white py-2 px-4 rounded"
            >
              Mark for Review
            </button>
            <button
              onClick={() => setPopup(true)}
              className="bg-red-600 text-white py-2 px-4 rounded ml-auto"
            >
              Submit
            </button>
          </div>
        </div>

        <div className="col-span-1">
          <div className="grid grid-cols-4 gap-2">
            {responses.map((res, i) => (
              <span
                key={i}
                onClick={() => gotoQuestion(i)}
                className={`h-10 w-10 rounded-full flex items-center justify-center cursor-pointer ${
                  reviewFlags[i]
                    ? "bg-purple-600"
                    : res === null
                    ? "bg-red-500"
                    : "bg-green-500"
                } text-white`}
                title={
                  reviewFlags[i]
                    ? "Marked for review"
                    : res === null
                    ? "Not answered"
                    : "Answered"
                }
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="h-10 w-10 border-t-4 border-white animate-spin rounded-full"></div>
        </div>
      )}

      {popup && (
        <SubmitPopup onConfirm={handleConfirm} onCancel={handleCancel} />
      )}
      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage("")} />
      )}
    </div>
  );
}

export default AttemptTest;
