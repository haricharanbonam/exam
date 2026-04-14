import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import axios from "axios";

const router = Router();

// GET /github/link - Redirects to GitHub OAuth
router.get("/link", verifyJWT, (req, res) => {
  const GITHUB_AUTH_URL = `https://github.com/login/oauth/authorize`;
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: "read:user public_repo",
    state: req.user._id.toString(), // Store user ID in state for security/mapping
  });

  const url = `${GITHUB_AUTH_URL}?${params.toString()}`;

  // If the request expects JSON, return the URL instead of redirecting
  if (req.headers.accept?.includes("application/json") || req.query.json === "true") {
    return res.json(new ApiResponse(200, { url }, "Redirect URL generated"));
  }

  res.redirect(url);
});

// GET /github/callback - Handles redirect from GitHub
router.get("/callback", asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    throw new ApiError(400, "GitHub authorization code missing");
  }

  // 1. Exchange code for access token
  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  const { access_token } = tokenResponse.data;

  if (!access_token) {
    throw new ApiError(400, "Failed to obtain GitHub access token");
  }

  // 2. Fetch user details from GitHub
  const userResponse = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const githubUsername = userResponse.data.login;

  // 3. Update User document
  // Note: state contains the user ID we passed in /link
  const user = await User.findById(state);
  if (!user) {
    throw new ApiError(404, "User not found during GitHub callback");
  }

  user.githubAccessToken = access_token;
  user.githubUsername = githubUsername;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { githubUsername }, "GitHub account linked successfully"));
  
}));

export default router;
