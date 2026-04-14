import mongoose, { Schema } from "mongoose";

const challengeSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    problemStatement: {
      type: String,
      required: true,
    },
    boilerplateCode: {
      type: String,
      required: true,
    },
    templateRepo: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "javascript",
    },
    testCases: [
      {
        input: {
          type: Schema.Types.Mixed,
        },
        expectedOutput: {
          type: Schema.Types.Mixed,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Challenge = mongoose.models.Challenge || mongoose.model("Challenge", challengeSchema);
