import { asyncHandler } from "../utils/asyncHandler.js";

import { Test } from "../models/Test.model.js";
import { User } from "../models/User.model.js";
import { Response } from "../models/Response.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const createTest = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startTime,
    endTime,
    durationMinutes,
    questions,
    examCode,
  } = req.body;
  if (!title || !questions || questions.length === 0) {
    res.status(400);
    throw new Error("Title and at least one question are required.");
  }
  const creator = await User.findById(req.user._id);
  if (!creator) {
    res.status(404);
    throw new Error("Instructor not found.");
  }

  const newTest = await Test.create({
    title,
    description,
    creator: creator._id,
    startTime,
    endTime,
    durationMinutes,
    questions,
    examCode,
    numberOfQuestions: questions.length,
  });
  creator.createdTests.push(newTest._id);
  await creator.save();
  res.status(201).json(new ApiResponse("successfully created"));
});
const testInterface = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const now = new Date(req.time);
  const testDetails = await Test.findOne({ examCode: id }).select("-questions");
  if (!testDetails) {
    throw new ApiError(404, "Test Not Found");
  }

  // const checkAlreadyAttempted = await User.findOne({
  //   _id: req.user._id,
  //   attemptedTests: testDetails._id,
  // });
  const checkAlreadyAttempted = await Response.findOne({
    person: req.user._id,
    test: testDetails._id,
  });

  const response = {
    ...testDetails.toObject(),
    start: testDetails.startTime <= now,
    end: testDetails.endTime <= now,
    resumeFlag: checkAlreadyAttempted || false,
    submitted: checkAlreadyAttempted?.submit
  };
  res.status(200).json(new ApiResponse(200, response));
});

const handleStart = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const user_id = req.user._id;
  const now = new Date(req.time);

  console.log("Starting test with examCode:", id);

  const test = await Test.findOne({ examCode: id });
  if (!test) {
    throw new ApiError(404, "Test Not Found");
  }

  if (now < new Date(test.startTime) || now > new Date(test.endTime)) {
    throw new ApiError(403, "Test is not active now");
  }

  let responseDoc = await Response.findOne({ test: test._id, person: user_id });

  if (!responseDoc) {
    // First time starting — set the startedAt time
    responseDoc = new Response({
      test: test._id,
      person: user_id,
      startedAt: now,
    });
    await responseDoc.save();
  }

  const startedAt = new Date(responseDoc.startedAt);
  const elapsedTimeMs = now - startedAt;
  const remainingTime = Math.max(
    0,
    test.durationMinutes - elapsedTimeMs / (60 * 1000)
  );

  const response = {
    ...test.toObject(),
    ...responseDoc.toObject(),
    remainingTime,
    startedAt, // Optional: include explicitly if needed
  };

  res.status(200).json(new ApiResponse(200, response));
});

const handleResume = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const user_id = req.user._id;
  const now = new Date(req.time);
  console.log("Resuming test with examCode:", id);
  const test = await Test.findOne({ examCode: id });
  if (!test) {
    throw new ApiError(404, "Test Not Found");
  }
  if (now < new Date(test.startTime) || now > new Date(test.endTime)) {
    throw new ApiError(403, "Test is not active now");
  }
  const responseDoc = await Response.findOne({
    test: test._id,
    person: user_id,
  });
  if (!responseDoc) {
    throw new ApiError(403, "Test not started yet");
  }
  const startedAt = new Date(responseDoc.startedAt);
  const elapsedTimeMs = now - startedAt;
  const remainingTime = Math.max(
    0,
    test.durationMinutes - elapsedTimeMs / (60 * 1000)
  );

  const response = {
    ...test.toObject(),
    ...responseDoc.toObject(),
    remainingTime,
    startedAt,
  };

  res.status(200).json(new ApiResponse(200, response));
});

