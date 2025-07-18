import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import testRouter from "./routes/test.router.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import { ApiError } from "./utils/ApiError.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import { Test } from "./models/Test.model.js";
import { Response } from "./models/Response.model.js";
import bodyParser from "body-parser"

const app = express();

// app.use() //used for middleware and conifgurations
// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   }),
// );

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "5mb" }));

app.use(
  express.json({
    //we can configure it to accept the json from the express
    limit: "16kb",
  })
);

app.use("/", (req, res, next) => {
  console.log(req.method + req.url);
  next();
});
app.use("/", (req, res, next) => {
  req.time = new Date().toISOString();
  next();
});

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.get("/check", async (req, res) => {
  try {
    const testId = "686d26f3f7523a92f1788555";
    const newStartTime = new Date(); // Set current time
    const newEndTime = new Date();
    newEndTime.setDate(newEndTime.getDate() + 1); // Add 1 day to current time
    const updatedTest = await Test.findOneAndUpdate(
      { examCode: "JSFUN123" },
      {
        startTime: newStartTime,
        endTime: newEndTime,
        submit: false,
      },
      { new: true }
    );

    if (!updatedTest) {
      return res.status(404).json({ message: "Test not found." });
    }
    const rest = await Response.deleteMany({
 
    });

    res.json(updatedTest);
  } catch (error) {
    console.error("Error updating test time:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/detect", (req, res) => {
  res.json({
    objects: {
      person: 1,
      laptop: 0,
    },
    suspicious: false,
  });
});

app.use(express.static("public"));

app.use(cookieParser());

app.use("/user", userRouter);

app.use("/test", testRouter);

export { app };
