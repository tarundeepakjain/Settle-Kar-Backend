import express from "express";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import User from "../models/user.js";
const router=express.Router();

router.post('/new',async(req,res)=>{
    try {
        const {gname,desc,member,adminid}=req.body;
        const group=await Group.create({
            name:gname,
            description:desc,
            members:member,
            createdBy:adminid,
        })
            res.status(201).json({
      message: "group created sucesfully",
      
    });
    } catch (error) {
        console.log("ERROR:",error);
        res.status(500).json({ message: "Server error" });
    }
})
router.post('/add-member',async(req,res)=>{
    try {
        const {groupid,memberid,adminid}=req.body;
    const grp=await Group.findOne({_id:groupid,createdBy:adminid});
    if(!grp) {
        console.log("unauthorized");
        return res.status(401).json({"message":"Unauthorized access"});
    }
     if (grp.members.includes(memberid)) {
        console.log("already exists");
            return res.status(400).json({ message: "Member already in group" });
        }

        grp.members.push(memberid);
        console.log("user added sucesfully");
        await grp.save();
        return res.status(200).json({"message":"member added"});
    } catch (error) {
        res.status(500).json("error adding member:",error);
    }
    

})

router.delete('/delete-member',async(req,res)=>{
    try {
        const {groupid,memberid,adminid}=req.body;
        const grp=await Group.findOne({_id:groupid,createdBy:adminid});
    if(!grp) {
        console.log("unauthorized");
        return res.status(401).json({"message":"Unauthorized access"});
    }
    if (!grp.members.includes(memberid)) {
        console.log("Member to delete not found");
            return res.status(400).json({ message: "Member is not in group" });
        }
    grp.members=grp.members.filter(e=>e.toString()!==memberid.toString());
    await grp.save();
    console.log("member deleted");
    return res.status(200).json({"message":"member deleted"});
    } catch (error) {
         res.status(500).json("error deleting member:",error);
    }
})

router.delete('/delete',async(req,res)=>{
    try {
        const {groupid,adminid}=req.body;
        const grp=await Group.findOneAndDelete({_id:groupid,createdBy:adminid});
        if(!grp){
            console.log("unauthorized");
            return res.status(400).json({"message":"unauthorized"});

        }
        console.log("grp deleted");
        return res.status(200).json({"message":"grp deleted"});

    } catch (error) {
        res.status(500).json("error deleting grp:",error);
    }
})


export default router;