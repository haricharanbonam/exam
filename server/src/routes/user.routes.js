import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import { getUserProfile } from "../controllers/test.controller.js";

const userRouter = Router();
userRouter.route("/login").post(loginUser);
userRouter.route("/register").post(registerUser);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/profile/:username").get(getUserProfile);

export default userRouter;
