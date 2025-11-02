import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  balance: { type: Number, default: 0 },  // ✅ added to match class

  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],

  transactions: [
    {
      type: {
        type: String,
        enum: ["group", "personal"],
        required: true,
      },
      data: {
        type: Object,
        required: true,
      },
      createdAt: { type: Date, default: Date.now },
    }
  ],

  currentRefreshToken: { type: String, default: null },
  otp: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const userModel = mongoose.model("User", userSchema);
export default userModel;
