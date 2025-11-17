import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    gid: { type: String }, // internal optional ID
    name: { type: String, required: true },
    description: { type: String },
    balance: { type: Number, default: 0 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    inviteid: { type: String, unique: true },
    userBal: [{userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },balance: { type: Number, default: 0 }}],
    expenses: [
      {
        paidby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        description: String,
        amount: Number,
        time: Date,
        splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
      }
    ],
  },
  { timestamps: true }
);

const GroupModel = mongoose.model("Group", groupSchema);
export default GroupModel;
