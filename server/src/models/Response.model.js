import mongoose,{Schema} from "mongoose";

const responseSchema = new Schema({
  test: { type: Schema.Types.ObjectId, ref: "Test" },
  person: { type: Schema.Types.ObjectId, ref: "User" },
  startedAt: Date,
  completedAt: Date,
  answers: [
    {
      questionIndex: Number, 
      selectedOptionIndex: Number,
    },
  ],
  score: Number, 
  violations: [
    {
      type: { type: String },
      severity: {
        type: String,
        enum: ["warning", "violation"],
        default: "violation",
      },
      snapshot: { type: String }, // Optional base64 or URL
      metadata: { type: Schema.Types.Mixed },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  trustScore: {
    type: Number,
    default: 100,
  },
  submit:{
    type: Boolean,
    default: false, 
  },
});


export const  Response = mongoose.model("Response",responseSchema);