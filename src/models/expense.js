import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  description: { type: String },
  amount: { type: Number, required: true },
  time: { type: Date, default: Date.now },

  // NEW FIELD
  paidby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // NEW FIELD
  splitAmong: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ]
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
