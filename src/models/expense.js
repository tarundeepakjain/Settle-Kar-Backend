// models/expenseModel.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    time: { type: Date, default: Date.now },
    paidby: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // only for GroupExpense
  },
  { timestamps: true }
);

const expenseModel = mongoose.model("Expense", expenseSchema);
export default expenseModel;
