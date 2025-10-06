import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import user from "../models/user.js";

const router=express.Router();
const ACCESS_SECRET = process.env.ACCESS_SECRET || "ava";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ava";


function generateAccessToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, ACCESS_SECRET, { expiresIn: "10m" });
}
function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: "7d" });
}

router.post('/',async(req,res)=>{
    const {name,email,password}=req.body;
      console.log(req.body);
    try {
        const exist=await user.findOne({email});
        if(exist) return res.status(400).json({ error: "Email already exists!" });
        const User=new user({name,email,password});
        await User.save();
        console.log("user saved");
       return res.json({ ok: true, user: { id: User._id, email: User.email } });
    } catch (error) {
        console.log("Error:",error);
         return res.status(500).json({ error: "Server error occurred!" });
    }
})
router.post('/login',async(req,res)=>{
    const {email,password}=req.body;
    console.log(req.body);
    try {
        const exist=await user.findOne({email});
        if(!exist) return res.status(400).json({ error: "User does not exist,Kindly Signup first! " });
         if (password !== exist.password) {
        return res.status(401).json({ error: "Invalid credentials" });
         }
          const accessToken = generateAccessToken(exist);
    const refreshToken = generateRefreshToken(exist);
      
      exist.currentRefreshToken = refreshToken;
    await exist.save();
console.log(res.json);
    return res.json({
      accessToken,
      refreshToken,
      user: { id: exist._id, email: exist.email }
    });
    
    } catch (error) {
        console.log("Error:",error);
         return res.status(500).json({ error: "Server error occurred!" });
    }
})

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "No refresh token provided" });

    jwt.verify(refreshToken, REFRESH_SECRET, async (err, payload) => {
      if (err) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      const User = await user.findById(payload.id);
      if (!User) return res.status(401).json({ error: "User not found" });

      if (!User.currentRefreshToken || User.currentRefreshToken !== refreshToken) {
        return res.status(401).json({ error: "Refresh token revoked" });
      }
      const newAccessToken = generateAccessToken(User);
      const newRefreshToken = generateRefreshToken(User);

      User.currentRefreshToken = newRefreshToken;
      await User.save();
      return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {

    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: "No auth header" });

    const token = auth.split(" ")[1];
    jwt.verify(token, ACCESS_SECRET, async (err, payload) => {
      if (err) return res.status(401).json({ error: "Invalid access token" });

      const User = await user.findById(payload.id).select("-passwordHash -currentRefreshToken");
      if (!User) return res.status(404).json({ error: "User not found" });

      return res.json(User);
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});
export default router;
