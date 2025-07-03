import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    console.log(
      `the data base is connected succesfully  at ${connectionInstance}\n`
    );
  } catch (error) {
    console.log("mongodb connection failed",error);
    process.exit(1);
  }
};

export default connectDB;
