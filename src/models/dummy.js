import mongoose from "mongoose";

const grptracker = new mongoose.Schema(
  {
    num:{type:String, default:"000001"}
  },
  { timestamps: true }
);

const tracker= mongoose.model("Expense", grptracker);
export default tracker;
