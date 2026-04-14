import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    passedCases: {
      type: Number,
      required: true,
    },
    totalCases: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
