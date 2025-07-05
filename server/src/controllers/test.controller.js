import { asyncHandler } from "../utils/asyncHandler.js";

import { Test } from "../models/Test.model.js";
import { User } from "../models/User.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

 const createTest = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime, durationMinutes, questions,examCode } =
    req.body;
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

  const testDetails = await Test.findOne({ examCode: id }).select("-questions");
  if (!testDetails) {
    throw new ApiError(404, "Test Not Found");
  }

  const checkAlreadyAttempted = await User.findOne({
    _id: req.user._id,
    attemptedTests: testDetails._id,
  });
  if (checkAlreadyAttempted) {
    throw new ApiError(403, "You have already attempted this test");
  }

  const response = {
    ...testDetails.toObject(),
    start: testDetails.startTime < req.time,
    end: testDetails.endTime < req.time,
  };

  res.status(200).json(new ApiResponse(200,response));
});


const handleStart = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const user_id = req.user._id;

  const test = await Test.findById(id); 
  if (!test) {
    throw new ApiError(404, "Test Not Found");
  }

  const responseDoc = new Response({
    test: id,
    person: user_id,
    startedAt: req.time,
  });
  await responseDoc.save();

  const elapsedTime = req.time - test.startTime;
  const remainingTime = test.durationMinutes - elapsedTime / (60 * 1000); 

  const response = {
    ...test.toObject(),
    ...responseDoc.toObject(),
    remainingTime,
  };

  res.status(200).json(new ApiResponse(response));
});

const handleQuestion = asyncHandler(async (req, res) => {
  const { id, questionIndex, selectedOptionIndex } = req.body;
  const user_id = req.user._id;

  const response = await Response.findOne({ test: id, person: user_id });
  if(response && response.submit) {
    throw new ApiError(403, "Test already submitted");
  }
  if (!response) {
    throw new ApiError(404, "Response Not Found");
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

  res.status(200).json(new ApiResponse("Answer recorded successfully"));
});



const handleSubmit = asyncHandler(async (req, res) => { 
  const { id } = req.body;
  const user_id = req.user._id;

  const response = await Response.findOne({ test: id, person: user_id });
  if (!response) {
    throw new ApiError(404, "Response Not Found");
  }
  if (response.submit) {
    throw new ApiError(403, "Test already submitted");
  }

  response.completedAt = req.time;
  response.submit = true;

  
  const test = await Test.findById(id);
  if (!test) {
    throw new ApiError(404, "Test Not Found");
  }
  
  let score = 0;
  response.answers.forEach((answer, index) => {
    if (test.questions[index].correctAnswerIndex === answer.selectedOptionIndex) {
      score++;
    }
  });
  
  response.score = score;
  
  await response.save();

  res.status(200).json(new ApiResponse("Test submitted successfully"));
})


export
{
  createTest,
  testInterface,
  handleStart,
  handleQuestion,
  handleSubmit
}