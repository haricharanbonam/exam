import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
  attempt: {
    type: Schema.Types.ObjectId,
    ref: "Response",
    required: true,
    index: true,
    unique: true,
  },
  test: {
    type: Schema.Types.ObjectId,
    ref: "Test",
    required: true,
    index: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  description: {
    type: String,
    default: "",
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Feedback = mongoose.model("Feedback", feedbackSchema);
