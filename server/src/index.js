import connectDB from "./db/Connection.js";
import dotenv from "dotenv";
import express from "express";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
const server = app.listen(3000, () => {
  console.log("Server running on port 3000");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error("❌ Port 3000 is already in use!");
    process.exit(1);
  } else {
    console.error(err);
  }
});
  })
  .catch(() => {
    console.log("mongodb connection error");
  });
