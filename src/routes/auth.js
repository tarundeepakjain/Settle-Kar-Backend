import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../tarun/user.js"; // ✅ Ensure this model exports mongoose.model('User', userSchema)
import Userm from "../models/user.js";
import authenticate from "../middleware/auth.js";
import Otp from "../models/otp.js";
const router = express.Router();
const otpStore = new Map();

async function sendOtpEmail(email, otp) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "SettleKar", email: "settlekarofficial@gmail.com" },
      to: [{ email }],
      subject: "Settle-Kar OTP",
      htmlContent: `
        <div style="font-family:Arial,sans-serif">
          <h2>Your OTP for Settle-Kar Signup is</h2>
          <h1 style="color:#4CAF50">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Brevo Error:", errText);
    throw new Error("Failed to send OTP via Brevo API");
  }
}

const ACCESS_SECRET = process.env.ACCESS_SECRET || "ava";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ava";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    ACCESS_SECRET,
    { expiresIn: "59m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: "7d" });
}

router.post("/", async (req, res) => {
  const { name, email, password} = req.body;

  try {
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ MessageEvent: "Email already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Userm({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await newUser.save();

    const accessToken = generateAccessToken(savedUser);
    const refreshToken = generateRefreshToken(savedUser);
    savedUser.currentRefreshToken = refreshToken;
    await savedUser.save();

    return res.json({
      message: "Signup successful",
      accessToken,
      refreshToken,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error occurred!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const exist = await User.findOne({ email });
    if (!exist)
      return res
        .status(400)
        .json({ error: "User does not exist. Kindly signup first!" });

    const isMatch = await bcrypt.compare(password, exist.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(exist);
    const refreshToken = generateRefreshToken(exist);
    exist.currentRefreshToken = refreshToken;
    await exist.save();

    return res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: exist._id,
        name: exist.name,
        email: exist.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error occurred!" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ error: "No refresh token provided" });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const existingUser = await Userm.findById(payload.id);
    if (!existingUser)
      return res.status(401).json({ error: "User not found" });

    if (existingUser.currentRefreshToken !== refreshToken)
      return res.status(401).json({ error: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(existingUser);
    return res.json({ accessToken: newAccessToken, refreshToken });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No auth header" });
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = await Userm.findById(payload.id).select(
      "-password -currentRefreshToken"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid access token" });
  }
});
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
 
    await sendOtpEmail(email,otp);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// --- VERIFY OTP ---
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await Otp.findOne({ email, otp });

    if (!record) return res.status(400).json({ message: "Invalid or expired OTP" });

    await Otp.deleteMany({ email }); // clear OTPs once verified
    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
});

router.get("/transaction",authenticate,async(req,res)=>{
try {
  const userid=req.user.id;
  const user=await Userm.findById(userid);
  if(!user) return res.status(404).json({ error: "User not found" });
  
  const formattedTransactions = user.transactions.map(tx => ({
      type:tx.type || "prsnl",   
      title: tx.data?.description || "No description",
      amount: tx.data?.amount || 0,
      date: tx.data?.time || tx.createdAt,
    }));

    return res.status(200).json({
      message: "Transactions fetched successfully",
      transactions: formattedTransactions,
    });
 
} catch (error) {
   console.error(error);
    return res.status(401).json({ error: "error" });
}
})
export default router;
