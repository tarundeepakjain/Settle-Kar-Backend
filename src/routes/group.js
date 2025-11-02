import express from "express";
import jwt from "jsonwebtoken";
import GroupController from "../controllers/group.js";
import Group from "../models/group.js";
import Expense from "../models/expense.js";
import authenticate from "../middleware/auth.js";
import { GroupExpense } from "../tarun/expense.js";
const router = express.Router();
const ACCESS_SECRET = process.env.ACCESS_SECRET || "ava";


router.get("/my-groups",authenticate,async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).populate("members", "name email");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Error fetching groups", error: err.message });
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

router.get("/:groupId/expenses", authenticate,async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const expenses = await Expense.find({ group: group._id })
      .populate("paidBy", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
});

router.post("/:groupId/expenses", async (req, res) => {
  const { description, amount, paidById, splits } = req.body;

  if (!description || !amount || !paidById) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // ✅ Find group
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // ✅ Create Expense class object
    const expense = new GroupExpense(
      paidById,
      description,
      Number(amount),
      new Date()
    );

    // ✅ Convert class -> JSON to embed inside group
    const expenseJSON = expense.toJSON();

    // ✅ Push inside group.expenses[]
    group.expenses.push(expenseJSON);

    // ✅ Save group
    await group.save();

    // ✅ Send the new embedded expense back
    res.status(201).json({
      message: "Expense added successfully",
      expense: expenseJSON,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error adding expense",
      error: err.message,
    });
  }
});

export default router;
