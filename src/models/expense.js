// models/expense.js – FINAL FIXED VERSION
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  description: { 
    type: String,
    required: true 
  },

  amount: { 
    type: Number, 
    required: true 
  },

  time: { 
    type: Date, 
    default: Date.now 
  },

  // User who PAID
  paidby: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },

  // Users among whom the expense is SPLIT
  splitAmong: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true    // users must be valid
    }
  ],

}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);
