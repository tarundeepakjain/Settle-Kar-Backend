import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    gid: { type: String }, // internal optional ID
    name: { type: String, required: true },
    description: { type: String },
    balance: { type: Number, default: 0 },
    userBal: [{ type: Number, default: 0 }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expenses: [{paidby: { type: String },description: { type: String },amount: { type: Number },time: { type: Date }}], // can be Expense ref later
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inviteid: { type: String, unique: true },
  },
  { timestamps: true }
);

const GroupModel = mongoose.model("Group", groupSchema);
export default GroupModel;
