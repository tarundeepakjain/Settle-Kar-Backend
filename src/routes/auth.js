import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../tarun/user.js";

const router = express.Router();
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const ACCESS_SECRET = process.env.ACCESS_SECRET || "ava";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ava";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

function generateAccessToken(user) {
  return jwt.sign({ id: user._id,name: user.name, email: user.email }, ACCESS_SECRET, { expiresIn: "10m" });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: "7d" });
}

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ error: "Email already exists!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User(name, email, hashedPassword);
    const savedUser = await newUser.save();

    const accessToken = generateAccessToken(savedUser);
    const refreshToken = generateRefreshToken(savedUser);
    savedUser.currentRefreshToken = refreshToken;
    await savedUser.save();

    return res.json({
      accessToken,
      refreshToken,
      user: { id: savedUser._id,name: savedUser.name, email: savedUser.email },
    });
  } catch (error) {
    return res.status(500).json({ error: "Server error occurred!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const exist = await User.findOne({ email });
    if (!exist) return res.status(400).json({ error: "User does not exist. Kindly signup first!" });

    const isMatch = await bcrypt.compare(password, exist.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(exist);
    const refreshToken = generateRefreshToken(exist);
    exist.currentRefreshToken = refreshToken;
    await exist.save();
    return res.json({
      accessToken,
      refreshToken,
      user: { id: exist._id,name:exist.name, email: exist.email },
    });
  } catch {
    return res.status(500).json({ error: "Server error occurred!" });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const existingUser = await User.findById(payload.id);
    if (!existingUser) return res.status(401).json({ error: "User not found" });

    if (!existingUser.currentRefreshToken || existingUser.currentRefreshToken !== refreshToken)
      return res.status(401).json({ error: "Refresh token revoked" });

    const newAccessToken = generateAccessToken(existingUser);
    const newRefreshToken = generateRefreshToken(existingUser);
    existingUser.currentRefreshToken = newRefreshToken;
    await existingUser.save();

    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No auth header" });
    const token = auth.split(" ")[1];
    const payload = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(payload.id).select("-password -currentRefreshToken");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch {
    return res.status(401).json({ error: "Invalid access token" });
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    await transporter.sendMail({
      from: `"SettleKar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family:Arial,sans-serif">
          <h2>OTP Verification for Resetting Password on SettleKar</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color:#4CAF50">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        </div>
      `,
    });
    return res.status(200).json({ message: "OTP sent to email!" });
  } catch {
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ error: "OTP not found or expired. Please try again." });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ error: "OTP expired" });
  }
  if (parseInt(otp) !== record.otp) return res.status(400).json({ error: "Invalid OTP" });
  otpStore.delete(email);
  return res.status(200).json({ message: "OTP verified successfully!" });
});

export default router;
