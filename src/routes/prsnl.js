import express from "express";
import multer from "multer";
import prsnl from "../models/prsnl.js";
import user from "../models"
const router=express.Router();

router.post('/',async(req,res)=>{
const {uid,expense}=req.body;

})

export default router;