import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import {
  createTest,
  testInterface,
  handleStart,
  handleQuestion,
  handleSubmit,
  getAllTests,
  handleResume,
  getAllResults,
} from "../controllers/test.controller.js";
const testRouter = Router();
testRouter.post("/create", verifyJWT, createTest);
testRouter.get("/interface/:id", verifyJWT, testInterface);
testRouter.post("/start", verifyJWT, handleStart);
testRouter.post("/resume", verifyJWT, handleResume);
testRouter.post("/question", verifyJWT, handleQuestion);
testRouter.post("/submit", verifyJWT, handleSubmit);
// testRouter.get("/justtest", getAllTests);
testRouter.get("/results", verifyJWT, getAllResults);
export default testRouter;
