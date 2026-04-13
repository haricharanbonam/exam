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
  logViolation,
  getInstructorDashboard,
  getMyCreatedTests,
} from "../controllers/test.controller.js";
const testRouter = Router();
testRouter.post("/create", verifyJWT, createTest);
testRouter.get("/interface/:id", verifyJWT, testInterface);
testRouter.post("/start", verifyJWT, handleStart);
testRouter.post("/resume", verifyJWT, handleResume);
testRouter.post("/question", verifyJWT, handleQuestion);
testRouter.post("/submit", verifyJWT, handleSubmit);
testRouter.post("/violation", verifyJWT, logViolation);
testRouter.get("/instructor/dashboard/:examCode", verifyJWT, getInstructorDashboard);
testRouter.get("/instructor/my-tests", verifyJWT, getMyCreatedTests);
testRouter.get("/results", verifyJWT, getAllResults);
export default testRouter;
