import express from "express";
import jwt from "jsonwebtoken";
import GroupController from "../controllers/group.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import authenticate from "../middleware/auth.js";
import { GroupExpense } from "../tarun/expense.js";
import User from "../models/user.js";
const router = express.Router();
const ACCESS_SECRET = process.env.ACCESS_SECRET || "ava";


router.get("/my-groups",authenticate,async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate("members", "name email ");
    console.log(groups.json());
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups", error: err.message });
  }
});
router.post("/join",authenticate,async(req,res)=>{
  try {
    const userid=req.user.id;
    const {inviteid}=req.body;
    console.log("received body");
const exist = await Group.findOne({ inviteid });
if(!exist) return res.status(404).json({ message: "group not found" });
    const user=await User.findById(userid);
    if(user.groups.includes(exist._id)) return res.status(400).json({message:"user already in the group"});
    user.groups.push(exist._id);
    exist.members.push(user._id);
    await exist.save();
  
 await user.save();
  console.log("done adding");
  return res.status(201).json({message:"user added to group"});

  } catch (err) {
    res.status(500).json({ message: "Error adding user", error: err.message });
  }

});
router.post("/new",authenticate,  GroupController.createGroup);
router.post("/invite",  GroupController.Invite);
router.post("/add-member",  GroupController.addMember);
router.delete("/delete-member",  GroupController.deleteMember);

router.get("/:groupId", authenticate,async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "name email")
      .lean();

    // if (!group) return res.status(404).json({ message: "Group not found" });

    // const expenses = await Expense.find({ group: group._id })
    //   .populate("paidBy", "name")
    //   .sort({ createdAt: -1 });

    // group.expenses = expenses.map((exp) => ({
    //   _id: exp._id,
    //   description: exp.description,
    //   amount: exp.amount,
    //   paidBy: exp.paidBy,
    //   splits: exp.splits,
    // }));

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: "Error fetching group", error: err.message });
  }
});

router.post("/:groupId/add-expense",authenticate,GroupController.addExpense);
export default router;
