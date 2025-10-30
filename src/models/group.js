import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    gid: { type: String }, // optional internal group id (if not auto-generated)
    name: { type: String, required: true },
    description: { type: String },

    balance: { type: Number, default: 0 },

    userBal: [{ type: Number, default: 0 }],

    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    expenses: [{ type: Object }], // you can later replace with expense schema ref

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    inviteid: { type: String },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
