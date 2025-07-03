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
  submit:{
    type: Boolean,
    default: false, 
  }
});


export const  Response = mongoose.model("Response",responseSchema);