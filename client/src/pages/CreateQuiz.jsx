import React, { useState } from "react";
import axios from "axios";
import API from "../utils/axios";
import ExamCode from "../components/ExamCode";
import TextShareModal from "../components/CopyCode";

function CreateQuiz() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [code,setCode]=useState("");
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleSaveQuestion = () => {
    if (!question || options.includes("") || answer === "") {
      alert("Please fill all question fields!");
      return;
    }

    const newQuestion = {
      questionText: question,
      options,
      answer: parseInt(answer),
    };

    setQuestions([newQuestion, ...questions]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setAnswer("");
  };
  function generateCode() {
    const userJson = localStorage.getItem("user");
    if (!userJson) return null; // If missing, return null to handle gracefully

    const username = JSON.parse(userJson).username || "USER";
    const unamePart = username.substring(0, 3).toUpperCase(); // 3 letters

    const safeTitle = title || "QT"; // fallback
    const titlePart = safeTitle.substring(0, 2).toUpperCase(); // 2 letters

    const timestampHash = (Date.now() % 100).toString().padStart(2, "0");

    return `${unamePart}${titlePart}${timestampHash}`;
  }

  const handleSubmitQuiz = async () => {
    if (
      !title ||
      !description ||
      !startTime ||
      !endTime ||
      !durationMinutes ||
      questions.length === 0
    ) {
      alert("Please fill all quiz details and add at least one question.");
      return;
    }
    setCode(generateCode());
    const quizData = {
      title,
      description,
      startTime,
      endTime,
      durationMinutes,
      questions,
      examCode: code  || "QT00",
    };

    try {
      const res = await API.post("/test/create", quizData);
      console.log("Quiz created:", res.data);
      alert("Quiz successfully created!");
    } catch (err) {
      console.error("Quiz creation failed:", err);
      alert("Something went wrong. Check console for details.");
    }
  };

  return (
    <div id="create" className="bg-gray-50 p-8 min-h-screen">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Create Quiz
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            Description:
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            Start Date & Time:
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            End Date & Time:
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            Duration (minutes):
          </label>
          <input
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
            min="1"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Separator */}
        <hr className="my-8 border-t-4 border-blue-300 rounded" />

        {/* Questions section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question:
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            Options:
          </label>
          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
              className="w-full p-3 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}

          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
            Correct Option (1-4):
          </label>
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter index (1-4)"
            min="1"
            max="4"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={handleSaveQuestion}
            className="w-full mt-4 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-500 transition-all duration-300"
          >
            Save Question
          </button>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Saved Questions
          </h2>
          {questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="p-6 bg-white border border-gray-200 rounded-lg shadow-md"
                >
                  <p className="text-lg font-medium text-gray-800">
                    <strong>Question:</strong> {q.questionText}
                  </p>
                  <ul className="list-disc pl-5 mt-4">
                    {q.options.map((option, i) => (
                      <li key={i} className="text-sm text-gray-600">
                        {i + 1 === q.answer ? (
                          <strong className="text-green-600">
                            {option} (Correct)
                          </strong>
                        ) : (
                          option
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No questions saved yet.</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmitQuiz}
          className="w-full mt-6 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-500 transition-all duration-300"
        >
          Submit Quiz
        </button>
      </form>
      {showModal && (
        <TextShareModal
          link={code}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default CreateQuiz;
