import connectDB from "./db/Connection.js";
import dotenv from "dotenv";
import express from "express";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("server is running");
    });
  })
  .catch(() => {
    console.log("mongodb connection error");
  });