const handleQuestion = asyncHandler(async (req, res) => {
  const { id, questionIndex, selectedOptionIndex } = req.body;
  const user_id = req.user._id;
  if (id == null || questionIndex == null || selectedOptionIndex == null) {
    throw new ApiError(
      400,
      "All fields (id, questionIndex, selectedOptionIndex) are required"
    );
  }
  const test = await Test.findOne({ examCode: id });
  if (!test) {
    throw new ApiError(404, "Test Not Found");
  }
  const response = await Response.findOne({ test: test._id, person: user_id });
  if (!response) {
    throw new ApiError(404, "Response Not Found");
  }
  if (response.submit) {
    throw new ApiError(403, "Test already submitted");
  }
  const existingAnswer = response.answers.find(
    (ans) => ans.questionIndex === questionIndex
  );
  if (existingAnswer) {
    existingAnswer.selectedOptionIndex = selectedOptionIndex;
  } else {
    response.answers.push({ questionIndex, selectedOptionIndex });
  }

  response.markModified("answers");
  await response.save();

  res.status(200).json(new ApiResponse(200, "Answer recorded successfully"));
});

const handleSubmit = asyncHandler(async (req, res) => {
  const { id: examCode } = req.body;
  const user_id = req.user._id;
  const test = await Test.findOne({ examCode });
  if (!test) {
    throw new ApiError(404, "Test Not Found");
  }
  const response = await Response.findOne({ test: test._id, person: user_id });
  if (!response) {
    throw new ApiError(404, "Response Not Found");
  }

  if (response.submit) {
    throw new ApiError(403, "Test already submitted");
  }
  let score = 0;
  response.answers.forEach((answer) => {
    const question = test.questions[answer.questionIndex];
    console.log(
      `Q${answer.questionIndex + 1}: Selected ${
        answer.selectedOptionIndex
      }, Correct ${question?.correctAnswerIndex}`
    );

    if (
      question &&
      question.correctAnswerIndex === answer.selectedOptionIndex
    ) {
      score++;
    }
  });
  

  response.completedAt = req.time;
  response.submit = true;
  response.score = score;

  await response.save();

  await User.findByIdAndUpdate(user_id, {
    $addToSet: { attemptedTests: response._id },
  });

  res.status(200).json(new ApiResponse("Test submitted successfully"));
});

 const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username : username })
    .populate({
      path: "attemptedTests",
      populate: {
        path: "test",
        model: "Test",
        select: "title",
      },
    })
    .select("-password -refreshToken");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const profile = {
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    aboutme: user.aboutme,
    Profession: user.Profession,
    avatarUrl: user.avatarUrl,
    interests: user.interests,
    createdAt: user.createdAt,
    attemptedTests: user.attemptedTests.map((attempt) => ({
      testName: attempt?.test?.title || "Unknown Test",
      score: attempt.score,
      date: attempt.completedAt || attempt.startedAt,
    })),
  };

  res.status(200).json({ success: true, data: profile });
});

const getAllTests = asyncHandler(async (req, res) => {
  const tests = await Test.find({});
  if (!tests || tests.length === 0) {
    throw new ApiError(404, "No tests found");
  }
  res.status(200).json(new ApiResponse("Tests retrieved successfully", tests));
});


const getAllResults = asyncHandler(async (req, res) => {
  const user_id = req.user._id;
  const user = await User.findById(user_id).populate({
    path: "attemptedTests",
    populate: {
      path: "test",
      select: "title description examCode durationMinutes",
    },
    select: "score submit completedAt startedAt",
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const results = user.attemptedTests.map((response) => ({
    testTitle: response.test?.title || "Unknown Test",
    examCode: response.test?.examCode || "N/A",
    duration: response.test?.durationMinutes || 0,
    startedAt: response.startedAt,
    completedAt: response.completedAt,
    score: response.score,
    submitted: response.submit,
  }));

  res.status(200).json(new ApiResponse(200, results));
});

export {
  createTest,
  testInterface,
  handleStart,
  handleQuestion,
  handleSubmit,
  getAllTests,
  handleResume,
  getAllResults,
  getUserProfile
};
