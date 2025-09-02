import express from "express";
import user from "../models/user.js";

const router=express.Router();

router.post('/',async(req,res)=>{
    const {username,password}=req.body;
    try {
        const exist=await user.findOne({username});
        if(exist) return res.status(400).json({ error: "Email already exists!" });
        const User=new user({username,password});
        await User.save();
        console.log("user saved");
        console.log(User);
        return res.json(User);
    } catch (error) {
        console.log("Error:",error);
         return res.status(500).json({ error: "Server error occurred!" });
    }
})
export default router;
