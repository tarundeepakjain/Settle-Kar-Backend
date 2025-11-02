import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],

  currentRefreshToken: { type: String, default: null },
  otp:{type: Number},
  createdAt: { type: Date, default: Date.now }
}
 
);
const User = mongoose.model("User", userSchema);

export default User;
