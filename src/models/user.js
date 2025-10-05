import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
   groups: [{ groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true } }],
   amountowed:{type:Number, default:0}
},
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);

export default User;
