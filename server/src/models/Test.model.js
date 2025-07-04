import mongoose, { Schema } from "mongoose";

const testSchema = new Schema({
  title: String,
  description: String,
  examCode: { type: String, unique: true },
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  startTime: Date,
  endTime: Date,
  durationMinutes: Number,
  numberOfQuestions: { type: Number, default: 0 },
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswerIndex: Number,
    },
  ],
});

export const Test = mongoose.model("Test", testSchema);
