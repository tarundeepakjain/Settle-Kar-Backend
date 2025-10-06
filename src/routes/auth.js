import express from "express";
import user from "../models/user.js";

const router=express.Router();

router.post('/',async(req,res)=>{
    const {name,email,password}=req.body;
      console.log(req.body);
    try {
        const exist=await user.findOne({email});
        if(exist) return res.status(400).json({ error: "Email already exists!" });
        const User=new user({name,email,password});
        await User.save();
        console.log("user saved");
        console.log(User);
        return res.json(User);
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
         if (password === exist.password) {
      return res.status(200).json({ message: "Login successful", user: exist });
    } else {
      return res.status(400).json({ error: "Incorrect password" });
    }
    } catch (error) {
        console.log("Error:",error);
         return res.status(500).json({ error: "Server error occurred!" });
    }
})
export default router;
