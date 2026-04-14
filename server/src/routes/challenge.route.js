import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/Course.model.js";
import { Challenge } from "../models/Challenge.model.js";
import { Submission } from "../models/Submission.model.js";
import { User } from "../models/User.model.js";
import axios from "axios";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);
const router = Router();

// GET /courses - return all Course documents
router.get("/", verifyJWT, asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("createdBy", "username fullName");
  return res.status(200).json(new ApiResponse(200, courses, "Courses fetched successfully"));
}));

// GET /courses/:courseId/challenges - return all challenges for a course
router.get("/:courseId/challenges", verifyJWT, asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const challenges = await Challenge.find({ courseId });
  return res.status(200).json(new ApiResponse(200, challenges, "Challenges fetched successfully"));
}));

// GET /courses/challenge/:challengeId - return single challenge
router.get("/challenge/:challengeId", verifyJWT, asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }
  return res.status(200).json(new ApiResponse(200, challenge, "Challenge fetched successfully"));
}));

// POST /courses/challenge/:challengeId/fork - Fork template repo
router.post("/challenge/:challengeId/fork", verifyJWT, asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user.githubAccessToken) {
    throw new ApiError(403, "Please link your GitHub account first");
  }

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  const templateOwner = process.env.GITHUB_TEMPLATE_OWNER;
  const url = `https://api.github.com/repos/${templateOwner}/${challenge.templateRepo}/forks`;

  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return res.status(201).json(
      new ApiResponse(201, {
        clone_url: response.data.clone_url,
        html_url: response.data.html_url,
      }, "Repository forked successfully")
    );
  } catch (error) {
    console.error("GitHub Fork Error:", error.response?.data || error.message);
    throw new ApiError(error.response?.status || 500, error.response?.data?.message || "Failed to fork repository");
  }
}));

// POST /courses/challenge/:challengeId/fetch-from-github
router.post("/challenge/:challengeId/fetch-from-github", verifyJWT, asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user.githubAccessToken || !user.githubUsername) {
    throw new ApiError(403, "Please link your GitHub account first");
  }

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  const url = `https://api.github.com/repos/${user.githubUsername}/${challenge.templateRepo}/contents/solution.js`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const code = Buffer.from(response.data.content, "base64").toString("utf-8");
    return res.status(200).json(new ApiResponse(200, { code }, "Code fetched successfully from GitHub"));
  } catch (error) {
    console.error("GitHub Fetch Error:", error.response?.data || error.message);
    throw new ApiError(error.response?.status || 500, "Failed to fetch solution.js from your repository. Make sure the file exists.");
  }
}));

// POST /courses/challenge/:challengeId/submit - Evaluate submitted code
router.post("/challenge/:challengeId/submit", verifyJWT, asyncHandler(async (req, res) => {
  const { challengeId } = req.params;
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, "Code is required for submission");
  }

  const challenge = await Challenge.findById(challengeId);
  if (!challenge) {
    throw new ApiError(404, "Challenge not found");
  }

  // Define paths
  const tempDir = path.join(process.cwd(), "server", "temp");
  const fileName = `${req.user._id}_${challengeId}_solution.js`;
  const tempFilePath = path.join(tempDir, fileName);

  try {
    // 1. Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // 2. Write code to temp file
    await fs.writeFile(tempFilePath, code);

    // 3. Prepare execution context
    // This implementation assumes challenges have a dedicated test folder
    // and we inject the student's code into it.
    // For this example, we'll assume the challenge test directory is:
    // server/challenges/{challengeId}
    const challengeDir = path.join(process.cwd(), "server", "challenges", challengeId.toString());
    
    // Copy the solution to the challenge directory temporarily for testing
    const targetSolutionPath = path.join(challengeDir, "solution.js");
    await fs.copyFile(tempFilePath, targetSolutionPath);

    // 4. Run tests
    // Using --json flag as per my open question assumption
    const { stdout, stderr } = await execAsync("npm test -- --json", { cwd: challengeDir }).catch(err => {
      // npm test might fail if some tests fail, which is expected
      return { stdout: err.stdout, stderr: err.stderr };
    });

    let results;
    try {
      results = JSON.parse(stdout);
    } catch (e) {
      console.error("Jest Output Parsing Error:", stdout);
      throw new ApiError(500, "Failed to parse test results");
    }

    // 5. Calculate score
    const passedCases = results.numPassedTests || 0;
    const totalCases = results.numTotalTests || 1; // avoid division by zero
    const score = Math.round((passedCases / totalCases) * 100);

    // 6. Save Submission
    const submission = await Submission.create({
      challengeId,
      userId: req.user._id,
      code,
      score,
      passedCases,
      totalCases,
    });

    // 7. Cleanup
    await fs.unlink(tempFilePath);
    await fs.unlink(targetSolutionPath).catch(() => {}); // cleanup copied file

    return res.status(201).json(new ApiResponse(201, {
      score,
      passedCases,
      totalCases,
      results: results.testResults
    }, "Submission evaluated successfully"));

  } catch (error) {
    console.error("Submission Error:", error);
    // Cleanup if something goes wrong
    await fs.unlink(tempFilePath).catch(() => {});
    throw new ApiError(error.statusCode || 500, error.message || "Internal server error during evaluation");
  }
}));

export default router;
