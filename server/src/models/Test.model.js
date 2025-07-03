import mongoose, { Schema } from "mongoose";

const testSchema = new Schema({
  title: String,
  description: String,
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  startTime: Date,
  endTime: Date,
  durationMinutes: Number,
  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswerIndex: Number,
    },
  ],
});

testSchema.virtual("numberOfQuestions").get(function () {
  return this.questions ? this.questions.length : 0;
});

export const Test = mongoose.model("Test", testSchema);
