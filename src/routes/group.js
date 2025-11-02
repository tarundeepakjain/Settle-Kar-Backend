import express from "express";
import jwt from "jsonwebtoken";
import GroupController from "../controllers/group.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import authenticate from "../middleware/auth.js";
import { GroupExpense } from "../tarun/expense.js";
const router = express.Router();
const ACCESS_SECRET = process.env.ACCESS_SECRET || "ava";


router.get("/my-groups", async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate("members", "name email");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups", error: err.message });
  }
});

router.post("/new",  GroupController.createGroup);
router.post("/invite",  GroupController.Invite);
router.post("/add-member",  GroupController.addMember);
router.delete("/delete-member",  GroupController.deleteMember);

router.post("/:groupId/add-expense",GroupController.addExpense);

export default router;
